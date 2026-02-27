import jsPDF from "jspdf";
import type {
  BoardLayoutResult,
  CutoffMetrics,
  DeckDesign,
  DeckQuote,
} from "@/types/deck";
import type { ConfigOptions, DeckState } from "@/components/configurator/deck-configurator";
import { drawPageFooter } from "./helpers";
import { renderCoverPage } from "./pages/cover-page";
import { renderBoardLayoutPage } from "./pages/board-layout-page";
import { renderSubstructurePage } from "./pages/substructure-page";
import { renderCutListPage } from "./pages/cut-list-page";
import { renderScrewPatternPage } from "./pages/screw-pattern-page";
import { renderShoppingListPage } from "./pages/shopping-list-page";
import { renderInstallationNotesPage } from "./pages/installation-notes-page";

export interface BuildPlanInput {
  state: DeckState;
  options: ConfigOptions;
  quote: DeckQuote;
  design: DeckDesign;
  layout: BoardLayoutResult;
  cutoffMetrics: CutoffMetrics;
  date: string;
}

export async function generateBuildPlanPdf(input: BuildPlanInput): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Page 1: Cover (portrait)
  await renderCoverPage(doc, input);

  // Page 2: Board Layout (landscape)
  doc.addPage("a4", "landscape");
  renderBoardLayoutPage(doc, input);

  // Page 3: Substructure (landscape)
  doc.addPage("a4", "landscape");
  renderSubstructurePage(doc, input);

  // Page 4: Cut List (portrait — may span multiple pages via autotable)
  doc.addPage("a4", "portrait");
  renderCutListPage(doc, input);

  // Page 5: Screw Pattern (portrait)
  doc.addPage("a4", "portrait");
  renderScrewPatternPage(doc, input);

  // Page 6: Shopping List (portrait)
  doc.addPage("a4", "portrait");
  renderShoppingListPage(doc, input);

  // Page 7: Installation Notes (portrait — may add extra pages)
  doc.addPage("a4", "portrait");
  renderInstallationNotesPage(doc, input);

  // Add footers to all pages (after all content rendered so total page count is correct)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, i, totalPages, input.date);
  }

  return doc.output("blob");
}
