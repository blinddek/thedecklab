/* eslint-disable react-hooks/static-components -- dynamic icon from CMS data */
import * as icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const fallback: LucideIcon = icons.HelpCircle;

function resolveIcon(name: string): LucideIcon {
  const key = name as keyof typeof icons;
  const icon = icons[key];
  // Lucide v0.300+ exports forwardRef components (typeof "object"), not plain functions
  if (icon != null && ("render" in (icon as object) || "displayName" in (icon as object))) {
    return icon as LucideIcon;
  }
  return fallback;
}

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = resolveIcon(name);
  return <Icon className={className} />;
}
