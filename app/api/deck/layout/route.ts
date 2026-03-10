import { NextRequest, NextResponse } from "next/server";
import { getBoardDimensions } from "@/lib/deck/queries";
import { calculateBoardLayout } from "@/lib/canvas/board-layout";
import { optimizeCutoffs } from "@/lib/canvas/cutoff-optimizer";
import type { BoardPiece, JoistPiece, BearerPiece, LayoutApiResponse } from "@/types/deck";

/**
 * POST /api/deck/layout
 * Accepts `polygons` (array, one per shape) OR legacy `polygon` (single).
 * Also accepts `invertedPolygons` for cutout shapes.
 * Tries all available deck board widths and picks the one with lowest waste.
 * Returns combined board/joist/bearer positions and BOM.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { polygon, polygons, invertedPolygons, material_type_id, board_direction_deg = 0 } = body;

    // Support both multi-shape (polygons[]) and legacy single polygon
    const polyList: [number, number][][] = polygons && Array.isArray(polygons) && polygons.length > 0
      ? polygons
      : (polygon && Array.isArray(polygon) && polygon.length >= 3 ? [polygon] : []);

    const invertedPolyList: [number, number][][] =
      invertedPolygons && Array.isArray(invertedPolygons) ? invertedPolygons : [];

    if (polyList.length === 0 || !material_type_id) {
      return NextResponse.json(
        { error: "polygons (array of 3+ points each) and material_type_id are required" },
        { status: 400 }
      );
    }

    // Fetch board dimensions for this material
    const dims = await getBoardDimensions(material_type_id);

    const deckBoards = dims.filter((d) => d.board_type === "deck_board");
    const joistDim = dims.find((d) => d.board_type === "joist");
    const bearerDim = dims.find((d) => d.board_type === "bearer");

    if (deckBoards.length === 0) {
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
    const bearerSpacing = 2400;

    // Re-aggregate BOM from merged pieces using greedy bin-packing.
    function aggregateStock(pieces: Array<{ stock_length_mm: number; length_mm: number }>) {
      const groups = new Map<number, number[]>();
      for (const p of pieces) {
        const cuts = groups.get(p.stock_length_mm) ?? [];
        cuts.push(p.length_mm);
        groups.set(p.stock_length_mm, cuts);
      }
      return Array.from(groups.entries()).map(([stock_length_mm, cuts]) => {
        cuts.sort((a, b) => b - a);
        const remaining: number[] = [];
        for (const cut of cuts) {
          const idx = remaining.findIndex(r => r >= cut);
          if (idx >= 0) { remaining[idx] -= cut; } else { remaining.push(stock_length_mm - cut); }
        }
        return { stock_length_mm, quantity: remaining.length };
      }).sort((a, b) => a.stock_length_mm - b.stock_length_mm);
    }

    // Try each deck board candidate; pick the one with lowest waste_percent
    let bestAllBoards: BoardPiece[] = [];
    let bestAllJoists: JoistPiece[] = [];
    let bestAllBearers: BearerPiece[] = [];
    let bestTotalScrews = 0;
    let bestWaste = Infinity;
    let bestWinnerDeckBoard = deckBoards[0];
    let bestCutoffMetrics = null;

    for (const deckBoard of deckBoards) {
      const joistSpacing = deckBoard.thickness_mm * 20;
      const layoutParams = {
        boardThickness_mm: deckBoard.thickness_mm,
        availableLengths_mm: deckBoard.available_lengths_mm,
        boardDirection_deg: board_direction_deg,
        boardGap_mm: 5,
        joistSpacing_mm: joistSpacing,
        bearerSpacing_mm: bearerSpacing,
        joistDimension: { width_mm: joistWidth, thickness_mm: joistThickness, availableLengths_mm: joistLengths },
        bearerDimension: { width_mm: bearerWidth, thickness_mm: bearerThickness, availableLengths_mm: bearerLengths },
        invertedPolygons: invertedPolyList,
      };

      const allBoards: BoardPiece[] = [];
      const allJoists: JoistPiece[] = [];
      const allBearers: BearerPiece[] = [];
      let totalScrews = 0;

      for (let si = 0; si < polyList.length; si++) {
        const poly = polyList[si];
        if (!Array.isArray(poly) || poly.length < 3) continue;

        const result = calculateBoardLayout({
          polygon: poly as [number, number][],
          boardWidth_mm: deckBoard.width_mm,
          ...layoutParams,
        });

        const prefix = `s${si}-`;
        for (const b of result.boards) allBoards.push({ ...b, id: prefix + b.id });
        for (const j of result.joists) allJoists.push({ ...j, id: prefix + j.id });
        for (const b of result.bearers) allBearers.push({ ...b, id: prefix + b.id });
        totalScrews += result.bom.screws_count;
      }

      // Run cutoff optimizer to get waste_percent
      const pricePerMetre = deckBoard.price_per_metre_cents ?? 0;
      const { metrics: cutoffMetrics } = optimizeCutoffs({
        cuts: allBoards.map((b) => ({ id: b.id, required_length_mm: b.cut_length_mm })),
        availableLengths_mm: deckBoard.available_lengths_mm,
        kerf_mm: 3,
        minUsableOffcut_mm: 300,
        pricePerMetre_cents: pricePerMetre,
      });

      const waste = cutoffMetrics.waste_percent;
      // Pick lowest waste; tiebreak: wider board wins
      if (waste < bestWaste || (waste === bestWaste && deckBoard.width_mm > bestWinnerDeckBoard.width_mm)) {
        bestWaste = waste;
        bestAllBoards = allBoards;
        bestAllJoists = allJoists;
        bestAllBearers = allBearers;
        bestTotalScrews = totalScrews;
        bestWinnerDeckBoard = deckBoard;
        bestCutoffMetrics = cutoffMetrics;
      }
    }

    const mergedLayout = {
      boards: bestAllBoards,
      joists: bestAllJoists,
      bearers: bestAllBearers,
      bom: {
        boards: aggregateStock(bestAllBoards),
        joists: aggregateStock(bestAllJoists),
        bearers: aggregateStock(bestAllBearers),
        screws_count: bestTotalScrews,
        total_boards: bestAllBoards.length,
        total_joists: bestAllJoists.length,
        total_bearers: bestAllBearers.length,
        board_width_mm: bestWinnerDeckBoard.width_mm,
      },
    };

    const response: LayoutApiResponse = { layout: mergedLayout, cutoffMetrics: bestCutoffMetrics! };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Layout calculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
