"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updatePricingSetting } from "@/lib/admin/configurator-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

const CENTS_KEYS = new Set([
  "delivery_fee_local_cents",
  "delivery_fee_regional_cents",
  "free_delivery_threshold_cents",
]);

interface Props {
  readonly settings: AnyRow[];
}

export function CalculatorConstantsTab({ settings: initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const s of initial) map[s.key] = s.value;
    return map;
  });
  const [saving, setSaving] = useState(false);

  // Group by category
  const grouped: Record<string, AnyRow[]> = {};
  for (const s of initial) {
    const cat = s.category ?? "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  const handleSaveAll = async () => {
    setSaving(true);
    let hadError = false;
    for (const s of initial) {
      if (values[s.key] !== s.value) {
        const result = await updatePricingSetting(s.key, values[s.key]);
        if (result.error) {
          toast.error(`${s.key}: ${result.error}`);
          hadError = true;
        }
      }
    }
    setSaving(false);
    if (!hadError) toast.success("Settings saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Calculator Constants</h2>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All
        </Button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <h3 className="text-sm font-semibold capitalize">{category}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((s) => {
              const isCents = CENTS_KEYS.has(s.key);
              const displayValue = isCents
                ? (Number(values[s.key] ?? 0) / 100).toFixed(2)
                : (values[s.key] ?? "");

              return (
                <div key={s.key} className="grid gap-2 sm:grid-cols-[1fr_200px]">
                  <div>
                    <Label className="text-sm">{s.label ?? s.key}</Label>
                    {s.description && (
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCents && (
                      <span className="text-sm text-muted-foreground">R</span>
                    )}
                    <Input
                      type={s.value_type === "number" ? "number" : "text"}
                      step={isCents ? "0.01" : s.value_type === "number" ? "1" : undefined}
                      value={displayValue}
                      onChange={(e) => {
                        const raw = isCents
                          ? String(Math.round(parseFloat(e.target.value || "0") * 100))
                          : e.target.value;
                        setValues((prev) => ({ ...prev, [s.key]: raw }));
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
