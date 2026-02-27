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
import {
  Square,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

/* ─── Constants ─────────────────────────────────────────── */

const GRID_SIZE_MM = 100; // 100mm grid lines
const SNAP_SIZE_MM = 50; // snap to 50mm
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const MM_PER_M = 1000;

// Colours — CSS vars evaluated at render time
const PRIMARY_FILL = "hsla(var(--primary) / 0.15)";
const PRIMARY_STROKE = "hsl(var(--primary))";
const PRIMARY_FILL_SELECTED = "hsla(var(--primary) / 0.3)";
const GRID_LINE_COLOR = "rgba(0,0,0,0.06)";
const LABEL_COLOR = "hsl(var(--foreground))";
const LABEL_BG = "hsla(var(--background) / 0.85)";

/* ─── Helper: generate a short unique id ────────────────── */

let _idCounter = 0;
function uniqueId(): string {
  _idCounter += 1;
  return `shape-${Date.now()}-${_idCounter}`;
}

/* ─── Helper: build DeckDesign from shapes ──────────────── */

function buildDesign(shapes: DeckShape[]): DeckDesign {
  let totalAreaMm2 = 0;
  let totalPerimeterMm = 0;
  const allPolygonPoints: [number, number][] = [];

  for (const shape of shapes) {
    const poly = shapeToPolygon(shape);
    totalAreaMm2 += calculateArea(poly);
    totalPerimeterMm += calculatePerimeter(poly);
    allPolygonPoints.push(...poly);
  }

  // Use first shape polygon for merged outline (simple case)
  const polygon: [number, number][] =
    shapes.length === 1 ? shapeToPolygon(shapes[0]) : allPolygonPoints;

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
  const poly = shapeToPolygon(shape);

  // Fill
  const fillColor = isSelected
    ? resolveColor(PRIMARY_FILL_SELECTED, canvas)
    : resolveColor(PRIMARY_FILL, canvas);
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  for (let i = 0; i < poly.length; i++) {
    const [px, py] = poly[i];
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Stroke
  const strokeColor = resolveColor(PRIMARY_STROKE, canvas);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSelected || isHovered ? 3 : 2;
  ctx.stroke();

  // Dashed selection box
  if (isSelected) {
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(shape.x - 4, shape.y - 4, shape.width + 8, shape.height + 8);
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Dimension labels on edges
  drawDimensionLabels(ctx, shape, poly, canvas);

  // Area label centered
  drawAreaLabel(ctx, shape, canvas);
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

    renderCanvas(ctx, design, zoom, panX, panY, null, w, h, null);
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
      className="relative w-full overflow-hidden rounded-lg border bg-background"
      style={{ aspectRatio: "16 / 10" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

/* ─── Designer Mode ─────────────────────────────────────── */

type DesignerTool = "rect" | "lshape" | "select";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
  });

  // Drawing / dragging state
  const dragRef = useRef<{
    type: "draw" | "move" | "pan";
    startX: number;
    startY: number;
    shapeStartX?: number;
    shapeStartY?: number;
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

  // Mouse handlers
  const handlePointerDown = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { mx, my } = screenToModel(e.clientX, e.clientY);

      // Middle click = pan
      if (e.button === 1) {
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
      } else if (tool === "rect" || tool === "lshape") {
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
    [tool, pan, screenToModel, hitTest]
  );

  const handlePointerMove = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const { mx, my } = screenToModel(e.clientX, e.clientY);

      // Update hover state when not dragging
      if (!dragRef.current) {
        const hit = hitTest(mx, my);
        setHoveredId(hit?.id ?? null);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.cursor =
            tool === "select" ? (hit ? "move" : "default") : "crosshair";
        }
        return;
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

        drawPreviewRef.current = {
          x: Math.min(sx, snappedX),
          y: Math.min(sy, snappedY),
          w: Math.abs(snappedX - sx),
          h: Math.abs(snappedY - sy),
        };
      }
    },
    [tool, screenToModel, hitTest, design.shapes, onDesignChange]
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
          const newShape: DeckShape = {
            id: uniqueId(),
            type: tool === "lshape" ? "l-shape" : "rect",
            x,
            y,
            width: w,
            height: h,
            ...(tool === "lshape"
              ? {
                  cutout: {
                    corner: "bottom-right" as const,
                    width: Math.round(w / 3),
                    height: Math.round(h / 3),
                  },
                }
              : {}),
          };
          const newShapes = [...design.shapes, newShape];
          updateDesign(buildDesign(newShapes));
          setSelectedId(newShape.id);
          setTool("select");
        }
      }

      dragRef.current = null;
      drawPreviewRef.current = null;
    },
    [tool, design.shapes, updateDesign]
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

  // Scroll wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
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

    // Draw preview rect when drawing
    if (drawPreviewRef.current && dragRef.current?.type === "draw") {
      const { x, y, w: rw, h: rh } = drawPreviewRef.current;
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      ctx.fillStyle = resolveColor(PRIMARY_FILL, canvas);
      ctx.strokeStyle = resolveColor(PRIMARY_STROKE, canvas);
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, rw, rh);
      ctx.strokeRect(x, y, rw, rh);
      ctx.setLineDash([]);
      ctx.restore();
    }

    setContainerSize({ w, h });
  }, [design, zoom, pan, selectedId, hoveredId, boardLayout]);

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
    (field: "width" | "height" | "x" | "y", value: number) => {
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

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Canvas area */}
      <div className="flex-1 space-y-2">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-1">
          <Button
            variant={tool === "select" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setTool("select")}
            title="Select / Move"
          >
            <MousePointer2 className="size-4" />
          </Button>
          <Button
            variant={tool === "rect" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setTool("rect")}
            title="Draw Rectangle"
          >
            <Square className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addLShapeTemplate}
            title="Add L-Shape Template"
            className="text-xs"
          >
            L-Shape
          </Button>

          <div className="mx-1 h-5 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
            }
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
            }
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fitToContent}
            title="Fit to Content"
          >
            <Maximize className="size-4" />
          </Button>
          <span className="ml-1 text-xs text-muted-foreground tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <div className="mx-1 h-5 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={undo}
            disabled={history.past.length === 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redo}
            disabled={history.future.length === 0}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="size-4" />
          </Button>

          {selectedId && (
            <>
              <div className="mx-1 h-5 w-px bg-border" />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={deleteSelected}
                title="Delete Selected"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg border bg-background"
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
              setHoveredId(null);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
          />
          {design.shapes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Click &amp; drag to draw a rectangle, or use the L-Shape button
            </div>
          )}
        </div>

        {/* Total area readout */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              Total area ({design.shapes.length}{" "}
              {design.shapes.length === 1 ? "shape" : "shapes"})
            </span>
            <span className="text-xl font-bold tabular-nums">
              {design.total_area_m2.toFixed(1)} m²
            </span>
          </div>
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
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {selectedShape ? "Shape Properties" : "Instructions"}
          </h3>

          {!selectedShape ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Draw:</strong> Select Rectangle or L-Shape tool, then click
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
                <strong>Pan:</strong> Middle-click drag or two-finger drag on
                mobile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                {selectedShape.type === "l-shape" ? "L-Shape" : "Rectangle"}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width (mm)</Label>
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
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height (mm)</Label>
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
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">X (mm)</Label>
                  <Input
                    type="number"
                    step={50}
                    value={selectedShape.x}
                    onChange={(e) =>
                      updateShapeDimension("x", Number(e.target.value))
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Y (mm)</Label>
                  <Input
                    type="number"
                    step={50}
                    value={selectedShape.y}
                    onChange={(e) =>
                      updateShapeDimension("y", Number(e.target.value))
                    }
                    className="h-8"
                  />
                </div>
              </div>

              {/* Dimensions in metres */}
              <div className="rounded bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
                {(selectedShape.width / MM_PER_M).toFixed(2)}m ×{" "}
                {(selectedShape.height / MM_PER_M).toFixed(2)}m ={" "}
                {(
                  calculateArea(shapeToPolygon(selectedShape)) /
                  (MM_PER_M * MM_PER_M)
                ).toFixed(1)}{" "}
                m²
              </div>

              {/* L-shape cutout controls */}
              {selectedShape.type === "l-shape" && selectedShape.cutout && (
                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground">
                    Cutout
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Width (mm)</Label>
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
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Height (mm)</Label>
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
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Corner</Label>
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
                              : "border-border text-muted-foreground hover:border-primary/50"
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
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-muted/30 py-16 text-center">
      <MessageSquare className="size-12 text-muted-foreground" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Need a custom shape?</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
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
