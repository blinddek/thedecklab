import { NextRequest, NextResponse } from "next/server";
import {
  getMaterials,
  getDeckTypes,
  getBoardDirections,
  getBoardProfiles,
  getFinishOptions,
  getConfiguratorExtras,
  getExtrasPricing,
  getRatesForMaterial,
} from "@/lib/deck/queries";

/**
 * GET /api/deck/options
 * Returns all configurator options for the deck builder UI.
 * Optional ?material_type_id= for material-specific data.
 */
export async function GET(req: NextRequest) {
  try {
    const materialTypeId = req.nextUrl.searchParams.get("material_type_id");

    const [materials, deckTypes, directions, profiles, extras] =
      await Promise.all([
        getMaterials(),
        getDeckTypes(),
        getBoardDirections(),
        getBoardProfiles(),
        getConfiguratorExtras(),
      ]);

    let finishOptions = null;
    let rates = null;
    const extrasPricing: Record<string, Awaited<ReturnType<typeof getExtrasPricing>>> = {};

    if (materialTypeId) {
      [finishOptions, rates] = await Promise.all([
        getFinishOptions(materialTypeId),
        getRatesForMaterial(materialTypeId),
      ]);

      // Fetch pricing for each extra
      const pricingResults = await Promise.all(
        extras.map((e) => getExtrasPricing(e.id, materialTypeId))
      );
      extras.forEach((e, i) => {
        extrasPricing[e.id] = pricingResults[i];
      });
    }

    return NextResponse.json({
      materials,
      deck_types: deckTypes,
      directions,
      profiles,
      extras,
      finish_options: finishOptions,
      rates,
      extras_pricing: extrasPricing,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load options";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
