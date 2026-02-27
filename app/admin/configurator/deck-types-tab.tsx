"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LocalizedInput } from "@/components/admin/localized-input";
import { ImageUpload } from "@/components/admin/image-upload";
import { upsertDeckType, deleteDeckType } from "@/lib/admin/configurator-actions";
import type { LocalizedString } from "@/types/cms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  readonly deckTypes: AnyRow[];
  readonly extras: AnyRow[];
}

export function DeckTypesTab({ deckTypes: initial, extras }: Props) {
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
        image_url: null,
        complexity_multiplier: 1,
        labour_complexity_multiplier: 1,
        applicable_extras: [],
        display_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const handleSave = async (idx: number) => {
    const item = items[idx];
    setSavingIdx(idx);
    const result = await upsertDeckType({
      ...(item.id ? { id: item.id } : {}),
      name: item.name as LocalizedString,
      slug: item.slug || slugify((item.name as LocalizedString).en),
      description: item.description || null,
      image_url: item.image_url || null,
      complexity_multiplier: Number(item.complexity_multiplier),
      labour_complexity_multiplier: Number(item.labour_complexity_multiplier),
      applicable_extras: item.applicable_extras ?? [],
      display_order: Number(item.display_order ?? idx),
      is_active: item.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Deck type saved");
    }
  };

  const handleDelete = async (idx: number) => {
    const item = items[idx];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setSavingIdx(idx);
    const result = await deleteDeckType(item.id);
    setSavingIdx(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Deck type deleted");
    }
  };

  const toggleExtra = (idx: number, extraId: string, checked: boolean) => {
    const current: string[] = items[idx].applicable_extras ?? [];
    const next = checked ? [...current, extraId] : current.filter((id: string) => id !== extraId);
    update(idx, "applicable_extras", next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Deck Types</h2>
        <Button variant="outline" size="sm" onClick={addNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Type
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

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload
                value={item.image_url}
                onChange={(v) => update(idx, "image_url", v)}
                folder="configurator/deck-types"
              />
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Complexity Multiplier</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="3"
                    value={item.complexity_multiplier}
                    onChange={(e) => update(idx, "complexity_multiplier", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Labour Multiplier</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="3"
                    value={item.labour_complexity_multiplier}
                    onChange={(e) => update(idx, "labour_complexity_multiplier", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Display Order</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.display_order ?? 0}
                    onChange={(e) => update(idx, "display_order", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Applicable extras */}
            <div className="space-y-2">
              <Label className="text-xs">Applicable Extras</Label>
              <div className="flex flex-wrap gap-3">
                {extras.map((ex) => {
                  const checked = (item.applicable_extras ?? []).includes(ex.id);
                  return (
                    <label key={ex.id} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => toggleExtra(idx, ex.id, !!c)}
                      />
                      {ex.name?.en ?? ex.slug}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.is_active ?? true}
                  onCheckedChange={(c) => update(idx, "is_active", c)}
                />
                <span className="text-xs text-muted-foreground">
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(idx)}
                  disabled={savingIdx === idx}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button size="sm" onClick={() => handleSave(idx)} disabled={savingIdx === idx}>
                  {savingIdx === idx && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
