"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { bulkUpsertRates } from "@/lib/admin/configurator-actions";

const RATE_TYPES = [
  { key: "boards_per_m2", label: "Boards / m\u00B2" },
  { key: "substructure_per_m2", label: "Substructure / m\u00B2" },
  { key: "fixings_per_m2", label: "Fixings / m\u00B2" },
  { key: "labour_per_m2", label: "Labour / m\u00B2" },
  { key: "staining_per_m2", label: "Staining / m\u00B2" },
] as const;

interface RateRow {
  id?: string;
  material_type_id: string;
  rate_type: string;
  supplier_cost_cents: number;
  customer_price_cents: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function centsToRands(c: number) {
  return (c / 100).toFixed(2);
}
function randsToCents(r: string) {
  return Math.round(parseFloat(r || "0") * 100);
}

function marginPct(customer: number, supplier: number) {
  if (customer <= 0) return 0;
  return Math.round(((customer - supplier) / customer) * 100);
}

function marginColour(pct: number) {
  if (pct >= 30) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (pct >= 20) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

interface Props {
  readonly materials: AnyRow[];
  readonly rates: AnyRow[];
}

export function MaterialRatesTab({ materials, rates }: Props) {
  // Build initial state keyed by "materialId:rateType"
  const buildKey = (mid: string, rt: string) => `${mid}:${rt}`;

  const [cells, setCells] = useState<Record<string, RateRow>>(() => {
    const map: Record<string, RateRow> = {};
    for (const r of rates) {
      map[buildKey(r.material_type_id, r.rate_type)] = {
        id: r.id,
        material_type_id: r.material_type_id,
        rate_type: r.rate_type,
        supplier_cost_cents: r.supplier_cost_cents,
        customer_price_cents: r.customer_price_cents,
      };
    }
    // Fill missing cells
    for (const m of materials) {
      for (const rt of RATE_TYPES) {
        const k = buildKey(m.id, rt.key);
        if (!map[k]) {
          map[k] = {
            material_type_id: m.id,
            rate_type: rt.key,
            supplier_cost_cents: 0,
            customer_price_cents: 0,
          };
        }
      }
    }
    return map;
  });

  const [saving, setSaving] = useState(false);

  const updateCell = (key: string, field: "supplier_cost_cents" | "customer_price_cents", rands: string) => {
    setCells((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: randsToCents(rands) },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const rows = Object.values(cells).map(({ id, ...rest }) => ({
      ...rest,
      ...(id ? { id } : {}),
    }));
    const result = await bulkUpsertRates(rows);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("All rates saved");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Material Rates</h2>
          <p className="text-sm text-muted-foreground">
            Supplier cost and customer price per m² for each material.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Rates
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">Rate Type</th>
              {materials.map((m) => (
                <th key={m.id} className="px-2 py-2 text-center font-medium" colSpan={1}>
                  {m.name?.en ?? m.slug}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_TYPES.map((rt) => (
              <tr key={rt.key} className="border-b last:border-0">
                <td className="whitespace-nowrap px-2 py-3 font-medium">{rt.label}</td>
                {materials.map((m) => {
                  const k = buildKey(m.id, rt.key);
                  const cell = cells[k];
                  if (!cell) return <td key={m.id} />;
                  const pct = marginPct(cell.customer_price_cents, cell.supplier_cost_cents);
                  return (
                    <td key={m.id} className="px-2 py-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="w-7 shrink-0 text-xs text-muted-foreground">Cost</span>
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="h-8 pl-6 text-xs tabular-nums"
                              value={centsToRands(cell.supplier_cost_cents)}
                              onChange={(e) => updateCell(k, "supplier_cost_cents", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-7 shrink-0 text-xs text-muted-foreground">Price</span>
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="h-8 pl-6 text-xs tabular-nums"
                              value={centsToRands(cell.customer_price_cents)}
                              onChange={(e) => updateCell(k, "customer_price_cents", e.target.value)}
                            />
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${marginColour(pct)}`}>
                          {pct}% margin
                        </Badge>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
