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
    const segments = intersectScanline(laneY, workPolygon);

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
    // Scan vertically to find joist extent: use a vertical scanline approach.
    // Find min and max Y where the vertical line at jx intersects the polygon.
    let joistMinY = Infinity;
    let joistMaxY = -Infinity;

    // Sample at fine intervals to find extent
    const step = boardWidth_mm;
    for (let sy = minY; sy <= maxY; sy += step) {
      const segs = intersectScanline(sy, workPolygon);
      for (const [sx1, sx2] of segs) {
        if (jx >= sx1 && jx <= sx2) {
          if (sy < joistMinY) joistMinY = sy;
          if (sy > joistMaxY) joistMaxY = sy;
        }
      }
    }

    if (joistMinY > joistMaxY) continue; // joist not within polygon

    const joistLength = joistMaxY - joistMinY;
    if (joistLength <= 0) continue;

    const joistStock = pickStock(joistLength, joistDimension.availableLengths_mm);

    let jxPos = jx;
    let jyPos = joistMinY;

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

  // Step 4: Bearers -- perpendicular to joists at bearerSpacing centres
  const bearers: BearerPiece[] = [];
  let bearerIndex = 0;

  for (let by = minY; by <= maxY; by += bearerSpacing_mm) {
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
  };

  return { boards, joists, bearers, bom };
}
