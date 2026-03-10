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
          <h2 className="text-lg font-semibold text-[#F5F1EC]">Board direction</h2>
          <p className="text-sm text-[#A8A099]">
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
                  "rounded-lg border p-3 text-left transition-all hover:border-[#D4622A]/50",
                  directionId === d.id
                    ? "border-[#D4622A] bg-[#D4622A]/10 ring-1 ring-[#D4622A]/20"
                    : "border-[#2A2725]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F1EC]">{d.name.en}</span>
                  {extra && (
                    <span className="text-xs text-[#A8A099]">
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
          <h2 className="text-lg font-semibold text-[#F5F1EC]">Board profile</h2>
          <p className="text-sm text-[#A8A099]">
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
                  "rounded-lg border p-3 text-left transition-all hover:border-[#D4622A]/50",
                  profileId === p.id
                    ? "border-[#D4622A] bg-[#D4622A]/10 ring-1 ring-[#D4622A]/20"
                    : "border-[#2A2725]"
                )}
              >
                <div className="font-semibold text-[#F5F1EC]">{p.name.en}</div>
                {mod > 0 && (
                  <div className="mt-0.5 text-xs text-[#A8A099]">
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
            <h2 className="text-lg font-semibold text-[#F5F1EC]">Finish / Colour</h2>
            <p className="text-sm text-[#A8A099]">
              Optional — select a stain or colour for your boards.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChangeFinish("")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm text-[#F5F1EC] transition-all hover:border-[#D4622A]/50",
                !finishId
                  ? "border-[#D4622A] bg-[#D4622A]/10 ring-1 ring-[#D4622A]/20"
                  : "border-[#2A2725]"
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
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-[#F5F1EC] transition-all hover:border-[#D4622A]/50",
                    finishId === f.id
                      ? "border-[#D4622A] bg-[#D4622A]/10 ring-1 ring-[#D4622A]/20"
                      : "border-[#2A2725]"
                  )}
                >
                  {hex && (
                    <span
                      className="inline-block size-4 rounded-full border border-[#2A2725]"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span>{f.name.en}</span>
                  {priceCents > 0 && (
                    <span className="text-xs text-[#736B62]">
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
