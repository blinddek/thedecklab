import { NextRequest, NextResponse } from "next/server";
import { getBoardDimensions } from "@/lib/deck/queries";
import { calculateBoardLayout } from "@/lib/canvas/board-layout";
import { optimizeCutoffs } from "@/lib/canvas/cutoff-optimizer";
import type { BoardPiece, JoistPiece, BearerPiece, LayoutApiResponse } from "@/types/deck";

/**
 * POST /api/deck/layout
 * Accepts `polygons` (array, one per shape) OR legacy `polygon` (single).
 * Runs the board layout engine for each polygon and merges the results.
 * Returns combined board/joist/bearer positions and BOM.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { polygon, polygons, material_type_id, board_direction_deg = 0 } = body;

    // Support both multi-shape (polygons[]) and legacy single polygon
    const polyList: [number, number][][] = polygons && Array.isArray(polygons) && polygons.length > 0
      ? polygons
      : (polygon && Array.isArray(polygon) && polygon.length >= 3 ? [polygon] : []);

    if (polyList.length === 0 || !material_type_id) {
      return NextResponse.json(
        { error: "polygons (array of 3+ points each) and material_type_id are required" },
        { status: 400 }
      );
    }

    // Fetch board dimensions for this material
    const dims = await getBoardDimensions(material_type_id);

    const deckBoard = dims.find((d) => d.board_type === "deck_board");
    const joistDim = dims.find((d) => d.board_type === "joist");
    const bearerDim = dims.find((d) => d.board_type === "bearer");

    if (!deckBoard) {
      return NextResponse.json(
        { error: "No deck board dimensions found for this material" },
        { status: 404 }
      );
    }

    const joistWidth = joistDim?.width_mm ?? 38;
    const joistThickness = joistDim?.thickness_mm ?? 152;
    const joistLengths = joistDim?.available_lengths_mm ?? [3600, 4800, 6000];
    const bearerWidth = bearerDim?.width_mm ?? 76;
    const bearerThickness = bearerDim?.thickness_mm ?? 228;
    const bearerLengths = bearerDim?.available_lengths_mm ?? [3600, 4800, 6000];
    const joistSpacing = deckBoard.thickness_mm * 20;
    const bearerSpacing = 2400;

    const layoutParams = {
      boardWidth_mm: deckBoard.width_mm,
      boardThickness_mm: deckBoard.thickness_mm,
      availableLengths_mm: deckBoard.available_lengths_mm,
      boardDirection_deg: board_direction_deg,
      boardGap_mm: 5,
      joistSpacing_mm: joistSpacing,
      bearerSpacing_mm: bearerSpacing,
      joistDimension: { width_mm: joistWidth, thickness_mm: joistThickness, availableLengths_mm: joistLengths },
      bearerDimension: { width_mm: bearerWidth, thickness_mm: bearerThickness, availableLengths_mm: bearerLengths },
    };

    // Compute layout for each polygon and merge, re-indexing piece IDs
    const allBoards: BoardPiece[] = [];
    const allJoists: JoistPiece[] = [];
    const allBearers: BearerPiece[] = [];
    let totalScrews = 0;

    for (let si = 0; si < polyList.length; si++) {
      const poly = polyList[si];
      if (!Array.isArray(poly) || poly.length < 3) continue;

      const result = calculateBoardLayout({ polygon: poly as [number, number][], ...layoutParams });

      const prefix = `s${si}-`;
      for (const b of result.boards) allBoards.push({ ...b, id: prefix + b.id });
      for (const j of result.joists) allJoists.push({ ...j, id: prefix + j.id });
      for (const b of result.bearers) allBearers.push({ ...b, id: prefix + b.id });
      totalScrews += result.bom.screws_count;
    }

    // Re-aggregate BOM from merged pieces
    function aggregateStock(pieces: Array<{ stock_length_mm: number }>) {
      const map = new Map<number, number>();
      for (const p of pieces) map.set(p.stock_length_mm, (map.get(p.stock_length_mm) ?? 0) + 1);
      return Array.from(map.entries())
        .map(([stock_length_mm, quantity]) => ({ stock_length_mm, quantity }))
        .sort((a, b) => a.stock_length_mm - b.stock_length_mm);
    }

    const mergedLayout = {
      boards: allBoards,
      joists: allJoists,
      bearers: allBearers,
      bom: {
        boards: aggregateStock(allBoards),
        joists: aggregateStock(allJoists),
        bearers: aggregateStock(allBearers),
        screws_count: totalScrews,
        total_boards: allBoards.length,
        total_joists: allJoists.length,
        total_bearers: allBearers.length,
      },
    };

    // Run cutoff optimizer on all board pieces combined
    const pricePerMetre = deckBoard.price_per_metre_cents ?? 0;
    const { metrics: cutoffMetrics } = optimizeCutoffs({
      cuts: allBoards.map((b) => ({ id: b.id, required_length_mm: b.cut_length_mm })),
      availableLengths_mm: deckBoard.available_lengths_mm,
      kerf_mm: 3,
      minUsableOffcut_mm: 300,
      pricePerMetre_cents: pricePerMetre,
    });

    const response: LayoutApiResponse = { layout: mergedLayout, cutoffMetrics };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Layout calculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
