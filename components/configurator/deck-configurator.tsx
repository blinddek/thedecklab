"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { StepDeckType } from "./step-deck-type";
import { StepMaterial } from "./step-material";
import { StepDimensions } from "./step-dimensions";
import { StepStyle } from "./step-style";
import { StepExtras } from "./step-extras";
import { StepQuote } from "./step-quote";
import type { DeckQuote, DeckDesign, DesignMode, BoardLayoutResult, CutoffMetrics } from "@/types/deck";
import { createDesignFromDimensions } from "./deck-canvas";

/* ─── Types for configurator state ─────────────────────────── */

export interface ConfigOptions {
  materials: OptionItem[];
  deck_types: OptionItem[];
  directions: OptionItem[];
  profiles: OptionItem[];
  extras: ExtraItem[];
  finish_options: OptionItem[] | null;
  rates: unknown[] | null;
  extras_pricing: Record<string, PricingItem[]>;
}

export interface OptionItem {
  id: string;
  name: { en: string; af?: string };
  slug: string;
  description?: { en: string; af?: string } | null;
  image_url?: string | null;
  [key: string]: unknown;
}

export interface ExtraItem extends OptionItem {
  pricing_model: string;
  icon?: string | null;
}

export interface PricingItem {
  id: string;
  variant_label: string | null;
  customer_price_cents: number;
  [key: string]: unknown;
}

export interface ExtraSelection {
  extra_id: string;
  pricing_id: string;
  quantity: number;
}

export interface DeckState {
  deck_type_id: string;
  material_type_id: string;
  length_m: number;
  width_m: number;
  board_direction_id: string;
  board_profile_id: string;
  finish_option_id: string;
  include_installation: boolean;
  extras: ExtraSelection[];
}

const INITIAL_STATE: DeckState = {
  deck_type_id: "",
  material_type_id: "",
  length_m: 4,
  width_m: 3,
  board_direction_id: "",
  board_profile_id: "",
  finish_option_id: "",
  include_installation: false,
  extras: [],
};

const STEP_LABELS = [
  "Deck Type",
  "Material",
  "Dimensions",
  "Style",
  "Extras",
  "Quote",
];

/* ─── Main Component ───────────────────────────────────────── */

