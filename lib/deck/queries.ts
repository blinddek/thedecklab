import { createClient } from "@/lib/supabase/server";
import type {
  MaterialType,
  DeckType,
  BoardDirection,
  BoardProfile,
  FinishOption,
  ConfiguratorExtra,
  ExtraPricing,
  ConfiguratorRate,
} from "@/types/deck";

export async function getMaterials(): Promise<MaterialType[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("material_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return (data as MaterialType[]) ?? [];
}

export async function getMaterialBySlug(slug: string): Promise<MaterialType | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("material_types")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as MaterialType) ?? null;
}

export async function getDeckTypes(): Promise<DeckType[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deck_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return (data as DeckType[]) ?? [];
}

export async function getBoardDirections(): Promise<BoardDirection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("board_directions")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return (data as BoardDirection[]) ?? [];
}

export async function getBoardProfiles(): Promise<BoardProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("board_profiles")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return (data as BoardProfile[]) ?? [];
}

export async function getFinishOptions(materialTypeId: string): Promise<FinishOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("finish_options")
    .select("*")
    .eq("material_type_id", materialTypeId)
    .eq("is_active", true)
    .order("display_order");
  return (data as FinishOption[]) ?? [];
}

export async function getConfiguratorExtras(): Promise<ConfiguratorExtra[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configurator_extras")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return (data as ConfiguratorExtra[]) ?? [];
}

export async function getExtrasPricing(extraId: string, materialTypeId?: string): Promise<ExtraPricing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("extras_pricing")
    .select("*")
    .eq("extra_id", extraId)
    .eq("is_active", true)
    .order("display_order");

  if (materialTypeId) {
    query = query.or(`material_type_id.eq.${materialTypeId},material_type_id.is.null`);
  }

  const { data } = await query;
  return (data as ExtraPricing[]) ?? [];
}

export async function getRatesForMaterial(materialTypeId: string): Promise<ConfiguratorRate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configurator_rates")
    .select("*")
    .eq("material_type_id", materialTypeId)
    .eq("is_active", true);
  return (data as ConfiguratorRate[]) ?? [];
}
