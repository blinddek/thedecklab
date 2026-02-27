import type jsPDF from "jspdf";

/* ─── Brand Colours (RGB tuples for jsPDF) ─────────────── */

export const BRAND = {
  ember: [212, 98, 42] as [number, number, number],        // #D4622A
  board: [201, 169, 110] as [number, number, number],      // #C9A96E
  offcutGreen: [123, 173, 110] as [number, number, number],// #7BAD6E
  ironwood: [30, 30, 28] as [number, number, number],      // #1E1E1C
  driftwood: [115, 107, 98] as [number, number, number],   // #736B62
  grain: [222, 214, 204] as [number, number, number],      // #DED6CC
  sandstone: [247, 243, 238] as [number, number, number],  // #F7F3EE
  white: [255, 255, 255] as [number, number, number],
};

/* ─── Canvas hex versions for the renderer ─────────────── */

export const CANVAS_COLOURS = {
  boardFill: "rgba(201,169,110,0.35)",
  boardStroke: "rgba(170,140,80,0.7)",
  offcutFill: "rgba(123,173,110,0.35)",
  offcutStroke: "rgba(90,140,70,0.7)",
  joistStroke: "rgba(80,120,180,0.6)",
  bearerStroke: "rgba(100,100,100,0.7)",
  polygon: "rgba(30,30,28,0.15)",
  polygonStroke: "rgba(30,30,28,0.5)",
  labelText: "#1E1E1C",
  dimLine: "#736B62",
};

/* ─── Page header ──────────────────────────────────────── */

export function drawPageHeader(doc: jsPDF, title: string) {
  const pageW = doc.internal.pageSize.getWidth();

  // "THE DECK LAB" brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.driftwood);
  doc.text("THE DECK LAB", 15, 12);

  // Page title
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.ironwood);
  doc.text(title, 15, 22);

  // Ember rule
  doc.setDrawColor(...BRAND.ember);
  doc.setLineWidth(0.8);
  doc.line(15, 25, pageW - 15, 25);
}

/* ─── Page footer (called after all content rendered) ──── */

export function drawPageFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  date: string
) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const y = pageH - 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.driftwood);

  doc.text(`Page ${pageNum} of ${totalPages}`, 15, y);
  doc.text("thedecklab.co.za", pageW / 2, y, { align: "center" });
  doc.text(date, pageW - 15, y, { align: "right" });
}

/* ─── Formatters ───────────────────────────────────────── */

export function formatMm(mm: number): string {
  return `${Math.round(mm)}mm`;
}

export function formatRand(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function findOptionName(
  items: { id: string; name: { en: string } }[],
  id: string
): string {
  return items.find((i) => i.id === id)?.name.en ?? "—";
}

/* ─── Logo loader (fetch + base64 cache) ───────────────── */

let _logoCache: string | null = null;

export async function loadLogoBase64(): Promise<string> {
  if (_logoCache) return _logoCache;
  const res = await fetch("/logo.png");
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      _logoCache = reader.result as string;
      resolve(_logoCache);
    };
    reader.readAsDataURL(blob);
  });
}
