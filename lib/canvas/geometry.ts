import type { DeckShape } from "@/types/deck";

/** Round value to nearest grid increment */
export function snapToGrid(value: number, gridSize: number = 50): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Convert a rect DeckShape to polygon points (4 corners, clockwise) */
export function rectToPolygon(shape: DeckShape): [number, number][] {
  const { x, y, width, height } = shape;
  return [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
}

/** Convert an L-shape DeckShape to polygon points (6 corners) */
export function lShapeToPolygon(shape: DeckShape): [number, number][] {
  const { x, y, width, height, cutout } = shape;

  if (!cutout) {
    // Fallback to rect if no cutout defined
    return rectToPolygon(shape);
  }

  const cw = cutout.width;
  const ch = cutout.height;

  switch (cutout.corner) {
    case "bottom-right":
      // Cutout removes the bottom-right corner
      return [
        [x, y],
        [x + width, y],
        [x + width, y + height - ch],
        [x + width - cw, y + height - ch],
        [x + width - cw, y + height],
        [x, y + height],
      ];

    case "bottom-left":
      // Cutout removes the bottom-left corner
      return [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x + cw, y + height],
        [x + cw, y + height - ch],
        [x, y + height - ch],
      ];

    case "top-right":
      // Cutout removes the top-right corner
      return [
        [x, y],
        [x + width - cw, y],
        [x + width - cw, y + ch],
        [x + width, y + ch],
        [x + width, y + height],
        [x, y + height],
      ];

    case "top-left":
      // Cutout removes the top-left corner
      return [
        [x + cw, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
        [x, y + ch],
        [x + cw, y + ch],
      ];

    default:
      return rectToPolygon(shape);
  }
}

export function circleToPolygon(shape: DeckShape, segments = 48): [number, number][] {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  const rx = shape.width / 2;
  const ry = shape.height / 2;
  const points: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
  }
  return points;
}

export function roundedRectToPolygon(shape: DeckShape, arcSegments = 8): [number, number][] {
  const { x, y, width, height } = shape;
  const r = Math.min(
    shape.cornerRadius ?? Math.min(width, height) * 0.15,
    Math.min(width, height) / 2
  );
  if (r <= 0) return rectToPolygon(shape);
  const points: [number, number][] = [];
  const corners = [
    { cx: x + r,         cy: y + r,          startAngle: Math.PI,       endAngle: 1.5 * Math.PI },
    { cx: x + width - r, cy: y + r,          startAngle: 1.5 * Math.PI, endAngle: 2 * Math.PI   },
    { cx: x + width - r, cy: y + height - r, startAngle: 0,             endAngle: 0.5 * Math.PI },
    { cx: x + r,         cy: y + height - r, startAngle: 0.5 * Math.PI, endAngle: Math.PI       },
  ];
  for (const { cx, cy, startAngle, endAngle } of corners) {
    for (let i = 0; i <= arcSegments; i++) {
      const angle = startAngle + (i / arcSegments) * (endAngle - startAngle);
      points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
  }
  return points;
}

/** Get polygon from any shape type */
export function shapeToPolygon(shape: DeckShape): [number, number][] {
  switch (shape.type) {
    case "rect": return rectToPolygon(shape);
    case "l-shape": return lShapeToPolygon(shape);
    case "circle": return circleToPolygon(shape);
    case "rounded-rect": return roundedRectToPolygon(shape);
    default: return rectToPolygon(shape);
  }
}

/** Calculate area of polygon using Shoelace formula (returns mm²) */
export function calculateArea(polygon: [number, number][]): number {
  const n = polygon.length;
  if (n < 3) return 0;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % n];
    sum += x1 * y2 - x2 * y1;
  }

  return Math.abs(sum) / 2;
}

/** Calculate perimeter of polygon (returns mm) */
export function calculatePerimeter(polygon: [number, number][]): number {
  const n = polygon.length;
  if (n < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % n];
    perimeter += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  return perimeter;
}

/**
 * Find horizontal segments where scanline at y intersects polygon.
 * Returns pairs of [x_start, x_end] sorted left-to-right.
 */
export function intersectScanline(
  y: number,
  polygon: [number, number][]
): [number, number][] {
  const n = polygon.length;
  if (n < 3) return [];

  const intersections: number[] = [];

  for (let i = 0; i < n; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % n];

    // Skip horizontal edges
    if (y1 === y2) continue;

    // Check if scanline Y is between the two endpoints (exclusive of top)
    const yMin = Math.min(y1, y2);
    const yMax = Math.max(y1, y2);

    if (y >= yMin && y < yMax) {
      // Linear interpolation to find X at this Y
      const t = (y - y1) / (y2 - y1);
      const xIntersect = x1 + t * (x2 - x1);
      intersections.push(xIntersect);
    }
  }

  // Sort intersections left-to-right
  intersections.sort((a, b) => a - b);

  // Pair them up
  const segments: [number, number][] = [];
  for (let i = 0; i + 1 < intersections.length; i += 2) {
    segments.push([intersections[i], intersections[i + 1]]);
  }

  return segments;
}

/** Check if point is inside polygon (ray casting) */
export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const [px, py] = point;
  const n = polygon.length;
  let inside = false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/** Rotate polygon around origin by degrees */
export function rotatePolygon(
  polygon: [number, number][],
  degrees: number
): [number, number][] {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return polygon.map(([x, y]) => [
    x * cos - y * sin,
    x * sin + y * cos,
  ]);
}

/** Get bounding box of polygon: { minX, minY, maxX, maxY } */
export function getBounds(
  polygon: [number, number][]
): { minX: number; minY: number; maxX: number; maxY: number } {
  if (polygon.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of polygon) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
}
