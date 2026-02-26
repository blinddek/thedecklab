"use client";

import { cn } from "@/lib/utils";
import type { OptionItem } from "./deck-configurator";

interface Props {
  options: OptionItem[];
  value: string;
  onChange: (id: string) => void;
}

export function StepMaterial({ options, value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Choose your material</h2>
        <p className="text-sm text-muted-foreground">
          Each material has different pricing, durability, and maintenance
          requirements.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((mat) => {
          const durability = (mat.durability_rating as number) ?? 0;
          const maintenance = (mat.maintenance_level as string) ?? "";
          const lifespanMin = (mat.lifespan_years_min as number) ?? 0;
          const lifespanMax = (mat.lifespan_years_max as number) ?? 0;

          return (
            <button
              key={mat.id}
              onClick={() => onChange(mat.id)}
              className={cn(
                "rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm",
                value === mat.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border"
              )}
            >
              <div className="font-medium">{mat.name.en}</div>
              {mat.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {mat.description.en}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {durability > 0 && (
                  <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-secondary">
                    Durability: {durability}/5
                  </span>
                )}
                {maintenance && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    Maintenance: {maintenance}
                  </span>
                )}
                {lifespanMin > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {lifespanMin}–{lifespanMax} years
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
