"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  lShapeToPolygon,
  calculateArea,
  calculatePerimeter,
  shapeToPolygon,
  snapToGrid,
} from "@/lib/canvas/geometry";
import type { DeckDesign, DeckShape, DesignMode, BoardLayoutResult } from "@/types/deck";
import Link from "next/link";
import {
  Square,
  Circle,
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
  Trash2,
  MessageSquare,
  Scissors,
} from "lucide-react";

/* ─── Toolbar shape icons (inline SVG) ──────────────────── */

function RoundedRectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3.5" width="13" height="9" rx="2.5" />
    </svg>
  );
}

function LShapeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2 L3 14 L13 14 L13 10 L7 10 L7 2 Z" />
    </svg>
  );
}

/* ─── Constants ─────────────────────────────────────────── */

const GRID_SIZE_MM = 100; // 100mm grid lines
const SNAP_SIZE_MM = 50; // snap to 50mm
const MIN_ZOOM = 0.02;  // must handle up to 200 m² decks (~14 m wide)
const MAX_ZOOM = 4;
const MM_PER_M = 1000;

// Colours — hardcoded to avoid CSS variable resolution failures in canvas context
const PRIMARY_FILL = "rgba(212, 98, 42, 0.20)";          // ember at 20%
const PRIMARY_STROKE = "#D4622A";                          // ember
const PRIMARY_FILL_SELECTED = "rgba(212, 98, 42, 0.38)";  // ember at 38%
const GRID_LINE_COLOR = "rgba(255,255,255,0.04)";
const LABEL_COLOR = "#D4C9BC";                             // warm white
const LABEL_BG = "rgba(15, 14, 13, 0.82)";                // near-black glass
const CUTOUT_FILL = "rgba(239, 68, 68, 0.10)";
const CUTOUT_STROKE = "rgba(239, 68, 68, 0.65)";

/* ─── Helper: generate a short unique id ────────────────── */

let _idCounter = 0;
function uniqueId(): string {
  _idCounter += 1;
  return `shape-${Date.now()}-${_idCounter}`;
}

/* ─── Helper: build DeckDesign from shapes ──────────────── */

function buildDesign(shapes: DeckShape[]): DeckDesign {
  let positiveAreaMm2 = 0;
  let negativeAreaMm2 = 0;
  let totalPerimeterMm = 0;
  const allPolygonPoints: [number, number][] = [];

  for (const shape of shapes) {
    const poly = shapeToPolygon(shape);
    const area = calculateArea(poly);
    if (shape.inverted) {
      negativeAreaMm2 += area;
    } else {
      positiveAreaMm2 += area;
    }
    totalPerimeterMm += calculatePerimeter(poly);
    allPolygonPoints.push(...poly);
  }

  const totalAreaMm2 = Math.max(0, positiveAreaMm2 - negativeAreaMm2);
  const nonInverted = shapes.filter(s => !s.inverted);
  const polygon: [number, number][] =
    nonInverted.length === 1 ? shapeToPolygon(nonInverted[0]) : allPolygonPoints;

  return {
    shapes,
    total_area_m2: totalAreaMm2 / (MM_PER_M * MM_PER_M),
    perimeter_m: totalPerimeterMm / MM_PER_M,
    board_direction: 0,
    polygon,
  };
}

/* ─── Helper: resolve CSS hsl(var(--x)) to actual colour ─ */

function resolveColor(cssColor: string, canvas: HTMLCanvasElement): string {
  const styles = getComputedStyle(canvas);
  // Try to resolve CSS variable references
  const varMatch = cssColor.match(/var\(--([^)]+)\)/);
  if (varMatch) {
    const varValue = styles.getPropertyValue(`--${varMatch[1]}`).trim();
    if (varValue) {
      return cssColor.replace(`var(--${varMatch[1]})`, varValue);
    }
  }
  return cssColor;
}

/* ─── Canvas rendering ──────────────────────────────────── */

