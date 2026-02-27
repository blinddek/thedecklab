import type jsPDF from "jspdf";
import type { BuildPlanInput } from "../build-plan";
import { drawPageHeader, BRAND } from "../helpers";

export function renderScrewPatternPage(doc: jsPDF, input: BuildPlanInput) {
  drawPageHeader(doc, "Fixing Pattern");

  const { layout } = input;
  const bom = layout.bom;
  const materialSlug = input.options.materials.find(
    (m) => m.id === input.state.material_type_id
  )?.slug ?? "";
  const isComposite = materialSlug.includes("composite");
  const isHardwood = materialSlug.includes("balau") || materialSlug.includes("garapa") || materialSlug.includes("hardwood");

  let y = 35;
  const labelX = 15;
  const pageW = doc.internal.pageSize.getWidth();

  // Screw summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("SCREW SUMMARY", labelX, y);
  y += 10;

  const screwType = isComposite
    ? "Composite deck screws (hidden clip system)"
    : isHardwood
      ? "Stainless steel (316) deck screws, 50mm"
      : "Galvanised deck screws, 50mm";
  const screwsPerBox = 200;
  const boxesNeeded = Math.ceil(bom.screws_count / screwsPerBox);
  const spare = boxesNeeded * screwsPerBox - bom.screws_count;

  const rows: [string, string][] = [
    ["Screw Type", screwType],
    ["Total Screws", `${bom.screws_count}`],
    ["Boxes Needed", `${boxesNeeded} (box of ${screwsPerBox})`],
    ["Spare Screws", `${spare}`],
  ];

  if (!isComposite) {
    rows.push(["Spacing Rule", "2 screws per board at each joist crossing"]);
    if (isHardwood) {
      rows.push(["Pre-drilling", "REQUIRED — pilot holes at each screw position"]);
    }
  }

  doc.setFontSize(10);
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.driftwood);
    doc.text(label, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.ironwood);
    doc.text(value, labelX + 45, y);
    y += 7;
  }

  // Simple fixing diagram
  y += 12;
  doc.setDrawColor(...BRAND.grain);
  doc.setLineWidth(0.5);
  doc.line(labelX, y - 4, pageW - 15, y - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("FIXING PATTERN DIAGRAM", labelX, y + 4);
  y += 16;

  // Draw a mini schematic: 3 boards × 3 joists
  const diagramX = 30;
  const diagramY = y;
  const boardW = 120;
  const boardH = 14;
  const boardGap = 4;
  const joistSpacing = 50;
  const numBoards = 3;
  const numJoists = 3;

  // Draw joists (vertical dashed)
  doc.setDrawColor(...BRAND.driftwood);
  doc.setLineWidth(0.5);
  const dashLen = 3;
  for (let j = 0; j < numJoists; j++) {
    const jx = diagramX + j * joistSpacing;
    for (let dy = 0; dy < numBoards * (boardH + boardGap); dy += dashLen * 2) {
      doc.line(jx, diagramY + dy, jx, diagramY + Math.min(dy + dashLen, numBoards * (boardH + boardGap)));
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.driftwood);
    doc.text(`Joist ${j + 1}`, jx, diagramY - 3, { align: "center" });
  }

  // Draw boards (horizontal rects)
  for (let b = 0; b < numBoards; b++) {
    const by = diagramY + b * (boardH + boardGap);
    doc.setFillColor(...BRAND.board);
    doc.setDrawColor(...BRAND.driftwood);
    doc.setLineWidth(0.3);
    doc.rect(diagramX - 10, by, boardW + 20, boardH, "FD");

    // Screw positions (X marks at joist crossings)
    for (let j = 0; j < numJoists; j++) {
      const sx = diagramX + j * joistSpacing;
      const sy = by + boardH / 2;
      const size = 2;

      doc.setDrawColor(...BRAND.ember);
      doc.setLineWidth(0.8);
      doc.line(sx - size, sy - size, sx + size, sy + size);
      doc.line(sx - size, sy + size, sx + size, sy - size);
    }
  }

  // Label
  const labelY = diagramY + numBoards * (boardH + boardGap) + 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.driftwood);
  doc.text("× = screw position (2 per joist crossing)", diagramX - 10, labelY);

  // Additional notes
  y = labelY + 16;
  doc.setDrawColor(...BRAND.grain);
  doc.setLineWidth(0.5);
  doc.line(labelX, y - 4, pageW - 15, y - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("FIXING NOTES", labelX, y + 4);
  y += 14;

  const notes = [
    "Pre-drill pilot holes 2mm smaller than screw diameter to prevent splitting.",
    "Keep screws 25mm from board edges and 15mm from board ends.",
    "Use a spacer (3-5mm) between boards for drainage and expansion.",
    "Countersink screws 1-2mm below the board surface.",
    "Apply stainless steel screws for hardwood and coastal installations.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.ironwood);
  for (const note of notes) {
    doc.text(`•  ${note}`, labelX + 2, y);
    y += 6;
  }
}
