import type {
  BoardPiece,
  JoistPiece,
  BearerPiece,
  BillOfMaterials,
  BoardLayoutResult,
  StockSummary,
} from "@/types/deck";
import { intersectScanline, rotatePolygon, getBounds } from "./geometry";

export interface BoardLayoutInput {
  polygon: [number, number][];
  boardWidth_mm: number;
  boardThickness_mm: number;
  availableLengths_mm: number[];
  boardDirection_deg: number;
  boardGap_mm: number;
  joistSpacing_mm: number;
  bearerSpacing_mm: number;
  joistDimension: {
    width_mm: number;
    thickness_mm: number;
    availableLengths_mm: number[];
  };
  bearerDimension: {
    width_mm: number;
    thickness_mm: number;
    availableLengths_mm: number[];
  };
  invertedPolygons?: [number, number][][];
}

/**
 * Pick the shortest available stock length that fits the required cut.
 * If none fits, return the longest available stock (the board will need joining).
 */
function pickStock(required_mm: number, availableLengths_mm: number[]): number {
  const sorted = [...availableLengths_mm].sort((a, b) => a - b);
  for (const stock of sorted) {
    if (stock >= required_mm) {
      return stock;
    }
  }
  // No single stock is long enough -- return the longest available
  return sorted[sorted.length - 1] ?? required_mm;
}

/**
 * Aggregate pieces into stock summaries by their stock_length_mm.
 */
function aggregateStock(
  pieces: Array<{ stock_length_mm: number }>
): StockSummary[] {
  const map = new Map<number, number>();
  for (const p of pieces) {
    map.set(p.stock_length_mm, (map.get(p.stock_length_mm) ?? 0) + 1);
  }
  const summaries: StockSummary[] = [];
  for (const [stock_length_mm, quantity] of map) {
    summaries.push({ stock_length_mm, quantity });
  }
  return summaries.sort((a, b) => a.stock_length_mm - b.stock_length_mm);
}

/**
 * Rotate a single point back by the given degrees around the origin.
 */
function rotatePoint(
  x: number,
  y: number,
  degrees: number
): [number, number] {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [x * cos - y * sin, x * sin + y * cos];
}

function subtractIntervals(
  positives: [number, number][],
  inverses: [number, number][]
): [number, number][] {
  if (inverses.length === 0) return positives;
  let result: [number, number][] = [...positives];
  for (const [ix1, ix2] of inverses) {
    result = result.flatMap(([px1, px2]): [number, number][] => {
      if (ix2 <= px1 || ix1 >= px2) return [[px1, px2]];
      const parts: [number, number][] = [];
      if (px1 < ix1) parts.push([px1, ix1]);
      if (px2 > ix2) parts.push([ix2, px2]);
      return parts;
    });
  }
  return result;
}

