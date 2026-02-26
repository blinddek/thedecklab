"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ExtraItem, ExtraSelection, PricingItem } from "./deck-configurator";

interface Props {
  extras: ExtraItem[];
  pricing: Record<string, PricingItem[]>;
  selected: ExtraSelection[];
  includeInstallation: boolean;
  onChangeExtras: (extras: ExtraSelection[]) => void;
  onChangeInstallation: (v: boolean) => void;
}

function formatPrice(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

const UNIT_LABELS: Record<string, string> = {
  per_step_metre: "step-metres",
  per_linear_metre: "linear metres",
  per_unit: "units",
  per_m2: "m²",
  fixed: "",
};

export function StepExtras({
  extras,
  pricing,
  selected,
  includeInstallation,
  onChangeExtras,
  onChangeInstallation,
}: Props) {
  const getSelection = (extraId: string) =>
    selected.find((s) => s.extra_id === extraId);

  const toggleExtra = (extraId: string, pricingId: string) => {
    const exists = selected.find((s) => s.extra_id === extraId);
    if (exists) {
      onChangeExtras(selected.filter((s) => s.extra_id !== extraId));
    } else {
      onChangeExtras([
        ...selected,
        { extra_id: extraId, pricing_id: pricingId, quantity: 1 },
      ]);
    }
  };

  const updateQuantity = (extraId: string, quantity: number) => {
    onChangeExtras(
      selected.map((s) =>
        s.extra_id === extraId ? { ...s, quantity: Math.max(0.1, quantity) } : s
      )
    );
  };

  const updatePricingVariant = (extraId: string, pricingId: string) => {
    onChangeExtras(
      selected.map((s) =>
        s.extra_id === extraId ? { ...s, pricing_id: pricingId } : s
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Installation toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <h2 className="font-semibold">Professional Installation</h2>
          <p className="text-sm text-muted-foreground">
            Our team installs your deck in the Western Cape. Includes a free
            site visit.
          </p>
        </div>
        <Switch
          checked={includeInstallation}
          onCheckedChange={onChangeInstallation}
        />
      </div>

      {/* Extras */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Extras</h2>
          <p className="text-sm text-muted-foreground">
            Optional add-ons for your deck.
          </p>
        </div>

        <div className="space-y-3">
          {extras.map((extra) => {
            const pricingOptions = pricing[extra.id] ?? [];
            const sel = getSelection(extra.id);
            const isSelected = !!sel;
            const unitLabel = UNIT_LABELS[extra.pricing_model] ?? "";
            const defaultPricing = pricingOptions[0];

            return (
              <div
                key={extra.id}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  isSelected
                    ? "border-primary/30 bg-primary/5"
                    : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <button
                      onClick={() =>
                        defaultPricing &&
                        toggleExtra(extra.id, defaultPricing.id)
                      }
                      className="text-left"
                      disabled={!defaultPricing}
                    >
                      <div className="font-medium">{extra.name.en}</div>
                      {extra.description && (
                        <div className="mt-0.5 text-sm text-muted-foreground">
                          {extra.description.en}
                        </div>
                      )}
                    </button>

                    {/* Variant selector + quantity (shown when selected) */}
                    {isSelected && sel && (
                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        {pricingOptions.length > 1 && (
                          <div className="space-y-1">
                            <Label className="text-xs">Variant</Label>
                            <div className="flex flex-wrap gap-1">
                              {pricingOptions.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() =>
                                    updatePricingVariant(extra.id, p.id)
                                  }
                                  className={cn(
                                    "rounded border px-2 py-1 text-xs transition-colors",
                                    sel.pricing_id === p.id
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/50"
                                  )}
                                >
                                  {p.variant_label ?? "Standard"} —{" "}
                                  {formatPrice(p.customer_price_cents)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {extra.pricing_model !== "fixed" && (
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Qty ({unitLabel})
                            </Label>
                            <Input
                              type="number"
                              min={0.1}
                              step={0.5}
                              value={sel.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  extra.id,
                                  Number(e.target.value)
                                )
                              }
                              className="h-8 w-24"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() =>
                      defaultPricing &&
                      toggleExtra(extra.id, defaultPricing.id)
                    }
                    disabled={!defaultPricing}
                  />
                </div>
              </div>
            );
          })}

          {extras.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No extras available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
