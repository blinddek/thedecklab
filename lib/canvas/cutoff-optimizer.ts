import type { CutoffMetrics } from "@/types/deck";

export interface CutPiece {
  id: string;
  required_length_mm: number;
}

export interface OptimizationInput {
  cuts: CutPiece[];
  availableLengths_mm: number[];
  kerf_mm: number;
  minUsableOffcut_mm: number;
  pricePerMetre_cents: number;
}

interface OffcutEntry {
  id: string;
  remaining_mm: number;
  stock_length_mm: number;
}

interface Assignment {
  stock_length_mm: number;
  source: "new" | "offcut";
  offcut_source_id?: string;
}

/**
 * Pick the shortest available stock length that fits the required length.
 * Returns undefined if no stock is long enough.
 */
function pickStock(
  required_mm: number,
  availableLengths_mm: number[]
): number | undefined {
  const sorted = [...availableLengths_mm].sort((a, b) => a - b);
  for (const stock of sorted) {
    if (stock >= required_mm) {
      return stock;
    }
  }
  return undefined;
}

/**
 * Greedy cutoff optimization.
 *
 * Sorts cuts descending by length, then for each cut:
 * 1. Try to fit in an existing offcut (best-fit: smallest offcut that fits)
 * 2. If no offcut fits, open a new stock board
 * 3. Track leftover material as offcuts for future cuts
 */
export function optimizeCutoffs(input: OptimizationInput): {
  assignments: Map<string, Assignment>;
  metrics: CutoffMetrics;
} {
  const {
    cuts,
    availableLengths_mm,
    kerf_mm,
    minUsableOffcut_mm,
    pricePerMetre_cents,
  } = input;

  // Step 1: Sort cuts descending by required length
  const sortedCuts = [...cuts].sort(
    (a, b) => b.required_length_mm - a.required_length_mm
  );

  const assignments = new Map<string, Assignment>();
  const offcutPool: OffcutEntry[] = [];
  let newBoardsOpened = 0;
  let totalStockMaterial_mm = 0;
  let stockIdCounter = 0;

  // Step 2-3: Process each cut
  for (const cut of sortedCuts) {
    const requiredWithKerf = cut.required_length_mm + kerf_mm;

    // Try to find the best offcut (smallest remaining that still fits)
    let bestOffcutIdx = -1;
    let bestRemaining = Infinity;

    for (let i = 0; i < offcutPool.length; i++) {
      const offcut = offcutPool[i];
      if (
        offcut.remaining_mm >= requiredWithKerf &&
        offcut.remaining_mm < bestRemaining
      ) {
        bestOffcutIdx = i;
        bestRemaining = offcut.remaining_mm;
      }
    }

    if (bestOffcutIdx >= 0) {
      // Use existing offcut
      const offcut = offcutPool[bestOffcutIdx];
      offcut.remaining_mm -= requiredWithKerf;

      assignments.set(cut.id, {
        stock_length_mm: offcut.stock_length_mm,
        source: "offcut",
        offcut_source_id: offcut.id,
      });

      // Remove from pool if too small to be usable
      if (offcut.remaining_mm < minUsableOffcut_mm) {
        offcutPool.splice(bestOffcutIdx, 1);
      }
    } else {
      // Open a new stock board
      const stockLength = pickStock(requiredWithKerf, availableLengths_mm);

      if (stockLength !== undefined) {
        const leftover = stockLength - requiredWithKerf;
        const stockId = `stock-${stockIdCounter++}`;

        newBoardsOpened++;
        totalStockMaterial_mm += stockLength;

        assignments.set(cut.id, {
          stock_length_mm: stockLength,
          source: "new",
        });

        // Add leftover to pool if usable
        if (leftover >= minUsableOffcut_mm) {
          offcutPool.push({
            id: stockId,
            remaining_mm: leftover,
            stock_length_mm: stockLength,
          });
        }
      } else {
        // No stock long enough -- use the longest available
        const sorted = [...availableLengths_mm].sort((a, b) => b - a);
        const longestStock = sorted[0] ?? cut.required_length_mm;

        newBoardsOpened++;
        totalStockMaterial_mm += longestStock;

        assignments.set(cut.id, {
          stock_length_mm: longestStock,
          source: "new",
        });
        // No usable offcut in this case
      }
    }
  }

  // Step 4: Calculate metrics
  const naiveBoardCount = cuts.length; // worst case: 1 new board per cut
  const boardsSaved = naiveBoardCount - newBoardsOpened;

  // Waste = stock opened − deck board material − usable offcuts still in pool.
  // The old formula counted offcut-sourced cuts against totalUsedMaterial even
  // though those boards were already opened, causing negative waste values.
  const totalRequiredMaterial_mm = sortedCuts.reduce(
    (sum, cut) => sum + cut.required_length_mm,
    0
  );
  const usableOffcutsRemaining_mm = offcutPool.reduce(
    (sum, o) => sum + o.remaining_mm,
    0
  );
  const totalWaste_mm = Math.max(
    0,
    totalStockMaterial_mm - totalRequiredMaterial_mm - usableOffcutsRemaining_mm
  );
  const wastePercent =
    totalStockMaterial_mm > 0
      ? (totalWaste_mm / totalStockMaterial_mm) * 100
      : 0;

  // Savings estimate
  const averageStockLength_mm =
    newBoardsOpened > 0 ? totalStockMaterial_mm / newBoardsOpened : 0;
  const savingsEstimateCents = Math.round(
    boardsSaved * (averageStockLength_mm / 1000) * pricePerMetre_cents
  );

  // Aggregate remaining offcuts by length
  const offcutLengthMap = new Map<number, number>();
  for (const offcut of offcutPool) {
    const roundedLength = Math.round(offcut.remaining_mm);
    offcutLengthMap.set(
      roundedLength,
      (offcutLengthMap.get(roundedLength) ?? 0) + 1
    );
  }
  const offcuts = Array.from(offcutLengthMap.entries())
    .map(([length_mm, count]) => ({ length_mm, count }))
    .sort((a, b) => b.length_mm - a.length_mm);

  const metrics: CutoffMetrics = {
    boards_used: newBoardsOpened,
    boards_saved: Math.max(0, boardsSaved),
    waste_percent: Math.round(wastePercent * 100) / 100,
    savings_estimate_cents: Math.max(0, savingsEstimateCents),
    offcuts,
  };

  return { assignments, metrics };
}
