"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  length: number;
  width: number;
  onChangeLength: (v: number) => void;
  onChangeWidth: (v: number) => void;
}

export function StepDimensions({
  length,
  width,
  onChangeLength,
  onChangeWidth,
}: Props) {
  const area = length * width;
  const valid = area >= 1 && area <= 200;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Set your dimensions</h2>
        <p className="text-sm text-muted-foreground">
          Enter the length and width of your deck in metres.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="length">Length (m)</Label>
          <Input
            id="length"
            type="number"
            min={1}
            max={20}
            step={0.1}
            value={length}
            onChange={(e) => onChangeLength(Number(e.target.value))}
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
            onChange={(e) => onChangeWidth(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Area preview */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total area</span>
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

      {/* Visual preview */}
      <div className="flex items-center justify-center">
        <div
          className="relative rounded border-2 border-dashed border-primary/30 bg-primary/5 transition-all"
          style={{
            width: `${Math.min(Math.max(length * 20, 40), 280)}px`,
            height: `${Math.min(Math.max(width * 20, 40), 200)}px`,
            maxWidth: "100%",
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            {length}m × {width}m
          </span>
        </div>
      </div>
    </div>
  );
}