function renderCanvas(
  ctx: CanvasRenderingContext2D,
  design: DeckDesign,
  zoom: number,
  panX: number,
  panY: number,
  selectedId: string | null,
  containerWidth: number,
  containerHeight: number,
  hoveredId: string | null
) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, containerWidth, containerHeight);

  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(zoom, zoom);

  // Scale factor: mm -> px at zoom 1
  // We want 1 mm = some fraction of a pixel. We use a sensible base scale.
  const scale = 1; // 1px = 1mm at zoom=1 (zoom handles the rest)

  // Draw grid
  drawGrid(ctx, containerWidth, containerHeight, zoom, panX, panY, scale, canvas);

  // Draw shapes
  for (const shape of design.shapes) {
    drawShape(ctx, shape, scale, selectedId === shape.id, hoveredId === shape.id, canvas);
  }

  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  panX: number,
  panY: number,
  _scale: number,
  canvas: HTMLCanvasElement
) {
  const gridPx = GRID_SIZE_MM; // at zoom=1, 100mm = 100px
  const color = resolveColor(GRID_LINE_COLOR, canvas);
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5 / zoom;

  // Compute visible area in "model" (mm) coordinates
  const startX = Math.floor(-panX / zoom / gridPx) * gridPx;
  const endX = Math.ceil((-panX + containerWidth) / zoom / gridPx) * gridPx;
  const startY = Math.floor(-panY / zoom / gridPx) * gridPx;
  const endY = Math.ceil((-panY + containerHeight) / zoom / gridPx) * gridPx;

  ctx.beginPath();
  for (let x = startX; x <= endX; x += gridPx) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += gridPx) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: DeckShape,
  _scale: number,
  isSelected: boolean,
  isHovered: boolean,
  canvas: HTMLCanvasElement
) {
  const isInverted = !!shape.inverted;
  const fillColor = isInverted
    ? CUTOUT_FILL
    : isSelected
      ? resolveColor(PRIMARY_FILL_SELECTED, canvas)
      : resolveColor(PRIMARY_FILL, canvas);
  const strokeColor = isInverted ? CUTOUT_STROKE : resolveColor(PRIMARY_STROKE, canvas);

  // Build path
  ctx.beginPath();
  if (shape.type === "circle") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    ctx.ellipse(cx, cy, shape.width / 2, shape.height / 2, 0, 0, Math.PI * 2);
  } else if (shape.type === "rounded-rect") {
    const { x, y, width, height } = shape;
    const r = Math.min(
      shape.cornerRadius ?? Math.min(width, height) * 0.15,
      Math.min(width, height) / 2
    );
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  } else {
    const poly = shapeToPolygon(shape);
    for (let i = 0; i < poly.length; i++) {
      const [px, py] = poly[i];
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSelected || isHovered ? 3 : 2;
  if (isInverted) ctx.setLineDash([12, 6]);
  ctx.stroke();
  if (isInverted) ctx.setLineDash([]);

  // Selection bounding box for non-circle shapes
  if (isSelected && shape.type !== "circle") {
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(shape.x - 4, shape.y - 4, shape.width + 8, shape.height + 8);
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Labels
  drawDimensionLabels(ctx, shape, shapeToPolygon(shape), canvas);
  if (isInverted) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    ctx.save();
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawLabelPill(ctx, "\u2296 Cutout", cx, cy, "#EF4444", resolveColor(LABEL_BG, canvas));
    ctx.restore();
  } else {
    drawAreaLabel(ctx, shape, canvas);
  }
}

function drawDimensionLabels(
  ctx: CanvasRenderingContext2D,
  shape: DeckShape,
  poly: [number, number][],
  canvas: HTMLCanvasElement
) {
  const labelColor = resolveColor(LABEL_COLOR, canvas);
  const labelBg = resolveColor(LABEL_BG, canvas);

  ctx.save();
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // For rect or l-shape, draw main width & height labels
  const widthM = (shape.width / MM_PER_M).toFixed(1);
  const heightM = (shape.height / MM_PER_M).toFixed(1);

  // Bottom edge: width label
  const bottomMidX = shape.x + shape.width / 2;
  const bottomY = shape.y + shape.height + 18;
  drawLabelPill(ctx, `${widthM}m`, bottomMidX, bottomY, labelColor, labelBg);

  // Right edge: height label (rotated)
  const rightX = shape.x + shape.width + 18;
  const rightMidY = shape.y + shape.height / 2;
  ctx.save();
  ctx.translate(rightX, rightMidY);
  ctx.rotate(-Math.PI / 2);
  drawLabelPill(ctx, `${heightM}m`, 0, 0, labelColor, labelBg);
  ctx.restore();

  // For L-shape, also label cutout dimensions
  if (shape.type === "l-shape" && shape.cutout) {
    const cw = (shape.cutout.width / MM_PER_M).toFixed(1);
    const ch = (shape.cutout.height / MM_PER_M).toFixed(1);

    // Place cutout labels near the cutout corner
    const corner = shape.cutout.corner;
    let cx: number, cy: number;

    switch (corner) {
      case "top-right":
        cx = shape.x + shape.width - shape.cutout.width / 2;
        cy = shape.y + shape.cutout.height / 2;
        break;
      case "top-left":
        cx = shape.x + shape.cutout.width / 2;
        cy = shape.y + shape.cutout.height / 2;
        break;
      case "bottom-right":
        cx = shape.x + shape.width - shape.cutout.width / 2;
        cy = shape.y + shape.height - shape.cutout.height / 2;
        break;
      case "bottom-left":
        cx = shape.x + shape.cutout.width / 2;
        cy = shape.y + shape.height - shape.cutout.height / 2;
        break;
      default:
        cx = shape.x + shape.width / 2;
        cy = shape.y + shape.height / 2;
    }

    drawLabelPill(ctx, `${cw}m x ${ch}m`, cx, cy, "#999", labelBg);
  }

  ctx.restore();
}

function drawLabelPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  textColor: string,
  bgColor: string
) {
  const metrics = ctx.measureText(text);
  const pw = metrics.width + 10;
  const ph = 18;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  roundRect(ctx, x - pw / 2, y - ph / 2, pw, ph, 4);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawAreaLabel(
  ctx: CanvasRenderingContext2D,
  shape: DeckShape,
  canvas: HTMLCanvasElement
) {
  const poly = shapeToPolygon(shape);
  const areaM2 = calculateArea(poly) / (MM_PER_M * MM_PER_M);
  const text = `${areaM2.toFixed(1)} m\u00B2`;

  const labelColor = resolveColor(LABEL_COLOR, canvas);
  const labelBg = resolveColor(LABEL_BG, canvas);

  ctx.save();
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  drawLabelPill(ctx, text, cx, cy, labelColor, labelBg);
  ctx.restore();
}

/* ─── Board Overlay ────────────────────────────────────── */

const BOARD_FILL = "hsla(30, 70%, 55%, 0.25)";
const BOARD_STROKE = "hsla(30, 70%, 45%, 0.6)";
const OFFCUT_FILL = "hsla(140, 60%, 45%, 0.25)";
const OFFCUT_STROKE = "hsla(140, 60%, 35%, 0.6)";
const JOIST_STROKE = "hsla(220, 50%, 55%, 0.5)";
const BEARER_STROKE = "hsla(0, 0%, 40%, 0.6)";

function drawBoardOverlay(
  ctx: CanvasRenderingContext2D,
  layout: BoardLayoutResult,
  zoom: number
) {
  // Draw bearers first (bottom layer)
  ctx.save();
  ctx.strokeStyle = BEARER_STROKE;
  ctx.lineWidth = 4 / zoom;
  for (const bearer of layout.bearers) {
    ctx.beginPath();
    ctx.moveTo(bearer.x, bearer.y);
    ctx.lineTo(bearer.x + bearer.length_mm, bearer.y);
    ctx.stroke();
  }
  ctx.restore();

  // Draw joists (middle layer)
  ctx.save();
  ctx.strokeStyle = JOIST_STROKE;
  ctx.lineWidth = 2 / zoom;
  ctx.setLineDash([8 / zoom, 4 / zoom]);
  for (const joist of layout.joists) {
    ctx.beginPath();
    ctx.moveTo(joist.x, joist.y);
    ctx.lineTo(joist.x, joist.y + joist.length_mm);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Draw boards (top layer)
  for (const board of layout.boards) {
    const isOffcut = board.source === "offcut";
    ctx.save();

    if (board.rotation !== 0) {
      ctx.translate(board.x, board.y);
      ctx.rotate((board.rotation * Math.PI) / 180);
      ctx.fillStyle = isOffcut ? OFFCUT_FILL : BOARD_FILL;
      ctx.strokeStyle = isOffcut ? OFFCUT_STROKE : BOARD_STROKE;
      ctx.lineWidth = 1 / zoom;
      ctx.fillRect(0, 0, board.length_mm, board.width_mm);
      ctx.strokeRect(0, 0, board.length_mm, board.width_mm);
    } else {
      ctx.fillStyle = isOffcut ? OFFCUT_FILL : BOARD_FILL;
      ctx.strokeStyle = isOffcut ? OFFCUT_STROKE : BOARD_STROKE;
      ctx.lineWidth = 1 / zoom;
      ctx.fillRect(board.x, board.y, board.length_mm, board.width_mm);
      ctx.strokeRect(board.x, board.y, board.length_mm, board.width_mm);
    }

    ctx.restore();
  }
}

/* ─── Props ─────────────────────────────────────────────── */

interface DeckCanvasProps {
  design: DeckDesign;
  onDesignChange: (design: DeckDesign) => void;
  mode: DesignMode;
  boardLayout?: BoardLayoutResult | null;
}

/* ─── Quick Mode Canvas (simple preview) ─────────────── */

/* ─── Quick mode: plank board visualisation ─────────────── */

function drawQuickShape(
  ctx: CanvasRenderingContext2D,
  shape: DeckShape,
  zoom: number
) {
  const { x, y, width, height } = shape;

  // Build clip path for this shape
  ctx.save();
  ctx.beginPath();
  if (shape.type === "circle") {
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (shape.type === "rounded-rect") {
    const r = Math.min(shape.cornerRadius ?? Math.min(width, height) * 0.15, Math.min(width, height) / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.clip();

  // Warm timber fill
  ctx.fillStyle = "rgba(196, 164, 118, 0.13)";
  ctx.fillRect(x, y, width, height);

  // Vertical plank lines
  ctx.strokeStyle = "rgba(196, 164, 118, 0.28)";
  ctx.lineWidth = 1 / zoom;
  const plankMm = 140;
  for (let lx = x + plankMm; lx < x + width; lx += plankMm) {
    ctx.beginPath();
    ctx.moveTo(lx, y);
    ctx.lineTo(lx, y + height);
    ctx.stroke();
  }
  ctx.restore();

  // Ember border — re-draw the shape outline
  ctx.beginPath();
  if (shape.type === "circle") {
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (shape.type === "rounded-rect") {
    const r = Math.min(shape.cornerRadius ?? Math.min(width, height) * 0.15, Math.min(width, height) / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.strokeStyle = PRIMARY_STROKE;
  ctx.lineWidth = 2 / zoom;
  ctx.stroke();

  // Dimension labels
  drawDimensionLabels(ctx, shape, shapeToPolygon(shape), ctx.canvas);
  drawAreaLabel(ctx, shape, ctx.canvas);
}

function QuickCanvas({
  design,
}: {
  design: DeckDesign;
  onDesignChange: (d: DeckDesign) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Determine deck bounds in mm
    const deckW =
      design.shapes.length > 0
        ? Math.max(...design.shapes.map((s) => s.x + s.width))
        : 4000;
    const deckH =
      design.shapes.length > 0
        ? Math.max(...design.shapes.map((s) => s.y + s.height))
        : 3000;

    // Auto-scale to fit with padding
    const padding = 60;
    const availW = w - padding * 2;
    const availH = h - padding * 2;
    const zoom = Math.min(availW / deckW, availH / deckH);

    const panX = (w - deckW * zoom) / 2;
    const panY = (h - deckH * zoom) / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    drawGrid(ctx, w, h, zoom, panX, panY, 1, canvas);

    for (const shape of design.shapes) {
      drawQuickShape(ctx, shape, zoom);
    }

    ctx.restore();
  }, [design]);

  useEffect(() => {
    const doRender = () => {
      animFrameRef.current = requestAnimationFrame(() => {
        render();
      });
    };
    doRender();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  // Re-render on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => render());
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-[#2A2725] bg-[#0F0E0D] canvas-grid"
      style={{ aspectRatio: "16 / 10" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

/* ─── Designer Mode ─────────────────────────────────────── */

type DesignerTool = "rect" | "lshape" | "circle" | "rounded-rect" | "select" | "pan";

interface HistoryState {
  past: DeckDesign[];
  future: DeckDesign[];
}

function DesignerCanvas({
  design,
  onDesignChange,
  boardLayout,
}: {
  design: DeckDesign;
  onDesignChange: (d: DeckDesign) => void;
  boardLayout?: BoardLayoutResult | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const [tool, setTool] = useState<DesignerTool>("select");
  const [isCutoutMode, setIsCutoutMode] = useState(false);
  const [cutoutMenuOpen, setCutoutMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
  });
  const autoFittedRef = useRef(false);

  // Drawing / dragging state
  const dragRef = useRef<{
    type: "draw" | "move" | "pan" | "resize";
    startX: number;
    startY: number;
    shapeStartX?: number;
    shapeStartY?: number;
    shapeStartW?: number;
    shapeStartH?: number;
    edge?: "left" | "right" | "top" | "bottom";
    shapeId?: string;
    panStartX?: number;
    panStartY?: number;
  } | null>(null);
  const drawPreviewRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // Current container size
  const [containerSize, setContainerSize] = useState({ w: 800, h: 500 });

  const selectedShape = useMemo(
    () => design.shapes.find((s) => s.id === selectedId) ?? null,
    [design.shapes, selectedId]
  );

  // Push to history before mutating design
  const pushHistory = useCallback(
    (currentDesign: DeckDesign) => {
      setHistory((h) => ({
        past: [...h.past.slice(-50), currentDesign],
        future: [],
      }));
    },
    []
  );

  const updateDesign = useCallback(
    (newDesign: DeckDesign) => {
      pushHistory(design);
      onDesignChange(newDesign);
    },
    [design, onDesignChange, pushHistory]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const prev = h.past[h.past.length - 1];
      onDesignChange(prev);
      return {
        past: h.past.slice(0, -1),
        future: [design, ...h.future],
      };
    });
  }, [design, onDesignChange]);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      onDesignChange(next);
      return {
        past: [...h.past, design],
        future: h.future.slice(1),
      };
    });
  }, [design, onDesignChange]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          deleteSelected();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, undo, redo]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const newShapes = design.shapes.filter((s) => s.id !== selectedId);
    updateDesign(buildDesign(newShapes));
    setSelectedId(null);
  }, [selectedId, design, updateDesign]);

  // Convert screen coords to model coords
  const screenToModel = useCallback(
    (clientX: number, clientY: number): { mx: number; my: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { mx: 0, my: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return {
        mx: (sx - pan.x) / zoom,
        my: (sy - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Hit test: find shape at model coords
  const hitTest = useCallback(
    (mx: number, my: number): DeckShape | null => {
      // Reverse iterate for z-order (last drawn = on top)
      for (let i = design.shapes.length - 1; i >= 0; i--) {
        const s = design.shapes[i];
        if (s.type === "circle") {
          const cx = s.x + s.width / 2;
          const cy = s.y + s.height / 2;
          const rx = s.width / 2;
          const ry = s.height / 2;
          if (rx > 0 && ry > 0 && (mx - cx) ** 2 / rx ** 2 + (my - cy) ** 2 / ry ** 2 <= 1) return s;
          continue;
        }
        if (mx >= s.x && mx <= s.x + s.width && my >= s.y && my <= s.y + s.height) {
          // For L-shapes, refine with polygon hit test
          if (s.type === "l-shape" && s.cutout) {
            const poly = lShapeToPolygon(s);
            // Simple ray-cast check
            let inside = false;
            for (let j = 0, k = poly.length - 1; j < poly.length; k = j++) {
              const [xi, yi] = poly[j];
              const [xk, yk] = poly[k];
              if (
                yi > my !== yk > my &&
                mx < ((xk - xi) * (my - yi)) / (yk - yi) + xi
              ) {
                inside = !inside;
              }
            }
            if (inside) return s;
          } else {
            return s;
          }
        }
      }
      return null;
    },
    [design.shapes]
  );

  // Edge hit test: find which edge of a shape the pointer is near (in model coords)
  const edgeHitTest = useCallback(
    (mx: number, my: number): { shape: DeckShape; edge: "left" | "right" | "top" | "bottom" } | null => {
      const hitSize = 8 / zoom; // 8 screen-px in model coords
      for (let i = design.shapes.length - 1; i >= 0; i--) {
        const s = design.shapes[i];
        const { x, y, width, height } = s;
        // Right edge
        if (Math.abs(mx - (x + width)) < hitSize && my >= y - hitSize && my <= y + height + hitSize)
          return { shape: s, edge: "right" };
        // Left edge
        if (Math.abs(mx - x) < hitSize && my >= y - hitSize && my <= y + height + hitSize)
          return { shape: s, edge: "left" };
        // Bottom edge
        if (Math.abs(my - (y + height)) < hitSize && mx >= x - hitSize && mx <= x + width + hitSize)
          return { shape: s, edge: "bottom" };
        // Top edge
        if (Math.abs(my - y) < hitSize && mx >= x - hitSize && mx <= x + width + hitSize)
          return { shape: s, edge: "top" };
      }
      return null;
    },
    [design.shapes, zoom]
  );

  // Mouse handlers
  const handlePointerDown = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { mx, my } = screenToModel(e.clientX, e.clientY);

      // Middle click OR pan tool = pan
      if (e.button === 1 || tool === "pan") {
        dragRef.current = {
          type: "pan",
          startX: e.clientX,
          startY: e.clientY,
          panStartX: pan.x,
          panStartY: pan.y,
        };
        return;
      }

      if (tool === "select") {
        // Check edge resize first, then interior move
        const edgeHit = edgeHitTest(mx, my);
        if (edgeHit) {
          setSelectedId(edgeHit.shape.id);
          dragRef.current = {
            type: "resize",
            startX: mx,
            startY: my,
            shapeStartX: edgeHit.shape.x,
            shapeStartY: edgeHit.shape.y,
            shapeStartW: edgeHit.shape.width,
            shapeStartH: edgeHit.shape.height,
            edge: edgeHit.edge,
            shapeId: edgeHit.shape.id,
          };
        } else {
          const hit = hitTest(mx, my);
          if (hit) {
            setSelectedId(hit.id);
            dragRef.current = {
              type: "move",
              startX: mx,
              startY: my,
              shapeStartX: hit.x,
              shapeStartY: hit.y,
              shapeId: hit.id,
            };
          } else {
            setSelectedId(null);
          }
        }
      } else if (tool === "rect" || tool === "lshape" || tool === "circle" || tool === "rounded-rect") {
        const snappedX = snapToGrid(mx, SNAP_SIZE_MM);
        const snappedY = snapToGrid(my, SNAP_SIZE_MM);
        dragRef.current = {
          type: "draw",
          startX: snappedX,
          startY: snappedY,
        };
        drawPreviewRef.current = { x: snappedX, y: snappedY, w: 0, h: 0 };
      }
    },
    [tool, pan, screenToModel, hitTest, edgeHitTest]
  );

  const handlePointerMove = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const { mx, my } = screenToModel(e.clientX, e.clientY);

      // Update hover state when not dragging
      if (!dragRef.current) {
        const canvas = canvasRef.current;
        if (tool === "pan") {
          setHoveredId(null);
          if (canvas) canvas.style.cursor = "grab";
        } else if (tool === "select") {
          const edgeHit = edgeHitTest(mx, my);
          if (edgeHit) {
            setHoveredId(edgeHit.shape.id);
            if (canvas) canvas.style.cursor = edgeHit.edge === "left" || edgeHit.edge === "right" ? "ew-resize" : "ns-resize";
          } else {
            const hit = hitTest(mx, my);
            setHoveredId(hit?.id ?? null);
            if (canvas) canvas.style.cursor = hit ? "move" : "default";
          }
        } else {
          setHoveredId(null);
          if (canvas) canvas.style.cursor = "crosshair";
        }
        return;
      }

      // Show grabbing cursor while panning
      if (dragRef.current.type === "pan") {
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = "grabbing";
      }

      if (dragRef.current.type === "pan") {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPan({
          x: (dragRef.current.panStartX ?? 0) + dx,
          y: (dragRef.current.panStartY ?? 0) + dy,
        });
        return;
      }

      if (dragRef.current.type === "resize" && dragRef.current.shapeId) {
        const dx = mx - dragRef.current.startX;
        const dy = my - dragRef.current.startY;
        const { shapeStartX = 0, shapeStartY = 0, shapeStartW = 100, shapeStartH = 100, edge, shapeId } = dragRef.current;
        const MIN_DIM = 100;

        const newShapes = design.shapes.map((s) => {
          if (s.id !== shapeId) return s;
          let { x, y, width, height } = s;

          if (edge === "right") {
            width = Math.max(MIN_DIM, snapToGrid(shapeStartW + dx, SNAP_SIZE_MM));
          } else if (edge === "left") {
            const newX = Math.min(snapToGrid(shapeStartX + dx, SNAP_SIZE_MM), shapeStartX + shapeStartW - MIN_DIM);
            width = shapeStartX + shapeStartW - newX;
            x = newX;
          } else if (edge === "bottom") {
            height = Math.max(MIN_DIM, snapToGrid(shapeStartH + dy, SNAP_SIZE_MM));
          } else if (edge === "top") {
            const newY = Math.min(snapToGrid(shapeStartY + dy, SNAP_SIZE_MM), shapeStartY + shapeStartH - MIN_DIM);
            height = shapeStartY + shapeStartH - newY;
            y = newY;
          }

          // Clamp cutout so it doesn't exceed new shape bounds
          let cutout = s.cutout;
          if (cutout) {
            cutout = {
              ...cutout,
              width: Math.min(cutout.width, width - MIN_DIM),
              height: Math.min(cutout.height, height - MIN_DIM),
            };
          }

          return { ...s, x, y, width, height, ...(cutout ? { cutout } : {}) };
        });
        onDesignChange(buildDesign(newShapes));
        return;
      }

      if (dragRef.current.type === "move" && dragRef.current.shapeId) {
        const dx = mx - dragRef.current.startX;
        const dy = my - dragRef.current.startY;
        const newX = snapToGrid(
          (dragRef.current.shapeStartX ?? 0) + dx,
          SNAP_SIZE_MM
        );
        const newY = snapToGrid(
          (dragRef.current.shapeStartY ?? 0) + dy,
          SNAP_SIZE_MM
        );

        const newShapes = design.shapes.map((s) =>
          s.id === dragRef.current!.shapeId ? { ...s, x: newX, y: newY } : s
        );
        // Direct update without history (history pushed on mouseUp)
        onDesignChange(buildDesign(newShapes));
        return;
      }

      if (dragRef.current.type === "draw") {
        const snappedX = snapToGrid(mx, SNAP_SIZE_MM);
        const snappedY = snapToGrid(my, SNAP_SIZE_MM);
        const sx = dragRef.current.startX;
        const sy = dragRef.current.startY;

        if (tool === "circle") {
          const size = snapToGrid(Math.max(Math.abs(snappedX - sx), Math.abs(snappedY - sy)), SNAP_SIZE_MM);
          drawPreviewRef.current = {
            x: snappedX >= sx ? sx : sx - size,
            y: snappedY >= sy ? sy : sy - size,
            w: size,
            h: size,
          };
        } else {
          drawPreviewRef.current = {
            x: Math.min(sx, snappedX),
            y: Math.min(sy, snappedY),
            w: Math.abs(snappedX - sx),
            h: Math.abs(snappedY - sy),
          };
        }
      }
    },
    [tool, screenToModel, hitTest, edgeHitTest, design.shapes, onDesignChange]
  );

  const handlePointerUp = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      if (!dragRef.current) return;

      if (dragRef.current.type === "move" && dragRef.current.shapeId) {
        // Push history for the move
        // The design is already updated, just record the state before the move
        setHistory((h) => ({
          past: [...h.past.slice(-50)],
          future: [],
        }));
      }

      if (dragRef.current.type === "draw" && drawPreviewRef.current) {
        const { x, y, w, h } = drawPreviewRef.current;
        if (w >= SNAP_SIZE_MM && h >= SNAP_SIZE_MM) {
          const shapeType = tool === "lshape" ? "l-shape"
            : tool === "circle" ? "circle"
            : tool === "rounded-rect" ? "rounded-rect"
            : "rect";

          const newShape: DeckShape = {
            id: uniqueId(),
            type: shapeType,
            x,
            y,
            width: w,
            height: h,
            ...(isCutoutMode ? { inverted: true } : {}),
            ...(tool === "lshape" ? {
              cutout: {
                corner: "bottom-right" as const,
                width: Math.round(w / 3),
                height: Math.round(h / 3),
              },
            } : {}),
            ...(tool === "rounded-rect" ? { cornerRadius: Math.round(Math.min(w, h) * 0.15) } : {}),
          };
          const newShapes = [...design.shapes, newShape];
          updateDesign(buildDesign(newShapes));
          setSelectedId(newShape.id);
          setIsCutoutMode(false);
          setTool("select");
        }
      }

      dragRef.current = null;
      drawPreviewRef.current = null;
    },
    [tool, isCutoutMode, design.shapes, updateDesign]
  );

  // Touch handlers for mobile
  const lastTouchRef = useRef<{ x: number; y: number; dist?: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 2) {
        // Two-finger: start pan
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        lastTouchRef.current = { x: midX, y: midY, dist };
        return;
      }
      if (e.touches.length === 1) {
        const t = e.touches[0];
        // Simulate mouse down
        const mouseEvt = {
          clientX: t.clientX,
          clientY: t.clientY,
          button: 0,
          preventDefault: () => {},
        } as unknown as ReactMouseEvent<HTMLCanvasElement>;
        handlePointerDown(mouseEvt);
      }
    },
    [handlePointerDown]
  );

  const handleTouchMove = useCallback(
    (e: ReactTouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.touches.length === 2 && lastTouchRef.current) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

        // Pan
        const dx = midX - lastTouchRef.current.x;
        const dy = midY - lastTouchRef.current.y;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));

        // Pinch zoom
        if (lastTouchRef.current.dist) {
          const scale = dist / lastTouchRef.current.dist;
          setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * scale)));
        }

        lastTouchRef.current = { x: midX, y: midY, dist };
        return;
      }
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const mouseEvt = {
          clientX: t.clientX,
          clientY: t.clientY,
          button: 0,
          preventDefault: () => {},
        } as unknown as ReactMouseEvent<HTMLCanvasElement>;
        handlePointerMove(mouseEvt);
      }
    },
    [handlePointerMove]
  );

  const handleTouchEnd = useCallback(
    (e: ReactTouchEvent<HTMLCanvasElement>) => {
      lastTouchRef.current = null;
      if (e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const mouseEvt = {
          clientX: t.clientX,
          clientY: t.clientY,
          button: 0,
          preventDefault: () => {},
        } as unknown as ReactMouseEvent<HTMLCanvasElement>;
        handlePointerUp(mouseEvt);
      }
    },
    [handlePointerUp]
  );

  // Scroll wheel zoom — multiplicative so each tick is a constant % change
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      // Normalise deltaY to ±1 so fast trackpad flicks don't jump several steps
      const dir = e.deltaY > 0 ? -1 : 1;
      const factor = dir > 0 ? 1.05 : 1 / 1.05;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor)));
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Fit to content
  const fitToContent = useCallback(() => {
    if (design.shapes.length === 0) {
      setZoom(0.5);
      setPan({ x: 40, y: 40 });
      return;
    }

    const minX = Math.min(...design.shapes.map((s) => s.x));
    const minY = Math.min(...design.shapes.map((s) => s.y));
    const maxX = Math.max(...design.shapes.map((s) => s.x + s.width));
    const maxY = Math.max(...design.shapes.map((s) => s.y + s.height));

    const dw = maxX - minX;
    const dh = maxY - minY;

    const padding = 80;
    const availW = containerSize.w - padding * 2;
    const availH = containerSize.h - padding * 2;

    const newZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min(availW / dw, availH / dh))
    );
    setZoom(newZoom);
    setPan({
      x: (containerSize.w - dw * newZoom) / 2 - minX * newZoom,
      y: (containerSize.h - dh * newZoom) / 2 - minY * newZoom,
    });
  }, [design.shapes, containerSize]);

  // Auto-fit once on mount — read container size from the DOM to avoid stale state
  useEffect(() => {
    if (autoFittedRef.current || design.shapes.length === 0) return;
    const raf = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw === 0 || ch === 0) return;
      autoFittedRef.current = true;
      const minX = Math.min(...design.shapes.map((s) => s.x));
      const minY = Math.min(...design.shapes.map((s) => s.y));
      const maxX = Math.max(...design.shapes.map((s) => s.x + s.width));
      const maxY = Math.max(...design.shapes.map((s) => s.y + s.height));
      const dw = maxX - minX;
      const dh = maxY - minY;
      const padding = 80;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min((cw - padding * 2) / dw, (ch - padding * 2) / dh)));
      setZoom(newZoom);
      setPan({ x: (cw - dw * newZoom) / 2 - minX * newZoom, y: (ch - dh * newZoom) / 2 - minY * newZoom });
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add L-shape template
  const addLShapeTemplate = useCallback(() => {
    const newShape: DeckShape = {
      id: uniqueId(),
      type: "l-shape",
      x: 0,
      y: 0,
      width: 5000,
      height: 4000,
      cutout: {
        corner: "bottom-right",
        width: 2000,
        height: 2000,
      },
    };
    const newShapes = [...design.shapes, newShape];
    updateDesign(buildDesign(newShapes));
    setSelectedId(newShape.id);
    setTool("select");
  }, [design.shapes, updateDesign]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    renderCanvas(ctx, design, zoom, pan.x, pan.y, selectedId, w, h, hoveredId);

    // Draw board layout overlay (boards, joists, bearers)
    if (boardLayout) {
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      drawBoardOverlay(ctx, boardLayout, zoom);
      ctx.restore();
    }

    // Draw preview shape when drawing
    if (drawPreviewRef.current && dragRef.current?.type === "draw") {
      const { x, y, w: rw, h: rh } = drawPreviewRef.current;
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      ctx.fillStyle = isCutoutMode ? CUTOUT_FILL : resolveColor(PRIMARY_FILL, canvas);
      ctx.strokeStyle = isCutoutMode ? CUTOUT_STROKE : resolveColor(PRIMARY_STROKE, canvas);
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (tool === "circle") {
        ctx.ellipse(x + rw / 2, y + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      } else if (tool === "rounded-rect") {
        const r = Math.min(Math.min(rw, rh) * 0.15, Math.min(rw, rh) / 2);
        if (rw > 0 && rh > 0) {
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + rw, y, x + rw, y + rh, r);
          ctx.arcTo(x + rw, y + rh, x, y + rh, r);
          ctx.arcTo(x, y + rh, x, y, r);
          ctx.arcTo(x, y, x + rw, y, r);
          ctx.closePath();
        }
      } else {
        ctx.rect(x, y, rw, rh);
      }
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    setContainerSize({ w, h });
  }, [design, zoom, pan, selectedId, hoveredId, boardLayout, tool, isCutoutMode]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(render);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [render]);

  // Update selected shape dimensions from side panel
  const updateShapeDimension = useCallback(
    (field: "width" | "height" | "x" | "y" | "cornerRadius", value: number) => {
      if (!selectedId) return;
      const valueMm = field === "x" || field === "y" ? value : value;
      const newShapes = design.shapes.map((s) =>
        s.id === selectedId ? { ...s, [field]: valueMm } : s
      );
      updateDesign(buildDesign(newShapes));
    },
    [selectedId, design.shapes, updateDesign]
  );

  const updateCutoutDimension = useCallback(
    (field: "width" | "height", value: number) => {
      if (!selectedId) return;
      const newShapes = design.shapes.map((s) =>
        s.id === selectedId && s.cutout
          ? { ...s, cutout: { ...s.cutout, [field]: value } }
          : s
      );
      updateDesign(buildDesign(newShapes));
    },
    [selectedId, design.shapes, updateDesign]
  );

  const updateCutoutCorner = useCallback(
    (corner: "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
      if (!selectedId) return;
      const newShapes = design.shapes.map((s) =>
        s.id === selectedId && s.cutout
          ? { ...s, cutout: { ...s.cutout, corner } }
          : s
      );
      updateDesign(buildDesign(newShapes));
    },
    [selectedId, design.shapes, updateDesign]
  );

  const toggleInverted = useCallback((id: string) => {
    const newShapes = design.shapes.map(s =>
      s.id === id ? { ...s, inverted: !s.inverted } : s
    );
    updateDesign(buildDesign(newShapes));
  }, [design.shapes, updateDesign]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Canvas area */}
      <div className="flex-1 space-y-2">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#2A2725] bg-[#1A1918] p-1">
          <Button
            variant={tool === "select" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => { setTool("select"); setIsCutoutMode(false); }}
            title="Select / Move"
            className={tool !== "select" ? "text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]" : ""}
          >
            <MousePointer2 className="size-4" />
          </Button>
          <Button
            variant={tool === "pan" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => { setTool("pan"); setIsCutoutMode(false); }}
            title="Pan (Hand Tool)"
            className={tool !== "pan" ? "text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]" : ""}
          >
            <Hand className="size-4" />
          </Button>
          <Button
            variant={tool === "rect" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => { setTool("rect"); setIsCutoutMode(false); }}
            title="Draw Rectangle"
            className={tool !== "rect" ? "text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]" : ""}
          >
            <Square className="size-4" />
          </Button>
          <Button
            variant={tool === "circle" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => { setTool("circle"); setIsCutoutMode(false); }}
            title="Draw Circle / Ellipse"
            className={tool !== "circle" ? "text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]" : ""}
          >
            <Circle className="size-4" />
          </Button>
          <Button
            variant={tool === "rounded-rect" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => { setTool("rounded-rect"); setIsCutoutMode(false); }}
            title="Draw Rounded Rectangle"
            className={tool !== "rounded-rect" ? "text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]" : ""}
          >
            <RoundedRectIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={addLShapeTemplate}
            title="Add L-Shape"
            className="text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
          >
            <LShapeIcon />
          </Button>

          {/* Cutout / Hole tool */}
          <div className="relative">
            <Button
              variant={isCutoutMode ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setCutoutMenuOpen((o) => !o)}
              title="Add Cutout / Hole"
              className={isCutoutMode
                ? "bg-red-600 text-white hover:bg-red-500"
                : "text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
              }
            >
              <Scissors className="size-4" />
            </Button>
            {cutoutMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCutoutMenuOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[130px] rounded-lg border border-[#2A2725] bg-[#1A1918] p-1 shadow-xl">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#736B62]">
                    Add Cutout
                  </p>
                  {([
                    { ct: "rect" as const, label: "Rectangle", icon: <Square className="size-3.5" /> },
                    { ct: "circle" as const, label: "Circle", icon: <Circle className="size-3.5" /> },
                    { ct: "rounded-rect" as const, label: "Rounded", icon: <RoundedRectIcon /> },
                  ]).map(({ ct, label, icon }) => (
                    <button
                      key={ct}
                      onClick={() => {
                        setTool(ct);
                        setIsCutoutMode(true);
                        setCutoutMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[#A8A099] hover:bg-[#2A2725] hover:text-[#F5F1EC]"
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mx-1 h-5 w-px bg-[#2A2725]" />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.25))}
            title="Zoom In"
            className="text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.25))}
            title="Zoom Out"
            className="text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fitToContent}
            title="Fit to Content"
            className="text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
          >
            <Maximize className="size-4" />
          </Button>
          <span className="ml-1 text-xs text-[#736B62] tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <div className="mx-1 h-5 w-px bg-[#2A2725]" />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={undo}
            disabled={history.past.length === 0}
            title="Undo (Ctrl+Z)"
            className="text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redo}
            disabled={history.future.length === 0}
            title="Redo (Ctrl+Shift+Z)"
            className="text-[#A8A099] hover:text-[#F5F1EC] hover:bg-[#2A2725]"
          >
            <Redo2 className="size-4" />
          </Button>

          {selectedId && (
            <>
              <div className="mx-1 h-5 w-px bg-[#2A2725]" />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={deleteSelected}
                title="Delete Selected"
                className="text-red-500 hover:text-red-400 hover:bg-[#2A2725]"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg border border-[#2A2725] bg-[#0F0E0D] canvas-grid"
          style={{ aspectRatio: "16 / 10", minHeight: "300px" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={() => {
              if (dragRef.current?.type === "draw") {
                dragRef.current = null;
                drawPreviewRef.current = null;
              }
              // Keep pan drag active when mouse leaves canvas
              if (dragRef.current?.type !== "pan") {
                setHoveredId(null);
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
          />
          {design.shapes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[#736B62]">
              Click &amp; drag to draw a shape. Use the scissors button to add a cutout/hole.
            </div>
          )}
        </div>

        {/* Total area readout */}
        <div className="rounded-lg border border-[#2A2725] bg-[#1A1918] p-3">
          {(() => {
            const cutoutCount = design.shapes.filter(s => s.inverted).length;
            const positiveCount = design.shapes.filter(s => !s.inverted).length;
            const shapeLabel = positiveCount === 1 ? "shape" : "shapes";
            const totalLabel = cutoutCount > 0
              ? `${positiveCount} ${shapeLabel}, ${cutoutCount} cutout${cutoutCount > 1 ? "s" : ""}`
              : `${design.shapes.length} ${shapeLabel}`;
            return (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#736B62]">
                  Total area ({totalLabel})
                </span>
                <span className="text-xl font-bold tabular-nums text-[#F5F1EC]">
                  {design.total_area_m2.toFixed(1)} m²
                </span>
              </div>
            );
          })()}
          {(design.total_area_m2 < 1 || design.total_area_m2 > 200) &&
            design.shapes.length > 0 && (
              <p className="mt-1 text-sm text-destructive">
                Deck area must be between 1 and 200 m²
              </p>
            )}
        </div>
      </div>

      {/* Side panel — selected shape properties */}
      <div className="w-full shrink-0 space-y-4 lg:w-64">
        <div className="rounded-lg border border-[#2A2725] bg-[#1A1918] p-4">
          <h3 className="mb-3 font-display text-[11px] font-bold uppercase tracking-widest text-[#736B62]">
            {selectedShape ? "Shape Properties" : "Instructions"}
          </h3>

          {!selectedShape ? (
            <div className="space-y-2 text-sm text-[#A8A099]">
              <p>
                <strong>Draw:</strong> Select Rectangle, Circle, Rounded Rect, or L-Shape tool, then click
                and drag on the canvas.
              </p>
              <p>
                <strong>Move:</strong> Use the Select tool, then drag a shape.
              </p>
              <p>
                <strong>Edit:</strong> Select a shape to edit its dimensions here.
              </p>
              <p>
                <strong>Zoom:</strong> Scroll wheel or use the +/- buttons.
              </p>
              <p>
                <strong>Pan:</strong> Use the hand tool, middle-click drag, or
                two-finger drag on mobile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const typeLabel = selectedShape.type === "l-shape" ? "L-Shape"
                  : selectedShape.type === "circle" ? "Circle"
                  : selectedShape.type === "rounded-rect" ? "Rounded Rect"
                  : "Rectangle";
                return (
                  <div className="rounded bg-[#2A2725] px-2 py-1 text-xs text-[#A8A099]">{typeLabel}</div>
                );
              })()}

              <button
                onClick={() => toggleInverted(selectedShape.id)}
                className={cn(
                  "w-full rounded border px-3 py-1.5 text-xs transition-colors",
                  selectedShape.inverted
                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                    : "border-[#2A2725] text-[#736B62] hover:border-[#D4622A]/50 hover:text-[#A8A099]"
                )}
              >
                {selectedShape.inverted ? "⊖ Cutout (click to restore)" : "Make Cutout / Hole"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-[#A8A099]">Width (mm)</Label>
                  <Input
                    type="number"
                    min={100}
                    step={50}
                    value={selectedShape.width}
                    onChange={(e) =>
                      updateShapeDimension(
                        "width",
                        Math.max(100, Number(e.target.value))
                      )
                    }
                    className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#A8A099]">Height (mm)</Label>
                  <Input
                    type="number"
                    min={100}
                    step={50}
                    value={selectedShape.height}
                    onChange={(e) =>
                      updateShapeDimension(
                        "height",
                        Math.max(100, Number(e.target.value))
                      )
                    }
                    className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-[#A8A099]">X (mm)</Label>
                  <Input
                    type="number"
                    step={50}
                    value={selectedShape.x}
                    onChange={(e) =>
                      updateShapeDimension("x", Number(e.target.value))
                    }
                    className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#A8A099]">Y (mm)</Label>
                  <Input
                    type="number"
                    step={50}
                    value={selectedShape.y}
                    onChange={(e) =>
                      updateShapeDimension("y", Number(e.target.value))
                    }
                    className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                  />
                </div>
              </div>

              {/* Corner radius for rounded-rect */}
              {selectedShape.type === "rounded-rect" && (
                <div className="space-y-1">
                  <Label className="text-xs text-[#A8A099]">Corner Radius (mm)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    value={selectedShape.cornerRadius ?? Math.round(Math.min(selectedShape.width, selectedShape.height) * 0.15)}
                    onChange={(e) => updateShapeDimension("cornerRadius", Math.max(0, Number(e.target.value)))}
                    className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                  />
                </div>
              )}

              {/* Dimensions in metres */}
              <div className="rounded bg-[#2A2725] px-2 py-1.5 text-xs text-[#A8A099]">
                {selectedShape.inverted ? (
                  <span className="text-red-400">⊖ Cutout — subtracted from total</span>
                ) : (
                  <>
                    {(selectedShape.width / MM_PER_M).toFixed(2)}m ×{" "}
                    {(selectedShape.height / MM_PER_M).toFixed(2)}m ={" "}
                    {(
                      calculateArea(shapeToPolygon(selectedShape)) /
                      (MM_PER_M * MM_PER_M)
                    ).toFixed(1)}{" "}
                    m²
                  </>
                )}
              </div>

              {/* L-shape cutout controls */}
              {selectedShape.type === "l-shape" && selectedShape.cutout && (
                <div className="space-y-2 border-t border-[#2A2725] pt-3">
                  <h4 className="text-xs font-semibold text-[#736B62]">
                    Cutout
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-[#A8A099]">Width (mm)</Label>
                      <Input
                        type="number"
                        min={100}
                        step={50}
                        value={selectedShape.cutout.width}
                        onChange={(e) =>
                          updateCutoutDimension(
                            "width",
                            Math.max(100, Number(e.target.value))
                          )
                        }
                        className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[#A8A099]">Height (mm)</Label>
                      <Input
                        type="number"
                        min={100}
                        step={50}
                        value={selectedShape.cutout.height}
                        onChange={(e) =>
                          updateCutoutDimension(
                            "height",
                            Math.max(100, Number(e.target.value))
                          )
                        }
                        className="h-8 border-[#2A2725] bg-[#0F0E0D] font-mono text-[#F5F1EC] focus-visible:ring-[#D4622A]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#A8A099]">Corner</Label>
                    <div className="grid grid-cols-2 gap-1">
                      {(
                        [
                          "top-left",
                          "top-right",
                          "bottom-left",
                          "bottom-right",
                        ] as const
                      ).map((corner) => (
                        <button
                          key={corner}
                          onClick={() => updateCutoutCorner(corner)}
                          className={cn(
                            "rounded border px-2 py-1 text-xs transition-colors",
                            selectedShape.cutout?.corner === corner
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-[#2A2725] text-[#736B62] hover:border-[#D4622A]/50"
                          )}
                        >
                          {corner.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Consultation Mode ─────────────────────────────────── */

function ConsultationView() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-[#2A2725] bg-[#0F0E0D] py-16 text-center">
      <MessageSquare className="size-12 text-[#D4622A]" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#F5F1EC]">Need a custom shape?</h3>
        <p className="mx-auto max-w-md text-sm text-[#A8A099]">
          For complex deck shapes (curves, multi-level, wraparound), request a
          free consultation. Our team will design your deck and provide a
          detailed quote.
        </p>
      </div>
      <Button asChild>
        <Link href="/contact">Request Consultation</Link>
      </Button>
    </div>
  );
}

/* ─── Main DeckCanvas Component ─────────────────────────── */

export function DeckCanvas({ design, onDesignChange, mode, boardLayout }: DeckCanvasProps) {
  if (mode === "consultation") {
    return <ConsultationView />;
  }

  if (mode === "designer") {
    return <DesignerCanvas design={design} onDesignChange={onDesignChange} boardLayout={boardLayout} />;
  }

  // Quick mode
  return <QuickCanvas design={design} onDesignChange={onDesignChange} />;
}

/* ─── Exported helper for creating design from length/width */

export function createDesignFromDimensions(
  lengthM: number,
  widthM: number
): DeckDesign {
  const shape: DeckShape = {
    id: "quick-rect",
    type: "rect",
    x: 0,
    y: 0,
    width: lengthM * MM_PER_M,
    height: widthM * MM_PER_M,
  };
  return buildDesign([shape]);
}
