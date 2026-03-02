"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const Deck3DPreview = dynamic(
  () => import("./deck-3d-preview").then((mod) => mod.Deck3DPreview),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-lg border bg-background"
        style={{ aspectRatio: "16 / 10", minHeight: "300px" }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm">Loading 3D preview...</span>
        </div>
      </div>
    ),
  }
);
