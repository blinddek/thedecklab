import type jsPDF from "jspdf";
import type { BuildPlanInput } from "../build-plan";
import { BRAND, loadLogoBase64, findOptionName, formatMm } from "../helpers";

export async function renderCoverPage(doc: jsPDF, input: BuildPlanInput) {
  const { state, options, quote, layout, cutoffMetrics, design } = input;
  const pageW = doc.internal.pageSize.getWidth();

  // Logo
  try {
    const logo = await loadLogoBase64();
    doc.addImage(logo, "PNG", (pageW - 40) / 2, 10, 40, 40);
  } catch {
    // Logo failed — continue without it
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("DECK BUILD PLAN", pageW / 2, 60, { align: "center" });

  // Ember rule
  doc.setDrawColor(...BRAND.ember);
  doc.setLineWidth(1);
  doc.line(40, 65, pageW - 40, 65);

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.driftwood);
  doc.text(`Generated: ${input.date}`, pageW / 2, 73, { align: "center" });

  // Configuration summary table
  let y = 88;
  const labelX = 30;
  const valueX = 95;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("CONFIGURATION SUMMARY", labelX, y);
  y += 10;

  const rows: [string, string][] = [
    ["Deck Type", findOptionName(options.deck_types, state.deck_type_id)],
    ["Material", findOptionName(options.materials, state.material_type_id)],
    ["Dimensions", `${state.length_m}m × ${state.width_m}m`],
    ["Area", `${quote.area_m2.toFixed(1)} m²`],
    ["Board Direction", findOptionName(options.directions, state.board_direction_id)],
    ["Board Profile", findOptionName(options.profiles, state.board_profile_id)],
  ];

  if (state.finish_option_id && options.finish_options) {
    rows.push(["Finish", findOptionName(options.finish_options, state.finish_option_id)]);
  }
  rows.push(["Installation", state.include_installation ? "Yes (Western Cape)" : "Supply Only"]);

  doc.setFontSize(10);
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.driftwood);
    doc.text(label, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.ironwood);
    doc.text(value, valueX, y);
    y += 7;
  }

  // Material counts
  y += 8;
  doc.setDrawColor(...BRAND.grain);
  doc.setLineWidth(0.5);
  doc.line(labelX, y - 3, pageW - 30, y - 3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ironwood);
  doc.text("MATERIALS OVERVIEW", labelX, y + 4);
  y += 14;

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.ironwood);

  const bom = layout.bom;
  doc.text(`Deck Boards:  ${bom.total_boards}  (${layout.boards.length} pieces cut)`, labelX, y); y += 7;
  doc.text(`Joists:       ${bom.total_joists}`, labelX, y); y += 7;
  doc.text(`Bearers:      ${bom.total_bearers}`, labelX, y); y += 7;
  doc.text(`Screws:       ${bom.screws_count}`, labelX, y); y += 7;

  // Offcut savings
  if (cutoffMetrics && cutoffMetrics.boards_saved > 0) {
    y += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.offcutGreen);
    doc.text(
      `Optimised cut plan saves ${cutoffMetrics.boards_saved} board(s) through offcut reuse ` +
      `(${cutoffMetrics.waste_percent.toFixed(1)}% waste)`,
      labelX, y
    );
  }

  // Perimeter note
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.driftwood);
  doc.text(`Deck perimeter: ${formatMm(design.perimeter_m * 1000)} (${design.perimeter_m.toFixed(1)}m)`, labelX, y);
}
