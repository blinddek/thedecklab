import type jsPDF from "jspdf";
import type { BuildPlanInput } from "../build-plan";
import { drawPageHeader } from "../helpers";
import { renderBoardLayoutToImage } from "../canvas-renderer";

export function renderBoardLayoutPage(doc: jsPDF, input: BuildPlanInput) {
  drawPageHeader(doc, "Board Layout Plan");

  const pageW = doc.internal.pageSize.getWidth(); // landscape: 297
  const pageH = doc.internal.pageSize.getHeight(); // landscape: 210

  // Render canvas diagram
  const imgData = renderBoardLayoutToImage(input.layout, input.design, 2400, 1600);

  // Fit image into printable area (margins: 15mm each side, 30mm top for header, 15mm bottom)
  const imgW = pageW - 30;
  const imgH = pageH - 45;
  doc.addImage(imgData, "PNG", 15, 30, imgW, imgH);
}
