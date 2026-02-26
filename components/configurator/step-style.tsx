"use client";

import { cn } from "@/lib/utils";
import type { OptionItem } from "./deck-configurator";

interface Props {
  directions: OptionItem[];
  profiles: OptionItem[];
  finishes: OptionItem[];
  directionId: string;
  profileId: string;
  finishId: string;
  onChangeDirection: (id: string) => void;
  onChangeProfile: (id: string) => void;
  onChangeFinish: (id: string) => void;
}

export function StepStyle({
  directions,
  profiles,
  finishes,
  directionId,
  profileId,
  finishId,
  onChangeDirection,
  onChangeProfile,
  onChangeFinish,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Board Direction */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Board direction</h2>
          <p className="text-sm text-muted-foreground">
            Diagonal and pattern layouts use more material.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {directions.map((d) => {
            const mult = (d.material_multiplier as number) ?? 1;
            const extra = mult > 1 ? `+${Math.round((mult - 1) * 100)}% material` : null;
            return (
              <button
                key={d.id}
                onClick={() => onChangeDirection(d.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all hover:border-primary/50",
                  directionId === d.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.name.en}</span>
                  {extra && (
                    <span className="text-xs text-muted-foreground">
                      {extra}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Board Profile */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Board profile</h2>
          <p className="text-sm text-muted-foreground">
            Grooved profiles are recommended for pool and wet areas.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {profiles.map((p) => {
            const mod = (p.price_modifier_percent as number) ?? 0;
            return (
              <button
                key={p.id}
                onClick={() => onChangeProfile(p.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all hover:border-primary/50",
                  profileId === p.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border"
                )}
              >
                <div className="font-medium">{p.name.en}</div>
                {mod > 0 && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    +{mod}%
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finish / Colour */}
      {finishes.length > 0 && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Finish / Colour</h2>
            <p className="text-sm text-muted-foreground">
              Optional — select a stain or colour for your boards.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChangeFinish("")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all hover:border-primary/50",
                !finishId
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border"
              )}
            >
              None
            </button>
            {finishes.map((f) => {
              const hex = (f.hex_colour as string) ?? null;
              const priceCents = (f.price_modifier_cents as number) ?? 0;
              return (
                <button
                  key={f.id}
                  onClick={() => onChangeFinish(f.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all hover:border-primary/50",
                    finishId === f.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border"
                  )}
                >
                  {hex && (
                    <span
                      className="inline-block size-4 rounded-full border"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span>{f.name.en}</span>
                  {priceCents > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +R{(priceCents / 100).toFixed(0)}/m²
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
