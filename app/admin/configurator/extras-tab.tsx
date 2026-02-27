"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { LocalizedInput } from "@/components/admin/localized-input";
import {
  upsertExtra,
  deleteExtra,
  getAdminExtrasPricing,
  upsertExtraPricing,
  deleteExtraPricing,
} from "@/lib/admin/configurator-actions";
import type { LocalizedString } from "@/types/cms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

const PRICING_MODELS = [
  { value: "per_step_metre", label: "Per step-metre" },
  { value: "per_linear_metre", label: "Per linear metre" },
  { value: "per_unit", label: "Per unit" },
  { value: "per_m2", label: "Per m\u00B2" },
  { value: "fixed", label: "Fixed price" },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function marginPct(customer: number, supplier: number) {
  if (customer <= 0) return 0;
  return Math.round(((customer - supplier) / customer) * 100);
}

interface Props {
  readonly extras: AnyRow[];
  readonly materials: AnyRow[];
}

export function ExtrasTab({ extras: initial, materials }: Props) {
  const [items, setItems] = useState<AnyRow[]>(initial);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  const update = (idx: number, key: string, value: unknown) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
  };

  const addNew = () => {
    setItems((prev) => [
      ...prev,
      {
        name: { en: "", af: "" },
        slug: "",
        description: { en: "", af: "" },
        icon: null,
        pricing_model: "per_linear_metre",
        display_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const handleSave = async (idx: number) => {
    const item = items[idx];
    setSavingIdx(idx);
    const result = await upsertExtra({
      ...(item.id ? { id: item.id } : {}),
      name: item.name as LocalizedString,
      slug: item.slug || slugify((item.name as LocalizedString).en),
      description: item.description || null,
      icon: item.icon || null,
      pricing_model: item.pricing_model,
      display_order: Number(item.display_order ?? idx),
      is_active: item.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else toast.success("Extra saved");
  };

  const handleDelete = async (idx: number) => {
    const item = items[idx];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setSavingIdx(idx);
    const result = await deleteExtra(item.id);
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Extra deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configurator Extras</h2>
        <Button variant="outline" size="sm" onClick={addNew}>
          <Plus className="mr-1.5 h-4 w-4" />Add Extra
        </Button>
      </div>

      {items.map((item, idx) => (
        <Card key={item.id ?? `new-${idx}`}>
          <CardContent className="space-y-4 pt-6">
            <LocalizedInput
              label="Name"
              value={item.name ?? { en: "", af: "" }}
              onChange={(v) => {
                update(idx, "name", v);
                if (!item.id) update(idx, "slug", slugify(v.en));
              }}
            />
            <LocalizedInput
              label="Description"
              value={item.description ?? { en: "", af: "" }}
              onChange={(v) => update(idx, "description", v)}
              multiline
              rows={2}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Pricing Model</Label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  value={item.pricing_model}
                  onChange={(e) => update(idx, "pricing_model", e.target.value)}
                >
                  {PRICING_MODELS.map((pm) => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Display Order</Label>
                <Input
                  type="number" min="0"
                  value={item.display_order ?? 0}
                  onChange={(e) => update(idx, "display_order", e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  checked={item.is_active ?? true}
                  onCheckedChange={(c) => update(idx, "is_active", c)}
                />
                <span className="text-xs text-muted-foreground">{item.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="destructive" size="sm" onClick={() => handleDelete(idx)} disabled={savingIdx === idx}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
              </Button>
              <Button size="sm" onClick={() => handleSave(idx)} disabled={savingIdx === idx}>
                {savingIdx === idx && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}Save
              </Button>
            </div>

            {/* Pricing variants (lazy-loaded) */}
            {item.id && <PricingVariants extraId={item.id} materials={materials} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Pricing Variants Sub-Table ──────────────────────────────── */

function PricingVariants({
  extraId,
  materials,
}: {
  extraId: string;
  materials: AnyRow[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [variants, setVariants] = useState<AnyRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  const loadVariants = useCallback(async () => {
    setLoading(true);
    const data = await getAdminExtrasPricing(extraId);
    setVariants(data);
    setLoading(false);
  }, [extraId]);

  const toggle = () => {
    if (!expanded && variants === null) loadVariants();
    setExpanded((prev) => !prev);
  };

  const updateVariant = (idx: number, key: string, value: unknown) => {
    setVariants((prev) =>
      prev ? prev.map((v, i) => (i === idx ? { ...v, [key]: value } : v)) : prev
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...(prev ?? []),
      {
        extra_id: extraId,
        material_type_id: null,
        variant_label: "",
        supplier_cost_cents: 0,
        customer_price_cents: 0,
        display_order: (prev ?? []).length,
        is_active: true,
      },
    ]);
  };

  const handleSaveVariant = async (idx: number) => {
    if (!variants) return;
    const v = variants[idx];
    setSavingIdx(idx);
    const result = await upsertExtraPricing({
      ...(v.id ? { id: v.id } : {}),
      extra_id: extraId,
      material_type_id: v.material_type_id || null,
      variant_label: v.variant_label || null,
      supplier_cost_cents: Number(v.supplier_cost_cents),
      customer_price_cents: Number(v.customer_price_cents),
      display_order: Number(v.display_order ?? idx),
      is_active: v.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else toast.success("Variant saved");
  };

  const handleDeleteVariant = async (idx: number) => {
    if (!variants) return;
    const v = variants[idx];
    if (!v.id) {
      setVariants((prev) => prev?.filter((_, i) => i !== idx) ?? null);
      return;
    }
    setSavingIdx(idx);
    const result = await deleteExtraPricing(v.id);
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else {
      setVariants((prev) => prev?.filter((_, i) => i !== idx) ?? null);
      toast.success("Variant deleted");
    }
  };

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Pricing Variants
        {variants && <Badge variant="secondary" className="ml-1 text-[10px]">{variants.length}</Badge>}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {variants && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-2 py-1.5">Variant</th>
                      <th className="px-2 py-1.5">Material</th>
                      <th className="px-2 py-1.5">Cost (R)</th>
                      <th className="px-2 py-1.5">Price (R)</th>
                      <th className="px-2 py-1.5">Margin</th>
                      <th className="px-2 py-1.5">Active</th>
                      <th className="px-2 py-1.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => {
                      const pct = marginPct(v.customer_price_cents, v.supplier_cost_cents);
                      return (
                        <tr key={v.id ?? `new-${idx}`} className="border-b last:border-0">
                          <td className="px-2 py-1.5">
                            <Input className="h-7 w-32 text-xs" value={v.variant_label ?? ""}
                              onChange={(e) => updateVariant(idx, "variant_label", e.target.value)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <select
                              className="rounded border bg-background px-1 py-0.5 text-xs"
                              value={v.material_type_id ?? ""}
                              onChange={(e) => updateVariant(idx, "material_type_id", e.target.value || null)}
                            >
                              <option value="">All</option>
                              {materials.map((m) => <option key={m.id} value={m.id}>{m.name?.en}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <Input type="number" step="0.01" className="h-7 w-24 text-xs"
                              value={(v.supplier_cost_cents / 100).toFixed(2)}
                              onChange={(e) => updateVariant(idx, "supplier_cost_cents", Math.round(parseFloat(e.target.value || "0") * 100))} />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input type="number" step="0.01" className="h-7 w-24 text-xs"
                              value={(v.customer_price_cents / 100).toFixed(2)}
                              onChange={(e) => updateVariant(idx, "customer_price_cents", Math.round(parseFloat(e.target.value || "0") * 100))} />
                          </td>
                          <td className="px-2 py-1.5 text-xs">{pct}%</td>
                          <td className="px-2 py-1.5">
                            <Switch checked={v.is_active ?? true}
                              onCheckedChange={(c) => updateVariant(idx, "is_active", c)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => handleDeleteVariant(idx)} disabled={savingIdx === idx}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" className="h-7 text-xs"
                                onClick={() => handleSaveVariant(idx)} disabled={savingIdx === idx}>
                                {savingIdx === idx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="mr-1 h-3.5 w-3.5" />Add Variant
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
