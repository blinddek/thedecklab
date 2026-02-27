"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { upsertMarkup, deleteMarkup } from "@/lib/admin/configurator-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

interface Props {
  readonly markups: AnyRow[];
  readonly materials: AnyRow[];
}

export function MarkupTab({ markups: initial, materials }: Props) {
  const [items, setItems] = useState<AnyRow[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);

  const globalMarkup = items.find((m) => m.scope_type === "global");
  const materialMarkups = items.filter((m) => m.scope_type === "material");

  const [globalPct, setGlobalPct] = useState(globalMarkup?.markup_percent ?? 40);

  const handleSaveGlobal = async () => {
    setSaving("global");
    const result = await upsertMarkup({
      ...(globalMarkup?.id ? { id: globalMarkup.id } : {}),
      scope_type: "global",
      scope_id: null,
      markup_percent: Number(globalPct),
    });
    setSaving(null);
    if (result.error) toast.error(result.error);
    else toast.success("Global markup saved");
  };

  const materialPct = (materialId: string) => {
    const row = materialMarkups.find((m) => m.scope_id === materialId);
    return row?.markup_percent ?? null;
  };

  const handleSaveMaterial = async (materialId: string, pct: number) => {
    const existing = materialMarkups.find((m) => m.scope_id === materialId);
    setSaving(materialId);
    const result = await upsertMarkup({
      ...(existing?.id ? { id: existing.id } : {}),
      scope_type: "material",
      scope_id: materialId,
      markup_percent: pct,
    });
    setSaving(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      // Update local state
      if (existing) {
        setItems((prev) =>
          prev.map((m) => (m.id === existing.id ? { ...m, markup_percent: pct } : m))
        );
      } else {
        setItems((prev) => [
          ...prev,
          { scope_type: "material", scope_id: materialId, markup_percent: pct },
        ]);
      }
      toast.success("Material markup saved");
    }
  };

  const handleRemoveMaterial = async (materialId: string) => {
    const existing = materialMarkups.find((m) => m.scope_id === materialId);
    if (!existing?.id) return;
    setSaving(materialId);
    const result = await deleteMarkup(existing.id);
    setSaving(null);
    if (result.error) toast.error(result.error);
    else {
      setItems((prev) => prev.filter((m) => m.id !== existing.id));
      toast.success("Override removed — inherits global");
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Markup */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Global Default Markup</h3>
          <p className="text-xs text-muted-foreground">
            Applied to all materials unless overridden below.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              step="0.5"
              min="0"
              max="100"
              className="w-28"
              value={globalPct}
              onChange={(e) => setGlobalPct(Number(e.target.value))}
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button size="sm" onClick={handleSaveGlobal} disabled={saving === "global"}>
              {saving === "global" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Material Overrides */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Material Overrides</h3>
          <p className="text-xs text-muted-foreground">
            Set material-specific markup. Empty = inherits global ({globalPct}%).
          </p>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Material</th>
                <th className="px-2 py-2">Override %</th>
                <th className="px-2 py-2">Effective</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const override = materialPct(m.id);
                const effective = override ?? globalPct;
                return (
                  <MaterialRow
                    key={m.id}
                    name={m.name?.en ?? m.slug}
                    materialId={m.id}
                    override={override}
                    effective={effective}
                    saving={saving === m.id}
                    onSave={(pct) => handleSaveMaterial(m.id, pct)}
                    onRemove={() => handleRemoveMaterial(m.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function MaterialRow({
  name,
  materialId,
  override,
  effective,
  saving,
  onSave,
  onRemove,
}: {
  name: string;
  materialId: string;
  override: number | null;
  effective: number;
  saving: boolean;
  onSave: (pct: number) => void;
  onRemove: () => void;
}) {
  const [pct, setPct] = useState(override ?? effective);
  const [edited, setEdited] = useState(false);

  return (
    <tr className="border-b last:border-0">
      <td className="px-2 py-2 font-medium">{name}</td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            step="0.5"
            min="0"
            max="100"
            className="h-8 w-20 text-xs"
            value={pct}
            placeholder={String(effective)}
            onChange={(e) => {
              setPct(Number(e.target.value));
              setEdited(true);
            }}
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </td>
      <td className="px-2 py-2 text-xs">
        {effective}%
        {override === null && (
          <span className="ml-1 text-muted-foreground">(global)</span>
        )}
      </td>
      <td className="px-2 py-2">
        <div className="flex gap-1">
          {edited && (
            <Button size="icon" variant="ghost" className="h-7 w-7"
              onClick={() => onSave(pct)} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            </Button>
          )}
          {override !== null && (
            <Button size="icon" variant="ghost" className="h-7 w-7"
              onClick={onRemove} disabled={saving}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
