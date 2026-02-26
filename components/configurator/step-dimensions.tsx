"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DeckCanvas, createDesignFromDimensions } from "./deck-canvas";
import type { DeckDesign, DesignMode } from "@/types/deck";

interface Props {
  readonly length: number;
  readonly width: number;
  readonly onChangeLength: (v: number) => void;
  readonly onChangeWidth: (v: number) => void;
  readonly design: DeckDesign;
  readonly onDesignChange: (design: DeckDesign) => void;
  readonly mode: DesignMode;
  readonly onModeChange: (mode: DesignMode) => void;
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
}: Props) {
  const area = design.total_area_m2;
  const valid = area >= 1 && area <= 200;

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
        <h2 className="text-lg font-semibold">Set your dimensions</h2>
        <p className="text-sm text-muted-foreground">
          Enter the length and width of your deck in metres, or use the
          interactive designer for complex shapes.
        </p>
      </div>

      {/* Mode tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as DesignMode)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="quick" className="flex-1">
            Quick
          </TabsTrigger>
          <TabsTrigger value="designer" className="flex-1">
            Designer
          </TabsTrigger>
          <TabsTrigger value="consultation" className="flex-1">
            Consultation
          </TabsTrigger>
        </TabsList>

        {/* Quick mode */}
        <TabsContent value="quick">
          <div className="space-y-4 pt-4">
            {/* Dimension inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  min={1}
                  max={20}
                  step={0.1}
                  value={length}
                  onChange={(e) => handleLengthChange(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  min={1}
                  max={20}
                  step={0.1}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Canvas preview */}
            <DeckCanvas
              design={design}
              onDesignChange={onDesignChange}
              mode="quick"
            />

            {/* Area preview */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  Total area
                </span>
                <span className="text-2xl font-bold tabular-nums">
                  {area.toFixed(1)} m²
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
          <div className="pt-4">
            <DeckCanvas
              design={design}
              onDesignChange={onDesignChange}
              mode="designer"
            />
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
