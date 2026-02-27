"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LocalizedInput } from "@/components/admin/localized-input";
import { upsertFinishOption, deleteFinishOption } from "@/lib/admin/configurator-actions";
import type { LocalizedString } from "@/types/cms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  readonly finishes: AnyRow[];
  readonly materials: AnyRow[];
}

export function FinishesTab({ finishes: initial, materials }: Props) {
  const [items, setItems] = useState<AnyRow[]>(initial);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("");

  const filtered = filter ? items.filter((f) => f.material_type_id === filter) : items;

  const update = (idx: number, key: string, value: unknown) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
  };

  const addNew = () => {
    setItems((prev) => [
      ...prev,
      {
        material_type_id: filter || materials[0]?.id || "",
        name: { en: "", af: "" },
        slug: "",
        hex_colour: "#808080",
        image_url: null,
        price_modifier_cents: 0,
        display_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const handleSave = async (realIdx: number) => {
    const item = items[realIdx];
    setSavingIdx(realIdx);
    const result = await upsertFinishOption({
      ...(item.id ? { id: item.id } : {}),
      material_type_id: item.material_type_id,
      name: item.name as LocalizedString,
      slug: item.slug || slugify((item.name as LocalizedString).en),
      hex_colour: item.hex_colour || null,
      image_url: item.image_url || null,
      price_modifier_cents: Number(item.price_modifier_cents),
      display_order: Number(item.display_order ?? 0),
      is_active: item.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else toast.success("Finish saved");
  };

  const handleDelete = async (realIdx: number) => {
    const item = items[realIdx];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== realIdx));
      return;
    }
    setSavingIdx(realIdx);
    const result = await deleteFinishOption(item.id);
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else {
      setItems((prev) => prev.filter((_, i) => i !== realIdx));
      toast.success("Finish deleted");
    }
  };

  const matName = (id: string) => materials.find((m) => m.id === id)?.name?.en ?? "Unknown";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Finish Options</h2>
        <div className="flex gap-2">
          <select
            className="rounded-md border bg-background px-2 py-1.5 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Materials</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.name?.en}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={addNew}>
            <Plus className="mr-1.5 h-4 w-4" />Add Finish
          </Button>
        </div>
      </div>

      {filtered.map((item) => {
        const realIdx = items.indexOf(item);
        return (
          <Card key={item.id ?? `new-${realIdx}`}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <LocalizedInput
                    label="Name"
                    value={item.name ?? { en: "", af: "" }}
                    onChange={(v) => {
                      update(realIdx, "name", v);
                      if (!item.id) update(realIdx, "slug", slugify(v.en));
                    }}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Material</Label>
                      <select
                        className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                        value={item.material_type_id}
                        onChange={(e) => update(realIdx, "material_type_id", e.target.value)}
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name?.en}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price Modifier (R/m²)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={((item.price_modifier_cents ?? 0) / 100).toFixed(2)}
                        onChange={(e) => update(realIdx, "price_modifier_cents", Math.round(parseFloat(e.target.value || "0") * 100))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Display Order</Label>
                      <Input
                        type="number" min="0"
                        value={item.display_order ?? 0}
                        onChange={(e) => update(realIdx, "display_order", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {/* Colour picker */}
                <div className="flex flex-col items-center gap-1.5 pt-6">
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: item.hex_colour || "#808080" }}
                  />
                  <input
                    type="color"
                    value={item.hex_colour || "#808080"}
                    onChange={(e) => update(realIdx, "hex_colour", e.target.value)}
                    className="h-7 w-10 cursor-pointer"
                  />
                  <Input
                    className="h-7 w-24 text-center text-xs"
                    value={item.hex_colour || ""}
                    onChange={(e) => update(realIdx, "hex_colour", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Material: {matName(item.material_type_id)}
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_active ?? true}
                    onCheckedChange={(c) => update(realIdx, "is_active", c)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(realIdx)} disabled={savingIdx === realIdx}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
                  </Button>
                  <Button size="sm" onClick={() => handleSave(realIdx)} disabled={savingIdx === realIdx}>
                    {savingIdx === realIdx && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
