import type jsPDF from "jspdf";
import type { BuildPlanInput } from "../build-plan";
import { drawPageHeader, BRAND } from "../helpers";
import { renderSubstructureToImage } from "../canvas-renderer";

export function renderSubstructurePage(doc: jsPDF, input: BuildPlanInput) {
  drawPageHeader(doc, "Substructure Plan");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Render canvas diagram
  const imgData = renderSubstructureToImage(input.layout, input.design, 2400, 1600);

  // Fit image (leave space for header + spacing info at bottom)
  const imgW = pageW - 30;
  const imgH = pageH - 60;
  doc.addImage(imgData, "PNG", 15, 30, imgW, imgH);

  // Spacing info below diagram
  const y = pageH - 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.driftwood);

  const joists = input.layout.joists;
  const bearers = input.layout.bearers;

  const notes: string[] = [];
  if (joists.length >= 2) {
    const spacing = Math.abs(joists[1].x - joists[0].x);
    notes.push(`Joists: ${joists[0].width_mm}×${joists[0].thickness_mm}mm @ ${Math.round(spacing)}mm centres (${joists.length} required)`);
  }
  if (bearers.length >= 2) {
    const spacing = Math.abs(bearers[1].y - bearers[0].y);
    notes.push(`Bearers: ${bearers[0].width_mm}×${bearers[0].thickness_mm}mm @ ${Math.round(spacing)}mm centres (${bearers.length} required)`);
  }

  doc.text(notes.join("    |    "), pageW / 2, y, { align: "center" });
}
