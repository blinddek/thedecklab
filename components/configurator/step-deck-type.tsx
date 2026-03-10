"use client";

import { cn } from "@/lib/utils";
import type { OptionItem } from "./deck-configurator";

interface Props {
  options: OptionItem[];
  value: string;
  onChange: (id: string) => void;
}

export function StepDeckType({ options, value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#F5F1EC]">Choose your deck type</h2>
        <p className="text-sm text-[#A8A099]">
          This affects substructure complexity and labour costs.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg border p-4 text-left transition-all hover:border-[#D4622A]/50",
              value === opt.id
                ? "border-[#D4622A] bg-[#D4622A]/10 ring-1 ring-[#D4622A]/20"
                : "border-[#2A2725]"
            )}
          >
            <div className="font-semibold text-[#F5F1EC]">{opt.name.en}</div>
            {opt.description && (
              <div className="mt-1 text-sm text-[#A8A099]">
                {opt.description.en}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
