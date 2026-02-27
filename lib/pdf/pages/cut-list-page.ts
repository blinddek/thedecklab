import type jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BuildPlanInput } from "../build-plan";
import { drawPageHeader, BRAND } from "../helpers";

export function renderCutListPage(doc: jsPDF, input: BuildPlanInput) {
  drawPageHeader(doc, "Cut List");

  const { layout } = input;

  // Deck boards table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("Deck Boards", 15, 33);

  autoTable(doc, {
    startY: 36,
    head: [["#", "Cut Length", "Stock Length", "Offcut", "Source"]],
    body: layout.boards.map((board, i) => {
      const isOffcut = board.source === "offcut";
      const offcutLength = !isOffcut ? board.stock_length_mm - board.cut_length_mm : 0;
      const sourceIdx = isOffcut && board.offcut_source_id
        ? board.offcut_source_id.replace(/\D/g, "")
        : "";
      return [
        `${i + 1}`,
        `${Math.round(board.cut_length_mm)}mm`,
        isOffcut ? "—" : `${Math.round(board.stock_length_mm)}mm`,
        offcutLength > 0 ? `${Math.round(offcutLength)}mm` : "—",
        isOffcut ? `Offcut of #${sourceIdx}` : "New stock",
      ];
    }),
    styles: { fontSize: 8, font: "courier", cellPadding: 2 },
    headStyles: {
      fillColor: BRAND.ember,
      textColor: BRAND.white,
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: BRAND.sandstone },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 28, halign: "right" },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: "auto" },
    },
    margin: { left: 15, right: 15 },
  });

  // Joists table (if any)
  if (layout.joists.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const startY = finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.ironwood);
    doc.text("Joists", 15, startY);

    autoTable(doc, {
      startY: startY + 3,
      head: [["#", "Length", "Stock Length"]],
      body: layout.joists.map((joist, i) => [
        `J${i + 1}`,
        `${Math.round(joist.length_mm)}mm`,
        `${Math.round(joist.stock_length_mm)}mm`,
      ]),
      styles: { fontSize: 8, font: "courier", cellPadding: 2 },
      headStyles: {
        fillColor: BRAND.ember,
        textColor: BRAND.white,
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: BRAND.sandstone },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 30, halign: "right" },
        2: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // Bearers table (if any)
  if (layout.bearers.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const startY = finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.ironwood);
    doc.text("Bearers", 15, startY);

    autoTable(doc, {
      startY: startY + 3,
      head: [["#", "Length", "Stock Length"]],
      body: layout.bearers.map((bearer, i) => [
        `B${i + 1}`,
        `${Math.round(bearer.length_mm)}mm`,
        `${Math.round(bearer.stock_length_mm)}mm`,
      ]),
      styles: { fontSize: 8, font: "courier", cellPadding: 2 },
      headStyles: {
        fillColor: BRAND.ember,
        textColor: BRAND.white,
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: BRAND.sandstone },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 30, halign: "right" },
        2: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });
  }
}
