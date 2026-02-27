import { NextRequest, NextResponse } from "next/server";
import { calculateDeckPrice } from "@/lib/pricing/configurator";

/**
 * POST /api/deck/calculate
 * Returns customer-facing deck price breakdown.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deck_type_id,
      material_type_id,
      length_m,
      width_m,
      board_direction_id,
      board_profile_id,
      finish_option_id,
      include_installation,
      extras,
      bom,
    } = body;

    if (!deck_type_id || !material_type_id || !length_m || !width_m || !board_direction_id || !board_profile_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const area = Number(length_m) * Number(width_m);
    if (area < 1 || area > 200) {
      return NextResponse.json(
        { error: "Deck area must be between 1 and 200 m²" },
        { status: 400 }
      );
    }

    const quote = await calculateDeckPrice({
      deck_type_id,
      material_type_id,
      length_m: Number(length_m),
      width_m: Number(width_m),
      board_direction_id,
      board_profile_id,
      finish_option_id: finish_option_id || undefined,
      include_installation: include_installation ?? false,
      extras: extras ?? [],
      bom: bom ?? undefined,
    });

    return NextResponse.json(quote);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
