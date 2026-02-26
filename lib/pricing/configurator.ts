import { createClient } from "@/lib/supabase/server";
import type { DeckConfig, DeckQuote, RateType } from "@/types/deck";

/**
 * Core deck configurator pricing engine.
 * Takes a deck configuration, returns a full price breakdown.
 */
export async function calculateDeckPrice(config: DeckConfig): Promise<DeckQuote> {
  const supabase = await createClient();

  // 1. Calculate area
  const area = config.length_m * config.width_m;

  // 2. Fetch rates for the selected material
  const { data: rates } = await supabase
    .from("configurator_rates")
    .select("rate_type, customer_price_cents")
    .eq("material_type_id", config.material_type_id)
    .eq("is_active", true);

  const rateMap: Partial<Record<RateType, number>> = {};
  for (const r of rates ?? []) {
    rateMap[r.rate_type as RateType] = r.customer_price_cents;
  }

  // 3. Fetch deck type for complexity multiplier
  const { data: deckType } = await supabase
    .from("deck_types")
    .select("complexity_multiplier, labour_complexity_multiplier")
    .eq("id", config.deck_type_id)
    .single();

  const complexityMult = deckType?.complexity_multiplier ?? 1;
  const labourComplexityMult = deckType?.labour_complexity_multiplier ?? 1;

  // 4. Fetch board direction multipliers
  const { data: direction } = await supabase
    .from("board_directions")
    .select("material_multiplier, labour_multiplier")
    .eq("id", config.board_direction_id)
    .single();

  const materialDirMult = direction?.material_multiplier ?? 1;
  const labourDirMult = direction?.labour_multiplier ?? 1;

  // 5. Fetch board profile modifier
  const { data: profile } = await supabase
    .from("board_profiles")
    .select("price_modifier_percent")
    .eq("id", config.board_profile_id)
    .single();

  const profileMod = 1 + (Number(profile?.price_modifier_percent ?? 0) / 100);

  // 6. Calculate base costs
  const materialsCents = Math.ceil(area * (rateMap.boards_per_m2 ?? 0) * materialDirMult * profileMod);
  const substructureCents = Math.ceil(area * (rateMap.substructure_per_m2 ?? 0) * complexityMult);
  const fixingsCents = Math.ceil(area * (rateMap.fixings_per_m2 ?? 0));

  // 7. Staining (if finish selected and it has staining rate)
  let stainingCents = 0;
  if (config.finish_option_id) {
    const { data: finish } = await supabase
      .from("finish_options")
      .select("price_modifier_cents")
      .eq("id", config.finish_option_id)
      .single();

    if (finish && finish.price_modifier_cents > 0) {
      stainingCents = Math.ceil(area * finish.price_modifier_cents);
    } else if (rateMap.staining_per_m2) {
      stainingCents = Math.ceil(area * rateMap.staining_per_m2);
    }
  }

  // 8. Labour (if installation)
  let labourCents = 0;
  if (config.include_installation) {
    labourCents = Math.ceil(
      area * (rateMap.labour_per_m2 ?? 0) * labourComplexityMult * labourDirMult
    );
  }

  // 9. Extras
  let extrasCents = 0;
  for (const extra of config.extras) {
    const { data: pricing } = await supabase
      .from("extras_pricing")
      .select("customer_price_cents")
      .eq("id", extra.pricing_id)
      .single();

    if (pricing) {
      extrasCents += Math.ceil(pricing.customer_price_cents * extra.quantity);
    }
  }

  // 10. Subtotal
  const subtotal = materialsCents + substructureCents + fixingsCents + stainingCents + labourCents + extrasCents;

  // 11. Delivery fee
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["delivery_fee_local_cents", "free_delivery_threshold_cents", "vat_percent", "deposit_percent"]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings ?? []) {
    settingsMap[s.key] = s.value;
  }

  let deliveryFeeCents = 0;
  if (!config.include_installation) {
    const threshold = Number(settingsMap.free_delivery_threshold_cents ?? 5000000);
    if (subtotal < threshold) {
      deliveryFeeCents = Number(settingsMap.delivery_fee_local_cents ?? 150000);
    }
  }

  // 12. VAT
  const vatPercent = Number(settingsMap.vat_percent ?? 15);
  const vatCents = Math.ceil((subtotal + deliveryFeeCents) * (vatPercent / 100));
  const totalCents = subtotal + deliveryFeeCents + vatCents;

  // 13. Deposit (for installation orders)
  const depositPercent = config.include_installation ? Number(settingsMap.deposit_percent ?? 50) : 0;
  const depositCents = Math.ceil(totalCents * (depositPercent / 100));
  const balanceCents = totalCents - depositCents;

  return {
    area_m2: area,
    materials_cents: materialsCents,
    substructure_cents: substructureCents,
    fixings_cents: fixingsCents,
    labour_cents: labourCents,
    staining_cents: stainingCents,
    extras_cents: extrasCents,
    subtotal_cents: subtotal,
    delivery_fee_cents: deliveryFeeCents,
    vat_cents: vatCents,
    total_cents: totalCents,
    deposit_cents: depositCents,
    balance_cents: balanceCents,
  };
}
