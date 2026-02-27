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
import { ImageUpload } from "@/components/admin/image-upload";
import {
  upsertBoardDirection,
  deleteBoardDirection,
  upsertBoardProfile,
  deleteBoardProfile,
  upsertBoardDimension,
  deleteBoardDimension,
} from "@/lib/admin/configurator-actions";
import type { LocalizedString } from "@/types/cms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  readonly directions: AnyRow[];
  readonly profiles: AnyRow[];
  readonly dimensions: AnyRow[];
  readonly materials: AnyRow[];
}

export function BoardOptionsTab({
  directions: initDirections,
  profiles: initProfiles,
  dimensions: initDimensions,
  materials,
}: Props) {
  return (
    <div className="space-y-8">
      <DirectionsSection initial={initDirections} />
      <ProfilesSection initial={initProfiles} />
      <DimensionsSection initial={initDimensions} materials={materials} />
    </div>
  );
}

/* ─── Directions ──────────────────────────────────────────────── */

function DirectionsSection({ initial }: { initial: AnyRow[] }) {
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
        material_multiplier: 1,
        labour_multiplier: 1,
        display_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const handleSave = async (idx: number) => {
    const item = items[idx];
    setSavingIdx(idx);
    const result = await upsertBoardDirection({
      ...(item.id ? { id: item.id } : {}),
      name: item.name as LocalizedString,
      slug: item.slug || slugify((item.name as LocalizedString).en),
      description: item.description || null,
      image_url: item.image_url || null,
      material_multiplier: Number(item.material_multiplier),
      labour_multiplier: Number(item.labour_multiplier),
      display_order: Number(item.display_order ?? idx),
      is_active: item.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else toast.success("Direction saved");
  };

  const handleDelete = async (idx: number) => {
    const item = items[idx];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setSavingIdx(idx);
    const result = await deleteBoardDirection(item.id);
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Direction deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Board Directions</h2>
        <Button variant="outline" size="sm" onClick={addNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Direction
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
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Material Multiplier</Label>
                <Input
                  type="number" step="0.01" min="0.5" max="3"
                  value={item.material_multiplier}
                  onChange={(e) => update(idx, "material_multiplier", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Labour Multiplier</Label>
                <Input
                  type="number" step="0.01" min="0.5" max="3"
                  value={item.labour_multiplier}
                  onChange={(e) => update(idx, "labour_multiplier", e.target.value)}
                />
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Profiles ────────────────────────────────────────────────── */

function ProfilesSection({ initial }: { initial: AnyRow[] }) {
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
        price_modifier_percent: 0,
        display_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const handleSave = async (idx: number) => {
    const item = items[idx];
    setSavingIdx(idx);
    const result = await upsertBoardProfile({
      ...(item.id ? { id: item.id } : {}),
      name: item.name as LocalizedString,
      slug: item.slug || slugify((item.name as LocalizedString).en),
      description: item.description || null,
      image_url: item.image_url || null,
      price_modifier_percent: Number(item.price_modifier_percent),
      display_order: Number(item.display_order ?? idx),
      is_active: item.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else toast.success("Profile saved");
  };

  const handleDelete = async (idx: number) => {
    const item = items[idx];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setSavingIdx(idx);
    const result = await deleteBoardProfile(item.id);
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Profile deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Board Profiles</h2>
        <Button variant="outline" size="sm" onClick={addNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Profile
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Price Modifier %</Label>
                <Input
                  type="number" step="0.1" min="-50" max="100"
                  value={item.price_modifier_percent}
                  onChange={(e) => update(idx, "price_modifier_percent", e.target.value)}
                />
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Board Dimensions ────────────────────────────────────────── */

const BOARD_TYPES = ["deck_board", "joist", "bearer"] as const;

function DimensionsSection({ initial, materials }: { initial: AnyRow[]; materials: AnyRow[] }) {
  const [items, setItems] = useState<AnyRow[]>(initial);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("");

  const filtered = filter ? items.filter((d) => d.material_type_id === filter) : items;

  const update = (idx: number, key: string, value: unknown) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
  };

  const addNew = () => {
    setItems((prev) => [
      ...prev,
      {
        material_type_id: filter || materials[0]?.id || "",
        board_type: "deck_board",
        width_mm: 0,
        thickness_mm: 0,
        available_lengths_mm: [],
        price_per_metre_cents: 0,
        display_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const handleSave = async (realIdx: number) => {
    const item = items[realIdx];
    setSavingIdx(realIdx);
    const result = await upsertBoardDimension({
      ...(item.id ? { id: item.id } : {}),
      material_type_id: item.material_type_id,
      board_type: item.board_type,
      width_mm: Number(item.width_mm),
      thickness_mm: Number(item.thickness_mm),
      available_lengths_mm: Array.isArray(item.available_lengths_mm)
        ? item.available_lengths_mm.map(Number)
        : String(item.available_lengths_mm).split(",").map((s: string) => Number(s.trim())).filter(Boolean),
      price_per_metre_cents: Number(item.price_per_metre_cents ?? 0),
      display_order: Number(item.display_order ?? 0),
      is_active: item.is_active ?? true,
    });
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else toast.success("Dimension saved");
  };

  const handleDelete = async (realIdx: number) => {
    const item = items[realIdx];
    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== realIdx));
      return;
    }
    setSavingIdx(realIdx);
    const result = await deleteBoardDimension(item.id);
    setSavingIdx(null);
    if (result.error) toast.error(result.error);
    else {
      setItems((prev) => prev.filter((_, i) => i !== realIdx));
      toast.success("Dimension deleted");
    }
  };

  const matName = (id: string) => materials.find((m) => m.id === id)?.name?.en ?? "Unknown";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Board Dimensions</h2>
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
            <Plus className="mr-1.5 h-4 w-4" />Add
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-2 py-2">Material</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Width mm</th>
              <th className="px-2 py-2">Thick mm</th>
              <th className="px-2 py-2">Lengths mm</th>
              <th className="px-2 py-2">R/metre</th>
              <th className="px-2 py-2">Active</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const realIdx = items.indexOf(item);
              return (
                <tr key={item.id ?? `new-${realIdx}`} className="border-b last:border-0">
                  <td className="px-2 py-1.5 text-xs">{matName(item.material_type_id)}</td>
                  <td className="px-2 py-1.5">
                    <select
                      className="rounded border bg-background px-1 py-0.5 text-xs"
                      value={item.board_type}
                      onChange={(e) => update(realIdx, "board_type", e.target.value)}
                    >
                      {BOARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="number" className="h-7 w-20 text-xs" value={item.width_mm}
                      onChange={(e) => update(realIdx, "width_mm", e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="number" className="h-7 w-20 text-xs" value={item.thickness_mm}
                      onChange={(e) => update(realIdx, "thickness_mm", e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input className="h-7 w-40 text-xs" placeholder="2400,3000,3600"
                      value={Array.isArray(item.available_lengths_mm) ? item.available_lengths_mm.join(", ") : item.available_lengths_mm}
                      onChange={(e) => update(realIdx, "available_lengths_mm", e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input type="number" className="h-7 w-24 text-xs" step="0.01"
                      value={((item.price_per_metre_cents ?? 0) / 100).toFixed(2)}
                      onChange={(e) => update(realIdx, "price_per_metre_cents", Math.round(parseFloat(e.target.value || "0") * 100))} />
                  </td>
                  <td className="px-2 py-1.5">
                    <Switch checked={item.is_active ?? true}
                      onCheckedChange={(c) => update(realIdx, "is_active", c)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => handleDelete(realIdx)} disabled={savingIdx === realIdx}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => handleSave(realIdx)} disabled={savingIdx === realIdx}>
                        {savingIdx === realIdx
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <span className="text-xs font-medium">Save</span>}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
