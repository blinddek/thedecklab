import { getBounds } from "@/lib/canvas/geometry";
import { CANVAS_COLOURS } from "./helpers";
import type { BoardLayoutResult, DeckDesign } from "@/types/deck";

/* ─── Shared helpers ───────────────────────────────────── */

function createCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(w, h);
  }
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function getCtx(canvas: HTMLCanvasElement | OffscreenCanvas): CanvasRenderingContext2D {
  return canvas.getContext("2d") as CanvasRenderingContext2D;
}

function canvasToDataUrl(canvas: HTMLCanvasElement | OffscreenCanvas): string {
  if (canvas instanceof HTMLCanvasElement) {
    return canvas.toDataURL("image/png");
  }
  // OffscreenCanvas — synchronous via transferToImageBitmap not available for PNG,
  // so we fall back. OffscreenCanvas.convertToBlob is async but we want sync.
  // For simplicity, if OffscreenCanvas, create a regular canvas and draw from it.
  const c = document.createElement("canvas");
  c.width = canvas.width;
  c.height = canvas.height;
  const ctx = c.getContext("2d")!;
  const bitmap = (canvas as OffscreenCanvas).transferToImageBitmap();
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return c.toDataURL("image/png");
}

interface ScaleInfo {
  scale: number;
  offsetX: number;
  offsetY: number;
}

function computeScale(
  polygon: [number, number][],
  canvasW: number,
  canvasH: number,
  padding: number = 80
): ScaleInfo {
  const bounds = getBounds(polygon);
  const deckW = bounds.maxX - bounds.minX;
  const deckH = bounds.maxY - bounds.minY;

  const availW = canvasW - padding * 2;
  const availH = canvasH - padding * 2;
  const scale = Math.min(availW / (deckW || 1), availH / (deckH || 1));

  const offsetX = (canvasW - deckW * scale) / 2 - bounds.minX * scale;
  const offsetY = (canvasH - deckH * scale) / 2 - bounds.minY * scale;

  return { scale, offsetX, offsetY };
}