export function DeckConfigurator() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<DeckState>(INITIAL_STATE);
  const [options, setOptions] = useState<ConfigOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<DeckQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [design, setDesign] = useState<DeckDesign>(() =>
    createDesignFromDimensions(INITIAL_STATE.length_m, INITIAL_STATE.width_m)
  );
  const [designMode, setDesignMode] = useState<DesignMode>("quick");
  const [boardLayout, setBoardLayout] = useState<BoardLayoutResult | null>(null);
  const [cutoffMetrics, setCutoffMetrics] = useState<CutoffMetrics | null>(null);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const layoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch base options on mount
  useEffect(() => {
    fetch("/api/deck/options")
      .then((r) => r.json())
      .then((data) => {
        setOptions(data);
        // Set defaults
        if (data.deck_types?.[0]) {
          setState((s) => ({ ...s, deck_type_id: data.deck_types[0].id }));
        }
        if (data.directions?.[0]) {
          setState((s) => ({
            ...s,
            board_direction_id: data.directions[0].id,
          }));
        }
        if (data.profiles?.[0]) {
          setState((s) => ({ ...s, board_profile_id: data.profiles[0].id }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch material-specific options when material changes
  useEffect(() => {
    if (!state.material_type_id) return;
    fetch(`/api/deck/options?material_type_id=${state.material_type_id}`)
      .then((r) => r.json())
      .then((data) => {
        setOptions((prev) =>
          prev
            ? {
                ...prev,
                finish_options: data.finish_options,
                rates: data.rates,
                extras_pricing: data.extras_pricing,
              }
            : prev
        );
      });
  }, [state.material_type_id]);

  const update = useCallback(
    (patch: Partial<DeckState>) => setState((s) => ({ ...s, ...patch })),
    []
  );

  // When the design changes (from canvas), sync area back to DeckState for pricing
  const handleDesignChange = useCallback(
    (newDesign: DeckDesign) => {
      setDesign(newDesign);
      if (designMode === "quick" && newDesign.shapes.length === 1) {
        // In quick mode, keep length/width in sync from the single rect
        const shape = newDesign.shapes[0];
        const lengthM = shape.width / 1000;
        const widthM = shape.height / 1000;
        setState((s) => ({ ...s, length_m: lengthM, width_m: widthM }));
      } else if (designMode === "designer") {
        // In designer mode, derive effective length/width from total area
        // Use a square approximation for the pricing engine
        const side = Math.sqrt(newDesign.total_area_m2);
        setState((s) => ({ ...s, length_m: side, width_m: side }));
      }
    },
    [designMode]
  );

  // Debounced board layout fetch — fires when design/material changes in designer mode
  useEffect(() => {
    if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);

    // Only compute layout when in designer mode with shapes and a material selected
    if (designMode !== "designer" || design.shapes.length === 0 || !state.material_type_id) {
      setBoardLayout(null);
      setCutoffMetrics(null);
      setLayoutLoading(false);
      return;
    }

    setLayoutLoading(true);

    layoutTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/deck/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            polygon: design.polygon,
            material_type_id: state.material_type_id,
            board_direction_deg: design.board_direction,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setBoardLayout(null);
          setCutoffMetrics(null);
        } else {
          setBoardLayout(data.layout);
          setCutoffMetrics(data.cutoffMetrics);
        }
      } catch {
        setBoardLayout(null);
        setCutoffMetrics(null);
      } finally {
        setLayoutLoading(false);
      }
    }, 500);

    return () => {
      if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
    };
  }, [design, state.material_type_id, designMode]);

  // Calculate quote — include BOM when available for exact pricing
  const calculateQuote = useCallback(async () => {
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/deck/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          finish_option_id: state.finish_option_id || undefined,
          bom: boardLayout?.bom ?? undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuote(data);
    } catch {
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [state, boardLayout]);

  // Trigger quote when reaching step 5
  useEffect(() => {
    if (step === 5) calculateQuote();
  }, [step, calculateQuote]);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return !!state.deck_type_id;
      case 1:
        return !!state.material_type_id;
      case 2: {
        if (designMode === "consultation") return true;
        const area = design.total_area_m2;
        return area >= 1 && area <= 200 && design.shapes.length > 0;
      }
      case 3:
        return !!state.board_direction_id && !!state.board_profile_id;
      case 4:
        return true; // extras are optional
      default:
        return false;
    }
  };

  if (loading || !options) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading configurator...
          </span>
        </CardContent>
      </Card>
    );
  }

  // Derive material info for 3D preview
  const selectedMaterial = options.materials.find((m) => m.id === state.material_type_id);
  const materialSlug = selectedMaterial?.slug ?? "";
  const selectedFinish = (options.finish_options ?? []).find(
    (f) => f.id === state.finish_option_id
  );
  const finishHex = (selectedFinish as { hex_colour?: string } | undefined)?.hex_colour ?? null;

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {step + 1} of {STEP_LABELS.length}
          </span>
          <span>{STEP_LABELS[step]}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              className={`text-xs transition-colors ${
                i === step
                  ? "font-semibold text-primary"
                  : i < step
                    ? "cursor-pointer text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {step === 0 && (
            <StepDeckType
              options={options.deck_types}
              value={state.deck_type_id}
              onChange={(id) => update({ deck_type_id: id })}
            />
          )}
          {step === 1 && (
            <StepMaterial
              options={options.materials}
              value={state.material_type_id}
              onChange={(id) =>
                update({ material_type_id: id, finish_option_id: "" })
              }
            />
          )}
          {step === 2 && (
            <StepDimensions
              length={state.length_m}
              width={state.width_m}
              onChangeLength={(v) => update({ length_m: v })}
              onChangeWidth={(v) => update({ width_m: v })}
              design={design}
              onDesignChange={handleDesignChange}
              mode={designMode}
              onModeChange={setDesignMode}
              boardLayout={boardLayout}
              cutoffMetrics={cutoffMetrics}
              layoutLoading={layoutLoading}
              materialSlug={materialSlug}
              finishHex={finishHex}
            />
          )}
          {step === 3 && (
            <StepStyle
              directions={options.directions}
              profiles={options.profiles}
              finishes={options.finish_options ?? []}
              directionId={state.board_direction_id}
              profileId={state.board_profile_id}
              finishId={state.finish_option_id}
              onChangeDirection={(id) => update({ board_direction_id: id })}
              onChangeProfile={(id) => update({ board_profile_id: id })}
              onChangeFinish={(id) => update({ finish_option_id: id })}
            />
          )}
          {step === 4 && (
            <StepExtras
              extras={options.extras}
              pricing={options.extras_pricing}
              selected={state.extras}
              includeInstallation={state.include_installation}
              onChangeExtras={(extras) => update({ extras })}
              onChangeInstallation={(v) =>
                update({ include_installation: v })
              }
            />
          )}
          {step === 5 && (
            <StepQuote
              quote={quote}
              loading={quoteLoading}
              state={state}
              options={options}
              onRecalculate={calculateQuote}
              design={design}
              boardLayout={boardLayout}
              cutoffMetrics={cutoffMetrics}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
        {step < 5 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Save Quote ↑
          </Button>
        )}
      </div>
    </div>
  );
}
