"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Box, Grid2X2 } from "lucide-react";
import { DeckCanvas, createDesignFromDimensions } from "./deck-canvas";
import { Deck3DPreview } from "./deck-3d-loader";
import type { DeckDesign, DesignMode, BoardLayoutResult, CutoffMetrics } from "@/types/deck";

const LAYOUT_QUIPS = [
  "Counting the nails...",
  "Measuring twice, cutting once...",
  "Aligning the boards...",
  "Consulting the spirit level...",
  "Sharpening the saw...",
  "Checking joist spacing...",
  "Optimising offcuts...",
  "Doing the maths...",
  "Laying out your deck...",
  "Getting your plans ready...",
  "Sorting the screws...",
  "Finding the best cuts...",
];

interface Props {
  readonly length: number;
  readonly width: number;
  readonly onChangeLength: (v: number) => void;
  readonly onChangeWidth: (v: number) => void;
  readonly design: DeckDesign;
  readonly onDesignChange: (design: DeckDesign) => void;
  readonly mode: DesignMode;
  readonly onModeChange: (mode: DesignMode) => void;
  readonly boardLayout?: BoardLayoutResult | null;
  readonly cutoffMetrics?: CutoffMetrics | null;
  readonly layoutLoading?: boolean;
  readonly materialSlug?: string;
  readonly finishHex?: string | null;
}