function drawPolygonOutline(
  ctx: CanvasRenderingContext2D,
  polygon: [number, number][],
  s: ScaleInfo
) {
  if (polygon.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(polygon[0][0] * s.scale + s.offsetX, polygon[0][1] * s.scale + s.offsetY);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i][0] * s.scale + s.offsetX, polygon[i][1] * s.scale + s.offsetY);
  }
  ctx.closePath();
  ctx.fillStyle = CANVAS_COLOURS.polygon;
  ctx.fill();
  ctx.strokeStyle = CANVAS_COLOURS.polygonStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDimensionLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  side: "top" | "left"
) {
  const arrowSize = 6;
  ctx.save();
  ctx.strokeStyle = CANVAS_COLOURS.dimLine;
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.lineWidth = 1;
  ctx.font = "bold 13px Helvetica, sans-serif";

  // Main line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrow heads
  if (side === "top") {
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x1 + arrowSize, y1 - arrowSize / 2); ctx.lineTo(x1 + arrowSize, y1 + arrowSize / 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x2, y2); ctx.lineTo(x2 - arrowSize, y2 - arrowSize / 2); ctx.lineTo(x2 - arrowSize, y2 + arrowSize / 2); ctx.closePath(); ctx.fill();
    // Label centered above
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, (x1 + x2) / 2, y1 - 6);
  } else {
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x1 - arrowSize / 2, y1 + arrowSize); ctx.lineTo(x1 + arrowSize / 2, y1 + arrowSize); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x2, y2); ctx.lineTo(x2 - arrowSize / 2, y2 - arrowSize); ctx.lineTo(x2 + arrowSize / 2, y2 - arrowSize); ctx.closePath(); ctx.fill();
    // Label centered to left
    ctx.save();
    ctx.translate(x1 - 8, (y1 + y2) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawDimensions(
  ctx: CanvasRenderingContext2D,
  polygon: [number, number][],
  s: ScaleInfo
) {
  const bounds = getBounds(polygon);
  const deckW = bounds.maxX - bounds.minX;
  const deckH = bounds.maxY - bounds.minY;

  const left = bounds.minX * s.scale + s.offsetX;
  const right = bounds.maxX * s.scale + s.offsetX;
  const top = bounds.minY * s.scale + s.offsetY;
  const bottom = bounds.maxY * s.scale + s.offsetY;

  // Top dimension line (width)
  drawDimensionLine(ctx, left, top - 25, right, top - 25, `${Math.round(deckW)}mm`, "top");
  // Left dimension line (height)
  drawDimensionLine(ctx, left - 25, top, left - 25, bottom, `${Math.round(deckH)}mm`, "left");
}

/* ─── Board Layout Renderer ────────────────────────────── */

export function renderBoardLayoutToImage(
  layout: BoardLayoutResult,
  design: DeckDesign,
  width: number = 2400,
  height: number = 1600
): string {
  const canvas = createCanvas(width, height);
  const ctx = getCtx(canvas);
  const s = computeScale(design.polygon, width, height);

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Deck outline
  drawPolygonOutline(ctx, design.polygon, s);

  // Draw boards
  for (const board of layout.boards) {
    const isOffcut = board.source === "offcut";
    ctx.save();

    const bx = board.x * s.scale + s.offsetX;
    const by = board.y * s.scale + s.offsetY;
    const bw = board.length_mm * s.scale;
    const bh = board.width_mm * s.scale;

    if (board.rotation !== 0) {
      ctx.translate(bx, by);
      ctx.rotate((board.rotation * Math.PI) / 180);
      ctx.fillStyle = isOffcut ? CANVAS_COLOURS.offcutFill : CANVAS_COLOURS.boardFill;
      ctx.strokeStyle = isOffcut ? CANVAS_COLOURS.offcutStroke : CANVAS_COLOURS.boardStroke;
      ctx.lineWidth = 1;
      ctx.fillRect(0, 0, bw, bh);
      ctx.strokeRect(0, 0, bw, bh);

      // Board number label
      if (bw > 30 && bh > 10) {
        ctx.fillStyle = CANVAS_COLOURS.labelText;
        ctx.font = `${Math.max(9, Math.min(12, bh * 0.7))}px Helvetica`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const idx = board.id.replace(/\D/g, "");
        ctx.fillText(idx, bw / 2, bh / 2);
      }
    } else {
      ctx.fillStyle = isOffcut ? CANVAS_COLOURS.offcutFill : CANVAS_COLOURS.boardFill;
      ctx.strokeStyle = isOffcut ? CANVAS_COLOURS.offcutStroke : CANVAS_COLOURS.boardStroke;
      ctx.lineWidth = 1;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      // Board number label
      if (bw > 30 && bh > 10) {
        ctx.fillStyle = CANVAS_COLOURS.labelText;
        ctx.font = `${Math.max(9, Math.min(12, bh * 0.7))}px Helvetica`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const idx = board.id.replace(/\D/g, "");
        ctx.fillText(idx, bx + bw / 2, by + bh / 2);
      }
    }
    ctx.restore();
  }

  // Dimension annotations
  drawDimensions(ctx, design.polygon, s);

  // Legend
  const legendX = width - 220;
  const legendY = height - 60;

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(legendX - 10, legendY - 15, 220, 55);

  ctx.font = "bold 12px Helvetica";
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Legend", legendX, legendY);

  // New stock swatch
  ctx.fillStyle = CANVAS_COLOURS.boardFill;
  ctx.fillRect(legendX, legendY + 12, 16, 12);
  ctx.strokeStyle = CANVAS_COLOURS.boardStroke;
  ctx.strokeRect(legendX, legendY + 12, 16, 12);
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.font = "11px Helvetica";
  ctx.fillText("New stock", legendX + 22, legendY + 18);

  // Offcut swatch
  ctx.fillStyle = CANVAS_COLOURS.offcutFill;
  ctx.fillRect(legendX + 110, legendY + 12, 16, 12);
  ctx.strokeStyle = CANVAS_COLOURS.offcutStroke;
  ctx.strokeRect(legendX + 110, legendY + 12, 16, 12);
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.fillText("Offcut reuse", legendX + 132, legendY + 18);

  return canvasToDataUrl(canvas);
}

/* ─── Substructure Renderer ────────────────────────────── */

export function renderSubstructureToImage(
  layout: BoardLayoutResult,
  design: DeckDesign,
  width: number = 2400,
  height: number = 1600
): string {
  const canvas = createCanvas(width, height);
  const ctx = getCtx(canvas);
  const s = computeScale(design.polygon, width, height);

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Deck outline
  drawPolygonOutline(ctx, design.polygon, s);

  // Draw bearers (thick solid lines)
  ctx.save();
  ctx.strokeStyle = CANVAS_COLOURS.bearerStroke;
  ctx.lineWidth = 6;
  for (const bearer of layout.bearers) {
    const bx = bearer.x * s.scale + s.offsetX;
    const by = bearer.y * s.scale + s.offsetY;
    const bLen = bearer.length_mm * s.scale;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bLen, by);
    ctx.stroke();

    // Bearer label
    ctx.fillStyle = CANVAS_COLOURS.labelText;
    ctx.font = "10px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const idx = bearer.id.replace(/\D/g, "");
    ctx.fillText(`B${idx}`, bx + bLen / 2, by - 4);
  }
  ctx.restore();

  // Draw joists (dashed lines)
  ctx.save();
  ctx.strokeStyle = CANVAS_COLOURS.joistStroke;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  for (const joist of layout.joists) {
    const jx = joist.x * s.scale + s.offsetX;
    const jy = joist.y * s.scale + s.offsetY;
    const jLen = joist.length_mm * s.scale;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.lineTo(jx, jy + jLen);
    ctx.stroke();

    // Joist label
    ctx.fillStyle = CANVAS_COLOURS.labelText;
    ctx.font = "10px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const idx = joist.id.replace(/\D/g, "");
    ctx.fillText(`J${idx}`, jx, jy + jLen + 4);
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Dimension annotations
  drawDimensions(ctx, design.polygon, s);

  // Spacing annotations
  if (layout.joists.length >= 2) {
    const spacing = Math.abs(layout.joists[1].x - layout.joists[0].x);
    ctx.font = "bold 13px Helvetica";
    ctx.fillStyle = CANVAS_COLOURS.labelText;
    ctx.textAlign = "left";
    ctx.fillText(`Joist spacing: ${Math.round(spacing)}mm centres`, 20, height - 50);
  }
  if (layout.bearers.length >= 2) {
    const spacing = Math.abs(layout.bearers[1].y - layout.bearers[0].y);
    ctx.font = "bold 13px Helvetica";
    ctx.fillStyle = CANVAS_COLOURS.labelText;
    ctx.textAlign = "left";
    ctx.fillText(`Bearer spacing: ${Math.round(spacing)}mm centres`, 20, height - 30);
  }

  // Legend
  const legendX = width - 220;
  const legendY = height - 60;

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(legendX - 10, legendY - 15, 220, 55);

  ctx.font = "bold 12px Helvetica";
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Legend", legendX, legendY);

  // Bearer swatch
  ctx.strokeStyle = CANVAS_COLOURS.bearerStroke;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(legendX, legendY + 18); ctx.lineTo(legendX + 20, legendY + 18); ctx.stroke();
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.font = "11px Helvetica";
  ctx.fillText("Bearer", legendX + 26, legendY + 18);

  // Joist swatch
  ctx.strokeStyle = CANVAS_COLOURS.joistStroke;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 3]);
  ctx.beginPath(); ctx.moveTo(legendX + 110, legendY + 18); ctx.lineTo(legendX + 130, legendY + 18); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = CANVAS_COLOURS.labelText;
  ctx.fillText("Joist", legendX + 136, legendY + 18);

  return canvasToDataUrl(canvas);
}
