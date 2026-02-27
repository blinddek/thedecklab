import type jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BuildPlanInput } from "../build-plan";
import { drawPageHeader, BRAND, formatRand } from "../helpers";

export function renderShoppingListPage(doc: jsPDF, input: BuildPlanInput) {
  drawPageHeader(doc, "Shopping List");

  const { layout, quote } = input;
  const bom = layout.bom;

  const y = 33;

  // Deck boards section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("Decking Boards", 15, y);

  autoTable(doc, {
    startY: y + 3,
    head: [["Stock Length", "Quantity"]],
    body: bom.boards.map((s) => [
      `${Math.round(s.stock_length_mm)}mm (${(s.stock_length_mm / 1000).toFixed(1)}m)`,
      `${s.quantity}`,
    ]),
    foot: [["Total boards", `${bom.total_boards}`]],
    styles: { fontSize: 9, font: "helvetica", cellPadding: 3 },
    headStyles: {
      fillColor: BRAND.ember,
      textColor: BRAND.white,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: BRAND.grain,
      textColor: BRAND.ironwood,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: BRAND.sandstone },
    margin: { left: 15, right: 15 },
  });

  // Joists section
  const afterBoards = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("Joists", 15, afterBoards);

  autoTable(doc, {
    startY: afterBoards + 3,
    head: [["Stock Length", "Quantity"]],
    body: bom.joists.map((s) => [
      `${Math.round(s.stock_length_mm)}mm (${(s.stock_length_mm / 1000).toFixed(1)}m)`,
      `${s.quantity}`,
    ]),
    foot: [["Total joists", `${bom.total_joists}`]],
    styles: { fontSize: 9, font: "helvetica", cellPadding: 3 },
    headStyles: { fillColor: BRAND.ember, textColor: BRAND.white, fontStyle: "bold" },
    footStyles: { fillColor: BRAND.grain, textColor: BRAND.ironwood, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.sandstone },
    margin: { left: 15, right: 15 },
  });

  // Bearers section
  const afterJoists = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("Bearers", 15, afterJoists);

  autoTable(doc, {
    startY: afterJoists + 3,
    head: [["Stock Length", "Quantity"]],
    body: bom.bearers.map((s) => [
      `${Math.round(s.stock_length_mm)}mm (${(s.stock_length_mm / 1000).toFixed(1)}m)`,
      `${s.quantity}`,
    ]),
    foot: [["Total bearers", `${bom.total_bearers}`]],
    styles: { fontSize: 9, font: "helvetica", cellPadding: 3 },
    headStyles: { fillColor: BRAND.ember, textColor: BRAND.white, fontStyle: "bold" },
    footStyles: { fillColor: BRAND.grain, textColor: BRAND.ironwood, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.sandstone },
    margin: { left: 15, right: 15 },
  });

  // Fixings section
  const afterBearers = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("Fixings & Accessories", 15, afterBearers);

  const screwsPerBox = 200;
  const boxes = Math.ceil(bom.screws_count / screwsPerBox);

  autoTable(doc, {
    startY: afterBearers + 3,
    head: [["Item", "Quantity"]],
    body: [
      ["Deck screws", `${bom.screws_count} (${boxes} box${boxes !== 1 ? "es" : ""})`],
      ["Board spacers (3-5mm)", `${bom.total_boards} pack`],
      ["Joist tape", `${Math.ceil((bom.total_joists * 3) / 15)} roll(s)`],
    ],
    styles: { fontSize: 9, font: "helvetica", cellPadding: 3 },
    headStyles: { fillColor: BRAND.ember, textColor: BRAND.white, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.sandstone },
    margin: { left: 15, right: 15 },
  });

  // Price summary
  const afterFixings = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setDrawColor(...BRAND.grain);
  doc.setLineWidth(0.5);
  doc.line(15, afterFixings - 4, doc.internal.pageSize.getWidth() - 15, afterFixings - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("ESTIMATED COST", 15, afterFixings + 3);

  const priceRows: [string, string][] = [
    ["Deck boards", formatRand(quote.materials_cents)],
    ["Substructure", formatRand(quote.substructure_cents)],
    ["Fixings", formatRand(quote.fixings_cents)],
  ];
  if (quote.staining_cents > 0) priceRows.push(["Staining / Finish", formatRand(quote.staining_cents)]);

  autoTable(doc, {
    startY: afterFixings + 6,
    body: priceRows,
    foot: [["Materials Total (excl. VAT)", formatRand(
      quote.materials_cents + quote.substructure_cents + quote.fixings_cents + quote.staining_cents
    )]],
    styles: { fontSize: 9, font: "helvetica", cellPadding: 3 },
    footStyles: { fillColor: BRAND.ember, textColor: BRAND.white, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.sandstone },
    columnStyles: { 1: { halign: "right", font: "courier" } },
    margin: { left: 15, right: 15 },
  });
}