export function StepDimensions({
  length,
  width,
  onChangeLength,
  onChangeWidth,
  design,
  onDesignChange,
  mode,
  onModeChange,
  boardLayout,
  cutoffMetrics,
  layoutLoading,
  materialSlug = "",
  finishHex = null,
}: Props) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const area = design.total_area_m2;
  const valid = area >= 1 && area <= 200;

  // Reset to 2D when board layout disappears
  useEffect(() => {
    if (!boardLayout) setViewMode("2d");
  }, [boardLayout]);

  // In quick mode, when length/width change, rebuild the design
  const handleLengthChange = useCallback(
    (v: number) => {
      onChangeLength(v);
      if (mode === "quick") {
        onDesignChange(createDesignFromDimensions(v, width));
      }
    },
    [onChangeLength, onDesignChange, mode, width]
  );

  const handleWidthChange = useCallback(
    (v: number) => {
      onChangeWidth(v);
      if (mode === "quick") {
        onDesignChange(createDesignFromDimensions(length, v));
      }
    },
    [onChangeWidth, onDesignChange, mode, length]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-[#F5F1EC]">Deck Shape &amp; Dimensions</h2>
        <p className="text-sm text-[#A8A099]">
          Enter length and width for a simple rectangle, or switch to Designer
          for complex shapes.
        </p>
      </div>

      {/* Mode tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as DesignMode)}
      >
        <TabsList className="w-full border border-[#2A2725] bg-[#1A1918]">
          <TabsTrigger
            value="quick"
            className="flex-1 data-[state=active]:bg-[#2A2725] data-[state=active]:text-[#F5F1EC] text-[#A8A099]"
          >
            Quick
          </TabsTrigger>
          <TabsTrigger
            value="designer"
            className="flex-1 data-[state=active]:bg-[#2A2725] data-[state=active]:text-[#F5F1EC] text-[#A8A099]"
          >
            Designer
          </TabsTrigger>
          <TabsTrigger
            value="consultation"
            className="flex-1 data-[state=active]:bg-[#2A2725] data-[state=active]:text-[#F5F1EC] text-[#A8A099]"
          >
            Consultation
          </TabsTrigger>
        </TabsList>

        {/* Quick mode */}
        <TabsContent value="quick">
          <div className="space-y-4 pt-4">
            {/* Dimension inputs — dark workshop panel */}
            <div className="rounded-lg border border-[#2A2725] bg-[#1A1918] p-4">
              <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-widest text-[#736B62]">
                Deck Dimensions
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="length"
                    className="text-xs font-semibold uppercase tracking-wider text-[#D4622A]"
                  >
                    Length
                  </Label>
                  <div className="relative">
                    <Input
                      id="length"
                      type="number"
                      min={1}
                      max={20}
                      step={0.1}
                      value={length}
                      onChange={(e) => handleLengthChange(Number(e.target.value))}
                      className="border-[#2A2725] bg-[#0F0E0D] pr-10 font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50 placeholder:text-[#4A4540]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#736B62]">
                      m
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="width"
                    className="text-xs font-semibold uppercase tracking-wider text-[#D4622A]"
                  >
                    Width
                  </Label>
                  <div className="relative">
                    <Input
                      id="width"
                      type="number"
                      min={1}
                      max={20}
                      step={0.1}
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="border-[#2A2725] bg-[#0F0E0D] pr-10 font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50 placeholder:text-[#4A4540]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#736B62]">
                      m
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas preview */}
            <DeckCanvas
              design={design}
              onDesignChange={onDesignChange}
              mode="quick"
            />

            {/* Area readout — ember accent */}
            <div className="relative overflow-hidden rounded-lg border border-[#2A2725] bg-[#1A1918] p-4">
              {/* ember top bar */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4622A]/60 to-transparent" />
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#736B62]">
                  Total area
                </span>
                <span className="font-mono text-2xl font-bold tabular-nums text-[#F5F1EC]">
                  {area.toFixed(1)}{" "}
                  <span className="text-base font-normal text-[#A8A099]">m²</span>
                </span>
              </div>
              {!valid && area > 0 && (
                <p className="mt-1 text-sm text-destructive">
                  Deck area must be between 1 and 200 m²
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Designer mode */}
        <TabsContent value="designer">
          <div className="space-y-4 pt-4">
            {/* 2D/3D toggle — only visible when board layout exists */}
            {boardLayout && (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant={viewMode === "2d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("2d")}
                  className="gap-1.5"
                >
                  <Grid2X2 className="size-3.5" />
                  2D Plan
                </Button>
                <Button
                  variant={viewMode === "3d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("3d")}
                  className="gap-1.5"
                >
                  <Box className="size-3.5" />
                  3D Preview
                </Button>
              </div>
            )}

            {/* Canvas / 3D view */}
            {viewMode === "3d" && boardLayout ? (
              <Deck3DPreview
                boardLayout={boardLayout}
                design={design}
                materialSlug={materialSlug}
                finishHex={finishHex}
              />
            ) : (
              <DeckCanvas
                design={design}
                onDesignChange={onDesignChange}
                mode="designer"
                boardLayout={boardLayout}
              />
            )}

            {/* Area summary */}
            <div className="relative overflow-hidden rounded-lg border border-[#2A2725] bg-[#1A1918] p-4">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4622A]/60 to-transparent" />
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#736B62]">
                  Total area
                </span>
                <span className="font-mono text-2xl font-bold tabular-nums text-[#F5F1EC]">
                  {area.toFixed(1)}{" "}
                  <span className="text-base font-normal text-[#A8A099]">m²</span>
                </span>
              </div>
            </div>

            {/* Loading widget or BOM summary */}
            {layoutLoading && <LayoutLoadingWidget />}
            {!layoutLoading && boardLayout && (
              <BomSummary layout={boardLayout} metrics={cutoffMetrics} />
            )}
          </div>
        </TabsContent>

        {/* Consultation mode */}
        <TabsContent value="consultation">
          <div className="pt-4">
            <DeckCanvas
              design={design}
              onDesignChange={onDesignChange}
              mode="consultation"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Layout Loading Widget ────────────────────────────── */

const LOADING_STEPS = [
  "Measuring your deck...",
  "Laying out boards...",
  "Placing joists & bearers...",
  "Optimising offcuts...",
  "Crunching the numbers...",
];

function LayoutLoadingWidget() {
  const [stepIndex, setStepIndex] = useState(0);
  const [quipIndex, setQuipIndex] = useState(() =>
    Math.floor(Math.random() * LAYOUT_QUIPS.length)
  );

  // Progress through steps
  useEffect(() => {
    setStepIndex(0);
    // Advance through steps at staggered intervals
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setStepIndex(i), i * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Rotate quips between steps
  useEffect(() => {
    const interval = setInterval(() => {
      setQuipIndex((prev) => {
        let next = Math.floor(Math.random() * LAYOUT_QUIPS.length);
        while (next === prev && LAYOUT_QUIPS.length > 1) {
          next = Math.floor(Math.random() * LAYOUT_QUIPS.length);
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(((stepIndex + 1) / LOADING_STEPS.length) * 90, 90);

  return (
    <div className="space-y-3 rounded-lg border border-[#2A2725] bg-[#1A1918] px-4 py-3">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#A8A099]">
          <span>{LOADING_STEPS[stepIndex]}</span>
          <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#2A2725]">
          <div
            className="h-full rounded-full bg-[#D4622A] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Fun quip */}
      <div className="flex items-center gap-2">
        <Loader2 className="size-3.5 shrink-0 animate-spin text-[#736B62]" />
        <span className="text-xs italic text-[#736B62]">
          {LAYOUT_QUIPS[quipIndex]}
        </span>
      </div>
    </div>
  );
}

/* ─── BOM Summary Panel ────────────────────────────────── */

function BomSummary({
  layout,
  metrics,
}: {
  readonly layout: BoardLayoutResult;
  readonly metrics?: CutoffMetrics | null;
}) {
  const { bom } = layout;
  const offcutBoards = layout.boards.filter((b) => b.source === "offcut").length;
  const newBoards = bom.total_boards - offcutBoards;

  return (
    <details className="rounded-lg border border-[#2A2725] bg-[#1A1918]" open>
      <summary className="cursor-pointer px-4 py-3 font-display text-[11px] font-bold uppercase tracking-widest text-[#F5F1EC]">
        Bill of Materials
      </summary>
      <div className="space-y-2 px-4 pb-4 text-sm text-[#A8A099]">
        {/* Boards */}
        <div className="flex items-baseline justify-between">
          <span>
            Boards: {bom.total_boards}
            {offcutBoards > 0 && (
              <span className="ml-1 text-xs">
                ({newBoards} new + {offcutBoards} from offcuts)
              </span>
            )}
          </span>
        </div>
        {bom.boards.length > 0 && (
          <div className="ml-4 text-xs">
            {bom.boards.map((s) => (
              <span key={s.stock_length_mm} className="mr-3">
                {s.quantity}&times; {(s.stock_length_mm / 1000).toFixed(1)}m
              </span>
            ))}
          </div>
        )}

        {/* Joists */}
        <div className="flex items-baseline justify-between">
          <span>Joists: {bom.total_joists}</span>
        </div>
        {bom.joists.length > 0 && (
          <div className="ml-4 text-xs">
            {bom.joists.map((s) => (
              <span key={s.stock_length_mm} className="mr-3">
                {s.quantity}&times; {(s.stock_length_mm / 1000).toFixed(1)}m
              </span>
            ))}
          </div>
        )}

        {/* Bearers */}
        <div className="flex items-baseline justify-between">
          <span>Bearers: {bom.total_bearers}</span>
        </div>
        {bom.bearers.length > 0 && (
          <div className="ml-4 text-xs">
            {bom.bearers.map((s) => (
              <span key={s.stock_length_mm} className="mr-3">
                {s.quantity}&times; {(s.stock_length_mm / 1000).toFixed(1)}m
              </span>
            ))}
          </div>
        )}

        {/* Screws */}
        <div>
          Screws: {bom.screws_count} &rarr; {Math.ceil(bom.screws_count / 200)} boxes
        </div>

        {/* Cutoff metrics */}
        {metrics && (
          <>
            <div>
              Waste: {metrics.waste_percent.toFixed(1)}%
              {metrics.boards_saved > 0 && (
                <span className="ml-1 text-xs">
                  (saved {metrics.boards_saved} board{metrics.boards_saved > 1 ? "s" : ""} via offcut reuse)
                </span>
              )}
            </div>
            {metrics.savings_estimate_cents > 0 && (
              <div className="font-medium text-green-600 dark:text-green-400">
                Savings: ~R{(metrics.savings_estimate_cents / 100).toFixed(0)} from cutoff optimization
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}
