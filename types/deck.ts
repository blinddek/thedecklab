/**
 * Deck Lab-specific TypeScript types.
 * Maps to migrations 026–030 (materials, configurator, orders, quotes).
 */

import type { LocalizedString } from "@/types/cms";

// ─── Materials & Products ───────────────────────────────

export interface MaterialType {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  image_url: string | null;
  durability_rating: number | null;
  maintenance_level: string | null;
  lifespan_years_min: number | null;
  lifespan_years_max: number | null;
  is_composite: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: LocalizedString;
  sku: string | null;
  length_mm: number | null;
  colour: string | null;
  price_cents: number;
  supplier_cost_cents: number | null;
  stock_quantity: number;
  display_order: number;
  is_active: boolean;
}

export interface Kit {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  image_url: string | null;
  price_cents: number;
  material_type_id: string | null;
  area_m2: number | null;
  display_order: number;
  is_active: boolean;
}

// ─── Configurator ───────────────────────────────────────

export interface DeckType {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  image_url: string | null;
  complexity_multiplier: number;
  labour_complexity_multiplier: number;
  applicable_extras: string[];
  display_order: number;
  is_active: boolean;
}

export type RateType =
  | "boards_per_m2"
  | "substructure_per_m2"
  | "fixings_per_m2"
  | "labour_per_m2"
  | "staining_per_m2";

export interface ConfiguratorRate {
  id: string;
  material_type_id: string;
  rate_type: RateType;
  supplier_cost_cents: number;
  customer_price_cents: number;
  unit: string;
  notes: string | null;
  is_active: boolean;
}

export interface BoardDirection {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  image_url: string | null;
  material_multiplier: number;
  labour_multiplier: number;
  display_order: number;
  is_active: boolean;
}

export interface BoardProfile {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  image_url: string | null;
  price_modifier_percent: number;
  display_order: number;
  is_active: boolean;
}

export interface FinishOption {
  id: string;
  material_type_id: string;
  name: LocalizedString;
  slug: string;
  hex_colour: string | null;
  image_url: string | null;
  price_modifier_cents: number;
  display_order: number;
  is_active: boolean;
}

export interface ConfiguratorExtra {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  icon: string | null;
  pricing_model: "per_step_metre" | "per_linear_metre" | "per_unit" | "per_m2" | "fixed";
  display_order: number;
  is_active: boolean;
}

export interface ExtraPricing {
  id: string;
  extra_id: string;
  material_type_id: string | null;
  variant_label: string | null;
  supplier_cost_cents: number;
  customer_price_cents: number;
  display_order: number;
  is_active: boolean;
}

// ─── Configurator Input/Output ──────────────────────────

export interface DeckConfig {
  deck_type_id: string;
  material_type_id: string;
  length_m: number;
  width_m: number;
  board_direction_id: string;
  board_profile_id: string;
  finish_option_id?: string;
  include_installation: boolean;
  extras: DeckExtraInput[];
  /** When provided (from board layout engine), enables exact BOM-based pricing */
  bom?: BillOfMaterials;
}

export interface DeckExtraInput {
  extra_id: string;
  pricing_id: string;
  quantity: number;      // metres, units, or m2 depending on model
}

export interface DeckQuote {
  area_m2: number;
  materials_cents: number;
  substructure_cents: number;
  fixings_cents: number;
  labour_cents: number;
  staining_cents: number;
  extras_cents: number;
  subtotal_cents: number;
  delivery_fee_cents: number;
  vat_cents: number;
  total_cents: number;
  deposit_cents: number;
  balance_cents: number;
}

// ─── Orders ─────────────────────────────────────────────

export type DeckLabOrderStatus =
  | "new" | "confirmed" | "materials_ordered" | "in_progress"
  | "ready_for_delivery" | "shipped" | "delivered"
  | "installation_scheduled" | "installed" | "completed" | "cancelled";

export type DeckLabPaymentStatus = "pending" | "deposit_paid" | "paid" | "failed" | "refunded";
export type DeckLabDeliveryType = "installation" | "supply_deliver" | "supply_collect";
export type DeckLabOrderType = "configurator" | "shop" | "mixed";

