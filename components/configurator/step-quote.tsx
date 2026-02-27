"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, FileDown } from "lucide-react";
import { saveQuote } from "@/lib/deck/actions";
import { toast } from "sonner";
import type { DeckQuote, DeckDesign, BoardLayoutResult, CutoffMetrics } from "@/types/deck";
import type { ConfigOptions, DeckState } from "./deck-configurator";

interface Props {
  quote: DeckQuote | null;
  loading: boolean;
  state: DeckState;
  options: ConfigOptions;
  onRecalculate: () => void;
  design: DeckDesign;
  boardLayout: BoardLayoutResult | null;
  cutoffMetrics: CutoffMetrics | null;
}

function formatRand(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function findName(items: { id: string; name: { en: string } }[], id: string): string {
  return items.find((i) => i.id === id)?.name.en ?? "—";
}

export function StepQuote({
  quote, loading, state, options, onRecalculate,
  design, boardLayout, cutoffMetrics,
}: Props) {
  const [formState, formAction, isPending] = useActionState(saveQuote, null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleDownloadBuildPlan = async () => {
    if (!quote || !boardLayout || !cutoffMetrics) return;
    setPdfGenerating(true);
    try {
      const { generateBuildPlanPdf } = await import("@/lib/pdf/build-plan");
      const blob = await generateBuildPlanPdf({
        state, options, quote, design,
        layout: boardLayout, cutoffMetrics,
        date: new Date().toLocaleDateString("en-ZA"),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deck-build-plan-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to generate build plan. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  useEffect(() => {
    if (formState?.success) {
      toast.success("Quote saved! Check your email for a copy.");
    } else if (formState && !formState.success && formState.error) {
      toast.error(formState.error);
    }
  }, [formState]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-3">Calculating your quote...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Could not calculate quote. Please check your selections and try again.
        </p>
        <Button variant="outline" onClick={onRecalculate} className="mt-4">
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  const deckType = findName(options.deck_types, state.deck_type_id);
  const material = findName(options.materials, state.material_type_id);
  const direction = findName(options.directions, state.board_direction_id);
  const profile = findName(options.profiles, state.board_profile_id);
  const finish = state.finish_option_id && options.finish_options
    ? findName(options.finish_options, state.finish_option_id)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Deck Quote</h2>
        <Button variant="ghost" size="sm" onClick={onRecalculate}>
          <RefreshCw className="size-4" />
          Recalculate
        </Button>
      </div>

      {/* Configuration summary */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Configuration
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Deck Type</dt>
          <dd className="font-medium">{deckType}</dd>
          <dt className="text-muted-foreground">Material</dt>
          <dd className="font-medium">{material}</dd>
          <dt className="text-muted-foreground">Dimensions</dt>
          <dd className="font-medium">
            {state.length_m}m × {state.width_m}m ({quote.area_m2.toFixed(1)} m²)
          </dd>
          <dt className="text-muted-foreground">Board Direction</dt>
          <dd className="font-medium">{direction}</dd>
          <dt className="text-muted-foreground">Profile</dt>
          <dd className="font-medium">{profile}</dd>
          {finish && (
            <>
              <dt className="text-muted-foreground">Finish</dt>
              <dd className="font-medium">{finish}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Installation</dt>
          <dd className="font-medium">
            {state.include_installation ? "Yes (Western Cape)" : "No — Supply Only"}
          </dd>
        </dl>
      </div>

      {/* Price breakdown */}
      <div className="space-y-1">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Price Breakdown
        </h3>
        <div className="divide-y rounded-lg border">
          <LineItem label="Deck boards" amount={quote.materials_cents} />
          <LineItem label="Substructure" amount={quote.substructure_cents} />
          <LineItem label="Fixings" amount={quote.fixings_cents} />
          {quote.staining_cents > 0 && (
            <LineItem label="Staining / Finish" amount={quote.staining_cents} />
          )}
          {quote.labour_cents > 0 && (
            <LineItem label="Installation labour" amount={quote.labour_cents} />
          )}
          {quote.extras_cents > 0 && (
            <LineItem label="Extras" amount={quote.extras_cents} />
          )}
          <LineItem
            label="Subtotal (excl. VAT)"
            amount={quote.subtotal_cents}
            bold
          />
          {quote.delivery_fee_cents > 0 && (
            <LineItem label="Delivery" amount={quote.delivery_fee_cents} />
          )}
          {quote.delivery_fee_cents === 0 && !state.include_installation && (
            <div className="flex justify-between px-4 py-2 text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-secondary font-medium">FREE</span>
            </div>
          )}
          <LineItem label="VAT (15%)" amount={quote.vat_cents} />
          <div className="flex justify-between bg-primary/5 px-4 py-3">
            <span className="text-base font-bold">Total</span>
            <span className="text-xl font-bold text-primary">
              {formatRand(quote.total_cents)}
            </span>
          </div>
          {quote.deposit_cents > 0 && (
            <>
              <LineItem label="Deposit (50%)" amount={quote.deposit_cents} />
              <LineItem label="Balance on completion" amount={quote.balance_cents} />
            </>
          )}
        </div>
      </div>

      {/* Per m² note */}
      <p className="text-center text-xs text-muted-foreground">
        That&apos;s{" "}
        <strong>{formatRand(Math.round(quote.total_cents / quote.area_m2))}/m²</strong>{" "}
        including VAT
        {state.include_installation ? " and installation" : ""}.
      </p>

      {/* Build Plan PDF */}
      {boardLayout && cutoffMetrics && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Build Plan
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Download a detailed 7-page PDF with board layout diagrams, cut list,
            shopping list, and installation notes for your deck.
          </p>
          <Button onClick={handleDownloadBuildPlan} disabled={pdfGenerating} className="w-full">
            {pdfGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileDown className="size-4" />
                Download Build Plan PDF
              </>
            )}
          </Button>
        </div>
      )}

      {/* Save Quote form */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Save Your Quote
        </h3>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="config_snapshot" value={JSON.stringify({ state, quote })} />
          <input type="hidden" name="total_cents" value={quote.total_cents} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sq-name" className="mb-1 block text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="sq-name"
                name="name"
                type="text"
                required
                placeholder="Your full name"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="sq-email" className="mb-1 block text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="sq-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="sq-phone" className="mb-1 block text-sm font-medium">
              Phone <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              id="sq-phone"
              name="phone"
              type="tel"
              placeholder="082 000 0000"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="sq-notes" className="mb-1 block text-sm font-medium">
              Notes <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              id="sq-notes"
              name="notes"
              rows={2}
              placeholder="Any additional details or questions..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || formState?.success}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : formState?.success ? (
              "Quote Saved!"
            ) : (
              "Save My Quote"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function LineItem({
  label,
  amount,
  bold,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between px-4 py-2 text-sm ${
        bold ? "font-semibold" : ""
      }`}
    >
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{formatRand(amount)}</span>
    </div>
  );
}