export function calculateBoardLayout(input: BoardLayoutInput): BoardLayoutResult {
  const {
    polygon: originalPolygon,
    boardWidth_mm,
    boardThickness_mm,
    availableLengths_mm,
    boardDirection_deg,
    boardGap_mm,
    joistSpacing_mm,
    bearerSpacing_mm,
    joistDimension,
    bearerDimension,
  } = input;

  // Step 1: Rotate polygon so boards always lay out horizontally
  const needsRotation = boardDirection_deg !== 0;
  const workPolygon = needsRotation
    ? rotatePolygon(originalPolygon, -boardDirection_deg)
    : originalPolygon;

  const invertedWorkPolygons: [number, number][][] = (input.invertedPolygons ?? []).map(poly =>
    needsRotation ? rotatePolygon(poly, -boardDirection_deg) : poly
  );

  const bounds = getBounds(workPolygon);
  const { minX, minY, maxX, maxY } = bounds;

  // Step 2: Lay out boards
  const laneSpacing = boardWidth_mm + boardGap_mm;
  const boards: BoardPiece[] = [];
  let boardIndex = 0;

  for (
    let laneY = minY + boardWidth_mm / 2;
    laneY <= maxY - boardWidth_mm / 2;
    laneY += laneSpacing
  ) {
    let segments = intersectScanline(laneY, workPolygon);
    if (invertedWorkPolygons.length > 0) {
      for (const invPoly of invertedWorkPolygons) {
        const invSegs = intersectScanline(laneY, invPoly);
        segments = subtractIntervals(segments, invSegs);
      }
    }

    for (const [x1, x2] of segments) {
      const cutLength = x2 - x1;
      if (cutLength <= 0) continue;

      const maxStock = Math.max(...availableLengths_mm);
      let remaining = cutLength;
      let offsetX = x1;

      // If the run is longer than any available board, split into joined pieces
      while (remaining > 0) {
        const pieceLength = Math.min(remaining, maxStock);
        const stockLength = pickStock(pieceLength, availableLengths_mm);

        let bx = offsetX;
        let by = laneY - boardWidth_mm / 2;

        if (needsRotation) {
          [bx, by] = rotatePoint(bx, by, boardDirection_deg);
        }

        boards.push({
          id: `board-${boardIndex}`,
          x: bx,
          y: by,
          length_mm: pieceLength,
          width_mm: boardWidth_mm,
          thickness_mm: boardThickness_mm,
          stock_length_mm: stockLength,
          cut_length_mm: pieceLength,
          rotation: boardDirection_deg,
          source: "new",
        });

        boardIndex++;
        remaining -= pieceLength;
        offsetX += pieceLength;
      }
    }
  }

  // Step 3: Joists -- perpendicular to boards
  // Effective joist spacing: minimum of (boardThickness * 20) and configured joistSpacing
  const effectiveJoistSpacing = Math.min(
    boardThickness_mm * 20,
    joistSpacing_mm
  );
  const joists: JoistPiece[] = [];
  let joistIndex = 0;

  for (let jx = minX; jx <= maxX; jx += effectiveJoistSpacing) {
    // Scan vertically, subtracting inverted polygons, to find valid Y ranges.
    const step = boardWidth_mm;
    const validYs: number[] = [];

    for (let sy = minY; sy <= maxY; sy += step) {
      let segs = intersectScanline(sy, workPolygon);
      if (invertedWorkPolygons.length > 0) {
        for (const invPoly of invertedWorkPolygons) {
          segs = subtractIntervals(segs, intersectScanline(sy, invPoly));
        }
      }
      for (const [sx1, sx2] of segs) {
        if (jx >= sx1 && jx <= sx2) {
          validYs.push(sy);
          break;
        }
      }
    }

    if (validYs.length === 0) continue;

    // Group consecutive valid Y positions into contiguous segments.
    // A gap > 1.5× step means a cutout lies between them → separate joists.
    const ySegments: [number, number][] = [];
    let segStart = validYs[0];
    let segEnd = validYs[0];
    for (let i = 1; i < validYs.length; i++) {
      if (validYs[i] - validYs[i - 1] > step * 1.5) {
        ySegments.push([segStart, segEnd]);
        segStart = validYs[i];
      }
      segEnd = validYs[i];
    }
    ySegments.push([segStart, segEnd]);

    for (const [segMinY, segMaxY] of ySegments) {
      const joistLength = segMaxY - segMinY;
      if (joistLength <= 0) continue;

      const joistStock = pickStock(joistLength, joistDimension.availableLengths_mm);

      let jxPos = jx;
      let jyPos = segMinY;

      if (needsRotation) {
        [jxPos, jyPos] = rotatePoint(jxPos, jyPos, boardDirection_deg);
      }

      joists.push({
        id: `joist-${joistIndex}`,
        x: jxPos,
        y: jyPos,
        length_mm: joistLength,
        width_mm: joistDimension.width_mm,
        thickness_mm: joistDimension.thickness_mm,
        stock_length_mm: joistStock,
      });

      joistIndex++;
    }
  }

  // Step 4: Bearers -- perpendicular to joists at bearerSpacing centres
  // Always include minY and maxY so the deck edges are supported
  const bearers: BearerPiece[] = [];
  let bearerIndex = 0;

  const bearerYPositions: number[] = [];
  for (let by = minY; by <= maxY; by += bearerSpacing_mm) {
    bearerYPositions.push(by);
  }
  if (bearerYPositions.length === 0 || (bearerYPositions.at(-1) ?? -Infinity) < maxY) {
    bearerYPositions.push(maxY);
  }

  for (const by of bearerYPositions) {
    // Bearer runs along X axis; find extent from polygon bounds
    const segs = intersectScanline(by, workPolygon);

    // Bearer spans the full X range covered by all segments at this Y
    let bearerMinX = Infinity;
    let bearerMaxX = -Infinity;

    for (const [sx1, sx2] of segs) {
      if (sx1 < bearerMinX) bearerMinX = sx1;
      if (sx2 > bearerMaxX) bearerMaxX = sx2;
    }

    if (bearerMinX > bearerMaxX) continue;

    const bearerLength = bearerMaxX - bearerMinX;
    if (bearerLength <= 0) continue;

    const bearerStock = pickStock(
      bearerLength,
      bearerDimension.availableLengths_mm
    );

    let bxPos = bearerMinX;
    let byPos = by;

    if (needsRotation) {
      [bxPos, byPos] = rotatePoint(bxPos, byPos, boardDirection_deg);
    }

    bearers.push({
      id: `bearer-${bearerIndex}`,
      x: bxPos,
      y: byPos,
      length_mm: bearerLength,
      width_mm: bearerDimension.width_mm,
      thickness_mm: bearerDimension.thickness_mm,
      stock_length_mm: bearerStock,
    });

    bearerIndex++;
  }

  // Step 5: Calculate fixings
  const polygonWidth = maxX - minX;
  const joistCrossings = Math.max(
    1,
    Math.ceil(polygonWidth / effectiveJoistSpacing)
  );
  const screwsCount = boards.length * joistCrossings * 2;

  // Step 6: Build Bill of Materials
  const bom: BillOfMaterials = {
    boards: aggregateStock(boards),
    joists: aggregateStock(joists),
    bearers: aggregateStock(bearers),
    screws_count: screwsCount,
    total_boards: boards.length,
    total_joists: joists.length,
    total_bearers: bearers.length,
    board_width_mm: boardWidth_mm,
  };

  return { boards, joists, bearers, bom };
}
