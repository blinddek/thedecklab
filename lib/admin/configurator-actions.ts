"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ensureAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";
import { calculateDeckPrice } from "@/lib/pricing/configurator";
import type { LocalizedString } from "@/types/cms";
import type { DeckConfig, DeckQuote } from "@/types/deck";

const PATHS = ["/admin/configurator", "/admin/pricing"];
function revalidate() {
  for (const p of PATHS) revalidatePath(p);
}

// ── Read helpers ───────────────────────────────────────────────

export async function getAdminMaterials() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("material_types")
    .select("*")
    .order("display_order");
  return data ?? [];
}

export async function getAdminDeckTypes() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("deck_types")
    .select("*")
    .order("display_order");
  return data ?? [];
}

export async function getAdminRates() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("configurator_rates")
    .select("*, material_types(name)")
    .order("material_type_id")
    .order("rate_type");
  return data ?? [];
}

export async function getAdminBoardDirections() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("board_directions")
    .select("*")
    .order("display_order");
  return data ?? [];
}

export async function getAdminBoardProfiles() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("board_profiles")
    .select("*")
    .order("display_order");
  return data ?? [];
}

export async function getAdminFinishOptions() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("finish_options")
    .select("*")
    .order("material_type_id")
    .order("display_order");
  return data ?? [];
}

export async function getAdminExtras() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("configurator_extras")
    .select("*")
    .order("display_order");
  return data ?? [];
}

export async function getAdminExtrasPricing(extraId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("extras_pricing")
    .select("*")
    .eq("extra_id", extraId)
    .order("display_order");
  return data ?? [];
}

export async function getAdminBoardDimensions() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("board_dimensions")
    .select("*")
    .order("material_type_id")
    .order("display_order");
  return data ?? [];
}

export async function getMarkupConfig() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("markup_config")
    .select("*")
    .order("scope_type")
    .order("created_at");
  return data ?? [];
}

export async function getPricingSettings() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select("*")
    .in("category", ["pricing", "calculator"])
    .order("category")
    .order("key");
  return data ?? [];
}

// ── Deck Types ─────────────────────────────────────────────────

