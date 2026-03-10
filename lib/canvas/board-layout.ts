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
 * Aggregate pieces into stock summaries using greedy bin-packing.
 * Multiple short pieces that fit on the same stock board are counted as one purchase.
 */
function aggregateStock(
  pieces: Array<{ stock_length_mm: number; length_mm: number }>
): StockSummary[] {
  // Group cut lengths by their stock length
  const groups = new Map<number, number[]>();
  for (const p of pieces) {
    const cuts = groups.get(p.stock_length_mm) ?? [];
    cuts.push(p.length_mm);
    groups.set(p.stock_length_mm, cuts);
  }
  const summaries: StockSummary[] = [];
  for (const [stock_length_mm, cuts] of groups) {
    // Greedy first-fit bin packing: sort largest first
    cuts.sort((a, b) => b - a);
    const remaining: number[] = [];
    for (const cut of cuts) {
      const idx = remaining.findIndex(r => r >= cut);
      if (idx >= 0) {
        remaining[idx] -= cut;
      } else {
        remaining.push(stock_length_mm - cut);
      }
    }
    summaries.push({ stock_length_mm, quantity: remaining.length });
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
  //
  // Layout rule (mirrors bearer logic, applied along the X axis):
  //   • Use floor((width - joistW) / (spacing + joistW)) full clear spans.
  //   • Remainder is split equally as overhang on both ends.
  //   • If overhang exceeds max cantilever (min(spacing×0.25, 450mm)),
  //     add a span and reduce clear span so everything fits with zero overhang.
  //
  // Effective max spacing: min(boardThickness×20, joistSpacing)
  const effectiveJoistSpacing = Math.min(
    boardThickness_mm * 20,
    joistSpacing_mm
  );

  const joistWidth = joistDimension.width_mm;
  const polygonWidth = maxX - minX;
  const maxJoistCantilever = Math.min(effectiveJoistSpacing * 0.25, 450);

  let numJoistClearSpans = Math.max(
    1,
    Math.floor((polygonWidth - joistWidth) / (effectiveJoistSpacing + joistWidth))
  );
  let joistClearSpan = effectiveJoistSpacing;
  let joistOverhang =
    (polygonWidth - (numJoistClearSpans + 1) * joistWidth - numJoistClearSpans * joistClearSpan) / 2;

  if (joistOverhang < 0) {
    // Deck too narrow for full-spacing span — compress span, no overhang
    const spaceForSpans = polygonWidth - (numJoistClearSpans + 1) * joistWidth;
    joistClearSpan = Math.max(0, spaceForSpans / numJoistClearSpans);
    joistOverhang = 0;
  } else if (joistOverhang > maxJoistCantilever) {
    // Overhang too large — add a span and compress spacing to fit
    numJoistClearSpans++;
    const spaceForSpans = polygonWidth - (numJoistClearSpans + 1) * joistWidth;
    if (spaceForSpans < numJoistClearSpans * effectiveJoistSpacing) {
      joistClearSpan = Math.max(0, spaceForSpans / numJoistClearSpans);
      joistOverhang = 0;
    } else {
      joistOverhang =
        (polygonWidth - (numJoistClearSpans + 1) * joistWidth - numJoistClearSpans * joistClearSpan) / 2;
    }
  }

  const numJoists = numJoistClearSpans + 1;
  const joistXPositions: number[] = [];
  for (let i = 0; i < numJoists; i++) {
    joistXPositions.push(minX + joistOverhang + i * (joistClearSpan + joistWidth));
  }
  // FP clamp: prevent last joist drifting past maxX - joistWidth
  if (joistXPositions.length > 0) {
    const last = joistXPositions.length - 1;
    if (joistXPositions[last] + joistWidth > maxX) {
      joistXPositions[last] = maxX - joistWidth;
    }
  }

  // Add structural joists at cutout X-edges
  for (const invPoly of invertedWorkPolygons) {
    const invBounds = getBounds(invPoly);
    const beforeCutout = invBounds.minX - joistWidth;
    const afterCutout = invBounds.maxX;
    for (const pos of [beforeCutout, afterCutout]) {
      if (pos < minX || pos + joistWidth > maxX + 1) continue;
      if (joistXPositions.some(e => Math.abs(e - pos) < joistWidth * 2)) continue;
      joistXPositions.push(pos);
    }
  }
  joistXPositions.sort((a, b) => a - b);

  const joists: JoistPiece[] = [];
  let joistIndex = 0;

  for (const jx of joistXPositions) {
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

  // Step 4: Bearers -- perpendicular to joists
  //
  // Layout rule:
  //   • Use floor(depth / (spacing + width)) full clear spans at bearerSpacing_mm.
  //   • Remaining space is split equally as overhang on both ends.
  //   • If that overhang exceeds the structural cantilever limit
  //     (min(spacing×0.25, 450mm)), add one more span and reduce the clear
  //     span so everything fits evenly with zero overhang.
  //
  // Bearer `y` stores the OUTER FACE position; the bearer box extends from
  // there to y + width_mm (rendered correctly by the 3D preview).
  const bearers: BearerPiece[] = [];
  let bearerIndex = 0;

  const totalDepth = maxY - minY;
  const bearerWidth = bearerDimension.width_mm;
  const maxCantilever = Math.min(bearerSpacing_mm * 0.25, 450);

  let numClearSpans = Math.max(1, Math.floor((totalDepth - bearerWidth) / (bearerSpacing_mm + bearerWidth)));
  let clearSpan = bearerSpacing_mm;
  let bearerOverhang = (totalDepth - (numClearSpans + 1) * bearerWidth - numClearSpans * clearSpan) / 2;

  if (bearerOverhang < 0) {
    // Deck too small for a full-spacing span — compress span to fit exactly, no overhang
    const spaceForSpans = totalDepth - (numClearSpans + 1) * bearerWidth;
    clearSpan = Math.max(0, spaceForSpans / numClearSpans);
    bearerOverhang = 0;
  } else if (bearerOverhang > maxCantilever) {
    // Overhang too large — add a span and compress spacing to fit
    numClearSpans++;
    const spaceForSpans = totalDepth - (numClearSpans + 1) * bearerWidth;
    if (spaceForSpans < numClearSpans * bearerSpacing_mm) {
      // Full spacing won't fit — distribute evenly with no overhang
      clearSpan = Math.max(0, spaceForSpans / numClearSpans);
      bearerOverhang = 0;
    } else {
      bearerOverhang = (totalDepth - (numClearSpans + 1) * bearerWidth - numClearSpans * clearSpan) / 2;
    }
  }

  const numBearers = numClearSpans + 1;
  const bearerYPositions: number[] = [];
  for (let i = 0; i < numBearers; i++) {
    bearerYPositions.push(minY + bearerOverhang + i * (clearSpan + bearerWidth));
  }
  // Clamp last bearer: floating-point drift (e.g. clearSpan = N/3) can push
  // it fractionally past maxY - bearerWidth, making it render outside the deck.
  if (bearerYPositions.length > 0) {
    const last = bearerYPositions.length - 1;
    if (bearerYPositions[last] + bearerWidth > maxY) {
      bearerYPositions[last] = maxY - bearerWidth;
    }
  }

  // Add structural bearers flush with each cutout's Y-edges.
  // A cutout can remove or split the regular bearer at those positions,
  // leaving joists at the cutout boundary unsupported.
  // These bearers are short — they only span the cutout's X extent.
  const cutoutEdgeBearerXBounds = new Map<number, [number, number]>();

  for (const invPoly of invertedWorkPolygons) {
    const invBounds = getBounds(invPoly);
    // Bearer whose inner face aligns with the cutout's near edge
    const beforeCutout = invBounds.minY - bearerWidth;
    // Bearer whose outer face aligns with the cutout's far edge
    const afterCutout = invBounds.maxY;
    for (const pos of [beforeCutout, afterCutout]) {
      if (pos < minY || pos + bearerWidth > maxY + 1) continue;
      // Skip if already within 2× bearer-widths of an existing position
      if (bearerYPositions.some(e => Math.abs(e - pos) < bearerWidth * 2)) continue;
      bearerYPositions.push(pos);
      cutoutEdgeBearerXBounds.set(pos, [invBounds.minX, invBounds.maxX]);
    }
  }
  bearerYPositions.sort((a, b) => a - b);

  for (const by of bearerYPositions) {
    // Scan at bearer centre for polygon intersection (avoids exclusive-top edge issues)
    const scanY = by + bearerWidth / 2;

    // Clip bearer against polygon and cutouts — one piece per contiguous segment
    let segs = intersectScanline(scanY, workPolygon);
    if (invertedWorkPolygons.length > 0) {
      for (const invPoly of invertedWorkPolygons) {
        segs = subtractIntervals(segs, intersectScanline(scanY, invPoly));
      }
    }

    // Cutout-edge bearers only span the cutout's X width, not the full deck
    const cutoutXBounds = cutoutEdgeBearerXBounds.get(by);
    if (cutoutXBounds) {
      segs = segs.flatMap(([sx1, sx2]): [number, number][] => {
        const cx1 = Math.max(sx1, cutoutXBounds[0]);
        const cx2 = Math.min(sx2, cutoutXBounds[1]);
        return cx1 < cx2 ? [[cx1, cx2]] : [];
      });
    }

    for (const [sx1, sx2] of segs) {
      const bearerLength = sx2 - sx1;
      if (bearerLength <= 0) continue;

      const bearerStock = pickStock(bearerLength, bearerDimension.availableLengths_mm);

      let bxPos = sx1;
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
  }

  // Step 5: Calculate fixings
  const joistCrossings = Math.max(
    1,
    Math.ceil((maxX - minX) / effectiveJoistSpacing)
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
