import { NextRequest, NextResponse } from "next/server";
import { getBoardDimensions } from "@/lib/deck/queries";
import { calculateBoardLayout } from "@/lib/canvas/board-layout";
import { optimizeCutoffs } from "@/lib/canvas/cutoff-optimizer";
import type { LayoutApiResponse } from "@/types/deck";

/**
 * POST /api/deck/layout
 * Runs the board layout engine + cutoff optimizer for a given polygon + material.
 * Returns board/joist/bearer positions and BOM for canvas overlay & pricing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { polygon, material_type_id, board_direction_deg = 0 } = body;

    if (
      !polygon ||
      !Array.isArray(polygon) ||
      polygon.length < 3 ||
      !material_type_id
    ) {
      return NextResponse.json(
        { error: "polygon (3+ points) and material_type_id are required" },
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

    // Defaults for joist/bearer if not defined in DB
    const joistWidth = joistDim?.width_mm ?? 38;
    const joistThickness = joistDim?.thickness_mm ?? 152;
    const joistLengths = joistDim?.available_lengths_mm ?? [3600, 4800, 6000];

    const bearerWidth = bearerDim?.width_mm ?? 76;
    const bearerThickness = bearerDim?.thickness_mm ?? 228;
    const bearerLengths = bearerDim?.available_lengths_mm ?? [3600, 4800, 6000];

    // SANS 10082: joist spacing = 20 × board thickness
    const joistSpacing = deckBoard.thickness_mm * 20;
    const bearerSpacing = 2400; // standard 2400mm centres

    // Run the board layout engine
    const layout = calculateBoardLayout({
      polygon: polygon as [number, number][],
      boardWidth_mm: deckBoard.width_mm,
      boardThickness_mm: deckBoard.thickness_mm,
      availableLengths_mm: deckBoard.available_lengths_mm,
      boardDirection_deg: board_direction_deg,
      boardGap_mm: 5, // default 5mm gap
      joistSpacing_mm: joistSpacing,
      bearerSpacing_mm: bearerSpacing,
      joistDimension: {
        width_mm: joistWidth,
        thickness_mm: joistThickness,
        availableLengths_mm: joistLengths,
      },
      bearerDimension: {
        width_mm: bearerWidth,
        thickness_mm: bearerThickness,
        availableLengths_mm: bearerLengths,
      },
    });

    // Run cutoff optimizer on the board pieces
    const pricePerMetre = deckBoard.price_per_metre_cents ?? 0;
    const { metrics: cutoffMetrics } = optimizeCutoffs({
      cuts: layout.boards.map((b) => ({
        id: b.id,
        required_length_mm: b.cut_length_mm,
      })),
      availableLengths_mm: deckBoard.available_lengths_mm,
      kerf_mm: 3,
      minUsableOffcut_mm: 300,
      pricePerMetre_cents: pricePerMetre,
    });

    const response: LayoutApiResponse = { layout, cutoffMetrics };
    return NextResponse.json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Layout calculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