export interface DeckLabOrder {
  id: string;
  order_number: string;
  order_type: DeckLabOrderType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: { street: string; city: string; province: string; postal_code: string } | null;
  delivery_region: string | null;
  delivery_type: DeckLabDeliveryType;
  materials_total_cents: number;
  labour_total_cents: number;
  extras_total_cents: number;
  subtotal_cents: number;
  delivery_fee_cents: number;
  vat_cents: number;
  total_cents: number;
  deposit_percent: number;
  deposit_cents: number;
  balance_cents: number;
  paystack_reference: string | null;
  payment_status: DeckLabPaymentStatus;
  order_status: DeckLabOrderStatus;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Quotes & Leads ─────────────────────────────────────

export interface SavedQuote {
  id: string;
  quote_token: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  quote_data: unknown;
  total_cents: number;
  expires_at: string;
  created_at: string;
}

export type ConsultationStatus = "new" | "contacted" | "scheduled" | "visited" | "quoted" | "completed" | "cancelled";

// ─── Canvas / Designer ──────────────────────────────────────

export type ShapeType = "rect" | "l-shape";

export interface DeckShape {
  id: string;
  type: ShapeType;
  x: number; // mm from origin
  y: number; // mm from origin
  width: number; // mm
  height: number; // mm
  /** L-shape cutout (only when type === 'l-shape') */
  cutout?: {
    corner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    width: number; // mm
    height: number; // mm
  };
}

export interface DeckDesign {
  shapes: DeckShape[];
  total_area_m2: number;
  perimeter_m: number;
  board_direction: number; // degrees (0 = lengthwise)
  polygon: [number, number][]; // merged outline for board engine
}

export type DesignMode = "quick" | "designer" | "consultation";

// ─── Board Layout Engine ────────────────────────────────────

export interface BoardPiece {
  id: string;
  x: number;
  y: number;
  length_mm: number;
  width_mm: number;
  thickness_mm: number;
  stock_length_mm: number;
  cut_length_mm: number;
  rotation: number; // degrees
  source: "new" | "offcut";
  offcut_source_id?: string;
}

export interface JoistPiece {
  id: string;
  x: number;
  y: number;
  length_mm: number;
  width_mm: number;
  thickness_mm: number;
  stock_length_mm: number;
}

export interface BearerPiece {
  id: string;
  x: number;
  y: number;
  length_mm: number;
  width_mm: number;
  thickness_mm: number;
  stock_length_mm: number;
}

export interface StockSummary {
  stock_length_mm: number;
  quantity: number;
  colour?: string;
}

export interface BillOfMaterials {
  boards: StockSummary[];
  joists: StockSummary[];
  bearers: StockSummary[];
  screws_count: number;
  total_boards: number;
  total_joists: number;
  total_bearers: number;
}

export interface BoardLayoutResult {
  boards: BoardPiece[];
  joists: JoistPiece[];
  bearers: BearerPiece[];
  bom: BillOfMaterials;
}

// ─── Cutoff Optimizer ───────────────────────────────────────

export interface CutoffMetrics {
  boards_used: number;
  boards_saved: number;
  waste_percent: number;
  savings_estimate_cents: number;
  offcuts: { length_mm: number; count: number }[];
}

// ─── Board Dimensions ───────────────────────────────────────

export interface BoardDimension {
  id: string;
  material_type_id: string;
  board_type: "deck_board" | "joist" | "bearer";
  width_mm: number;
  thickness_mm: number;
  available_lengths_mm: number[];
  price_per_metre_cents: number | null;
  display_order: number;
  is_active: boolean;
}

// ─── Layout API ─────────────────────────────────────────────

export interface LayoutApiResponse {
  layout: BoardLayoutResult;
  cutoffMetrics: CutoffMetrics;
}

// ─── Kit Components ─────────────────────────────────────────

export interface KitComponentWithProduct {
  id: string;
  kit_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  display_order: number;
  product?: import("@/types").Product;
  variant?: ProductVariant;
}

// ─── Consultation ───────────────────────────────────────────

export interface ConsultationRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: { street: string; city: string; province: string; postal_code: string } | null;
  property_type: string | null;
  deck_type_interest: string | null;
  estimated_area_m2: number | null;
  notes: string | null;
  status: ConsultationStatus;
  scheduled_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