export async function upsertDeckType(data: {
  id?: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString | null;
  image_url?: string | null;
  complexity_multiplier: number;
  labour_complexity_multiplier: number;
  applicable_extras: string[];
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("deck_types").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteDeckType(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("deck_types").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Configurator Rates ─────────────────────────────────────────

export async function upsertRate(data: {
  id?: string;
  material_type_id: string;
  rate_type: string;
  supplier_cost_cents: number;
  customer_price_cents: number;
  notes?: string | null;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("configurator_rates").upsert(
    { ...data, is_active: true },
    { onConflict: "material_type_id,rate_type" }
  );
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function bulkUpsertRates(
  rates: Array<{
    id?: string;
    material_type_id: string;
    rate_type: string;
    supplier_cost_cents: number;
    customer_price_cents: number;
    notes?: string | null;
  }>
): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const rows = rates.map((r) => ({ ...r, is_active: true }));
  const { error } = await admin
    .from("configurator_rates")
    .upsert(rows, { onConflict: "material_type_id,rate_type" });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Board Directions ───────────────────────────────────────────

export async function upsertBoardDirection(data: {
  id?: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString | null;
  image_url?: string | null;
  material_multiplier: number;
  labour_multiplier: number;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("board_directions").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteBoardDirection(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("board_directions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Board Profiles ─────────────────────────────────────────────

export async function upsertBoardProfile(data: {
  id?: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString | null;
  image_url?: string | null;
  price_modifier_percent: number;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("board_profiles").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteBoardProfile(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("board_profiles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Finish Options ─────────────────────────────────────────────

export async function upsertFinishOption(data: {
  id?: string;
  material_type_id: string;
  name: LocalizedString;
  slug: string;
  hex_colour?: string | null;
  image_url?: string | null;
  price_modifier_cents: number;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("finish_options").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteFinishOption(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("finish_options").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Configurator Extras ────────────────────────────────────────

export async function upsertExtra(data: {
  id?: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString | null;
  icon?: string | null;
  pricing_model: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("configurator_extras").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteExtra(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("configurator_extras").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Extras Pricing ─────────────────────────────────────────────

export async function upsertExtraPricing(data: {
  id?: string;
  extra_id: string;
  material_type_id?: string | null;
  variant_label?: string | null;
  supplier_cost_cents: number;
  customer_price_cents: number;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("extras_pricing").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteExtraPricing(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("extras_pricing").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Board Dimensions ───────────────────────────────────────────

export async function upsertBoardDimension(data: {
  id?: string;
  material_type_id: string;
  board_type: string;
  width_mm: number;
  thickness_mm: number;
  available_lengths_mm: number[];
  price_per_metre_cents?: number | null;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("board_dimensions").upsert({
    ...data,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteBoardDimension(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("board_dimensions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Markup Config ──────────────────────────────────────────────

export async function upsertMarkup(data: {
  id?: string;
  scope_type: string;
  scope_id?: string | null;
  markup_percent: number;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("markup_config").upsert(
    { ...data, is_active: data.is_active ?? true },
    { onConflict: "scope_type,scope_id" }
  );
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteMarkup(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("markup_config").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Site Settings ──────────────────────────────────────────────

export async function updatePricingSetting(
  key: string,
  value: string
): Promise<{ error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .update({ value })
    .eq("key", key);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ── Pricing Simulator ──────────────────────────────────────────

export interface SimulatorResult {
  quote: DeckQuote;
  supplierCosts: {
    materials_cents: number;
    substructure_cents: number;
    fixings_cents: number;
    staining_cents: number;
    extras_cents: number;
  };
  margins: {
    materials_pct: number;
    substructure_pct: number;
    fixings_pct: number;
    overall_pct: number;
  };
}

export async function simulatePrice(
  config: DeckConfig
): Promise<SimulatorResult | { error: string }> {
  await ensureAdmin();
  try {
    const quote = await calculateDeckPrice(config);
    const admin = createAdminClient();

    // Fetch supplier rates
    const { data: rates } = await admin
      .from("configurator_rates")
      .select("rate_type, supplier_cost_cents")
      .eq("material_type_id", config.material_type_id)
      .eq("is_active", true);

    const rateMap: Record<string, number> = {};
    for (const r of rates ?? []) rateMap[r.rate_type] = r.supplier_cost_cents;

    const area = config.length_m * config.width_m;
    const supplierCosts = {
      materials_cents: Math.ceil(area * (rateMap.boards_per_m2 ?? 0)),
      substructure_cents: Math.ceil(area * (rateMap.substructure_per_m2 ?? 0)),
      fixings_cents: Math.ceil(area * (rateMap.fixings_per_m2 ?? 0)),
      staining_cents: Math.ceil(area * (rateMap.staining_per_m2 ?? 0)),
      extras_cents: 0,
    };

    const margin = (customer: number, supplier: number) =>
      customer > 0 ? Math.round(((customer - supplier) / customer) * 100) : 0;

    const totalSupplier =
      supplierCosts.materials_cents +
      supplierCosts.substructure_cents +
      supplierCosts.fixings_cents +
      supplierCosts.staining_cents;

    const totalCustomer =
      quote.materials_cents +
      quote.substructure_cents +
      quote.fixings_cents +
      quote.staining_cents;

    return {
      quote,
      supplierCosts,
      margins: {
        materials_pct: margin(quote.materials_cents, supplierCosts.materials_cents),
        substructure_pct: margin(quote.substructure_cents, supplierCosts.substructure_cents),
        fixings_pct: margin(quote.fixings_cents, supplierCosts.fixings_cents),
        overall_pct: margin(totalCustomer, totalSupplier),
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Simulation failed" };
  }
}
