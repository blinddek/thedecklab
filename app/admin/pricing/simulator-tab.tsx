"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { simulatePrice } from "@/lib/admin/configurator-actions";
import type { SimulatorResult } from "@/lib/admin/configurator-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function formatRands(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function marginColour(pct: number) {
  if (pct >= 30) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (pct >= 20) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

interface Props {
  readonly materials: AnyRow[];
  readonly deckTypes: AnyRow[];
  readonly directions: AnyRow[];
  readonly profiles: AnyRow[];
  readonly finishes: AnyRow[];
  readonly extras: AnyRow[];
}

export function SimulatorTab({
  materials,
  deckTypes,
  directions,
  profiles,
  finishes,
}: Props) {
  const [config, setConfig] = useState({
    deck_type_id: deckTypes[0]?.id ?? "",
    material_type_id: materials[0]?.id ?? "",
    length_m: 4,
    width_m: 3,
    board_direction_id: directions[0]?.id ?? "",
    board_profile_id: profiles[0]?.id ?? "",
    finish_option_id: "",
    include_installation: false,
  });

  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const filteredFinishes = finishes.filter(
    (f) => f.material_type_id === config.material_type_id && f.is_active
  );

  const handleCalculate = async () => {
    setLoading(true);
    const res = await simulatePrice({
      ...config,
      length_m: Number(config.length_m),
      width_m: Number(config.width_m),
      finish_option_id: config.finish_option_id || undefined,
      extras: [],
    });
    setLoading(false);
    if ("error" in res) {
      toast.error(res.error);
      setResult(null);
    } else {
      setResult(res);
    }
  };

  const q = result?.quote;
  const s = result?.supplierCosts;
  const m = result?.margins;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Config Form */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Configuration</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Material</Label>
              <select className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                value={config.material_type_id}
                onChange={(e) => update("material_type_id", e.target.value)}>
                {materials.map((m) => <option key={m.id} value={m.id}>{m.name?.en}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Deck Type</Label>
              <select className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                value={config.deck_type_id}
                onChange={(e) => update("deck_type_id", e.target.value)}>
                {deckTypes.map((d) => <option key={d.id} value={d.id}>{d.name?.en}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Length (m)</Label>
              <Input type="number" step="0.1" min="1" max="20"
                value={config.length_m}
                onChange={(e) => update("length_m", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Width (m)</Label>
              <Input type="number" step="0.1" min="1" max="20"
                value={config.width_m}
                onChange={(e) => update("width_m", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Board Direction</Label>
              <select className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                value={config.board_direction_id}
                onChange={(e) => update("board_direction_id", e.target.value)}>
                {directions.map((d) => <option key={d.id} value={d.id}>{d.name?.en}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Board Profile</Label>
              <select className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                value={config.board_profile_id}
                onChange={(e) => update("board_profile_id", e.target.value)}>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.name?.en}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Finish</Label>
            <select className="w-full rounded-md border bg-background px-2 py-2 text-sm"
              value={config.finish_option_id}
              onChange={(e) => update("finish_option_id", e.target.value)}>
              <option value="">No finish</option>
              {filteredFinishes.map((f) => <option key={f.id} value={f.id}>{f.name?.en}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={config.include_installation}
              onCheckedChange={(c) => update("include_installation", c)} />
            <Label className="text-xs">Include Installation</Label>
          </div>

          <Button onClick={handleCalculate} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate Quote
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Quote Breakdown</h3>
          {q && (
            <p className="text-xs text-muted-foreground">
              Area: {q.area_m2.toFixed(1)} m²
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!q ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Configure and click Calculate to see results.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-1.5">Line Item</th>
                    <th className="py-1.5 text-right">Supplier</th>
                    <th className="py-1.5 text-right">Customer</th>
                    <th className="py-1.5 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <QuoteLine label="Materials" supplier={s!.materials_cents} customer={q.materials_cents} margin={m!.materials_pct} />
                  <QuoteLine label="Substructure" supplier={s!.substructure_cents} customer={q.substructure_cents} margin={m!.substructure_pct} />
                  <QuoteLine label="Fixings" supplier={s!.fixings_cents} customer={q.fixings_cents} margin={m!.fixings_pct} />
                  {q.staining_cents > 0 && (
                    <QuoteLine label="Staining" supplier={s!.staining_cents} customer={q.staining_cents} />
                  )}
                  {q.labour_cents > 0 && (
                    <tr className="border-b">
                      <td className="py-1.5">Labour</td>
                      <td className="py-1.5 text-right text-muted-foreground">—</td>
                      <td className="py-1.5 text-right tabular-nums">{formatRands(q.labour_cents)}</td>
                      <td />
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t font-medium">
                    <td className="py-1.5">Subtotal</td>
                    <td />
                    <td className="py-1.5 text-right tabular-nums">{formatRands(q.subtotal_cents)}</td>
                    <td className="py-1.5 text-right">
                      <Badge variant="outline" className={`text-[10px] ${marginColour(m!.overall_pct)}`}>
                        {m!.overall_pct}%
                      </Badge>
                    </td>
                  </tr>
                  {q.delivery_fee_cents > 0 && (
                    <tr>
                      <td className="py-1">Delivery</td>
                      <td />
                      <td className="py-1 text-right tabular-nums">{formatRands(q.delivery_fee_cents)}</td>
                      <td />
                    </tr>
                  )}
                  <tr>
                    <td className="py-1">VAT (15%)</td>
                    <td />
                    <td className="py-1 text-right tabular-nums">{formatRands(q.vat_cents)}</td>
                    <td />
                  </tr>
                  <tr className="border-t text-base font-bold">
                    <td className="py-2">Total</td>
                    <td />
                    <td className="py-2 text-right tabular-nums">{formatRands(q.total_cents)}</td>
                    <td />
                  </tr>
                  {q.deposit_cents > 0 && (
                    <>
                      <tr className="text-xs text-muted-foreground">
                        <td className="py-0.5">Deposit (50%)</td>
                        <td />
                        <td className="py-0.5 text-right tabular-nums">{formatRands(q.deposit_cents)}</td>
                        <td />
                      </tr>
                      <tr className="text-xs text-muted-foreground">
                        <td className="py-0.5">Balance</td>
                        <td />
                        <td className="py-0.5 text-right tabular-nums">{formatRands(q.balance_cents)}</td>
                        <td />
                      </tr>
                    </>
                  )}
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuoteLine({
  label,
  supplier,
  customer,
  margin,
}: {
  label: string;
  supplier: number;
  customer: number;
  margin?: number;
}) {
  return (
    <tr className="border-b">
      <td className="py-1.5">{label}</td>
      <td className="py-1.5 text-right tabular-nums text-muted-foreground">
        {formatRands(supplier)}
      </td>
      <td className="py-1.5 text-right tabular-nums">{formatRands(customer)}</td>
      <td className="py-1.5 text-right">
        {margin !== undefined && (
          <Badge variant="outline" className={`text-[10px] ${marginColour(margin)}`}>
            {margin}%
          </Badge>
        )}
      </td>
    </tr>
  );
}
