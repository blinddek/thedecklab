import type jsPDF from "jspdf";
import type { BuildPlanInput } from "../build-plan";
import { drawPageHeader, BRAND } from "../helpers";

interface Section {
  title: string;
  steps: string[];
}

function getInstallationSections(materialSlug: string, joistSpacing: number, bearerSpacing: number): Section[] {
  const isComposite = materialSlug.includes("composite");
  const isHardwood = materialSlug.includes("balau") || materialSlug.includes("garapa") || materialSlug.includes("hardwood");

  const sections: Section[] = [
    {
      title: "SITE PREPARATION",
      steps: [
        "Level the ground within 25mm tolerance across the full deck area.",
        "Install weed barrier membrane over the entire area to prevent growth.",
        "Ensure adequate drainage — water must flow away from the structure.",
        "Check for underground services before digging post holes or placing pads.",
        "Mark out the deck footprint using string lines and pegs.",
      ],
    },
    {
      title: "SUBSTRUCTURE",
      steps: [
        `Place bearers at ${bearerSpacing}mm centres on concrete pads or post stirrups.`,
        "Ensure all bearers are level using a spirit level — shim where needed.",
        `Install joists at ${joistSpacing}mm centres, perpendicular to bearers.`,
        "Secure joists to bearers with joist hangers or triple-skew nail connections.",
        "Apply joist tape to the top of all joists before laying deck boards.",
        "Check the frame is square by measuring diagonals (they should be equal).",
      ],
    },
    {
      title: "DECKING BOARDS",
      steps: [
        "Start from the outside edge, working inward for best visual appearance.",
        "Use 3-5mm spacers between boards for drainage and thermal expansion.",
        isComposite
          ? "Follow manufacturer's hidden clip installation system."
          : "Fix each board with 2 screws at every joist crossing.",
        isHardwood
          ? "Pre-drill all screw positions with a 2mm pilot drill to prevent splitting."
          : "Pre-drill near board ends to prevent splitting.",
        "Stagger board joints — avoid aligning joints on adjacent boards.",
        "Let boards overhang edges by 20-25mm, then trim with a circular saw for a clean line.",
      ],
    },
  ];

  // Material-specific finishing
  if (isComposite) {
    sections.push({
      title: "FINISHING",
      steps: [
        "No staining or sealing required — composite boards are maintenance-free.",
        "Clean with soapy water and a soft brush after installation.",
        "Install end caps or fascia boards to conceal exposed board ends.",
        "Ensure adequate ventilation below the deck (min 25mm clearance).",
      ],
    });
  } else if (isHardwood) {
    sections.push({
      title: "FINISHING & MAINTENANCE",
      steps: [
        "Apply a quality hardwood decking oil within 2 weeks of installation.",
        "Re-oil every 6-12 months depending on sun exposure and foot traffic.",
        "Hardwood will silver naturally if left untreated — this is cosmetic only.",
        "Use stainless steel screws (316 marine grade) to prevent black staining.",
        "Sand lightly with 120-grit before re-oiling for best absorption.",
      ],
    });
  } else {
    // Pine / treated softwood
    sections.push({
      title: "FINISHING & MAINTENANCE",
      steps: [
        "Allow new CCA-treated timber to dry for 4-6 weeks before staining.",
        "Apply a quality exterior deck stain or wood preservative.",
        "Recoat every 2-3 years for optimal UV and weather protection.",
        "Re-tighten all screws after the first season (timber shrinkage is normal).",
        "Do not sand off the green CCA surface layer — it provides rot protection.",
        "Check for any popped nails or loose boards annually.",
      ],
    });
  }

  sections.push({
    title: "IMPORTANT NOTES",
    steps: [
      "All timber dimensions are nominal — actual sizes may vary by 1-2mm.",
      "Store timber flat and covered on-site until installation.",
      "Allow boards to acclimatise to the site for 48 hours before installation.",
      "Wear appropriate PPE: gloves, safety glasses, hearing protection for power tools.",
      "Ensure compliance with local building regulations and HOA requirements.",
    ],
  });

  return sections;
}

export function renderInstallationNotesPage(doc: jsPDF, input: BuildPlanInput) {
  drawPageHeader(doc, "Installation Notes");

  const materialSlug = input.options.materials.find(
    (m) => m.id === input.state.material_type_id
  )?.slug ?? "";

  const joists = input.layout.joists;
  const bearers = input.layout.bearers;
  const joistSpacing = joists.length >= 2 ? Math.round(Math.abs(joists[1].x - joists[0].x)) : 400;
  const bearerSpacing = bearers.length >= 2 ? Math.round(Math.abs(bearers[1].y - bearers[0].y)) : 1200;

  const sections = getInstallationSections(materialSlug, joistSpacing, bearerSpacing);

  let y = 33;
  const pageH = doc.internal.pageSize.getHeight();

  for (const section of sections) {
    // Check if we need a new page
    const sectionHeight = 10 + section.steps.length * 6;
    if (y + sectionHeight > pageH - 20) {
      doc.addPage();
      drawPageHeader(doc, "Installation Notes (cont.)");
      y = 33;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.ember);
    doc.text(section.title, 15, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.ironwood);

    for (const step of section.steps) {
      // Wrap long lines
      const lines = doc.splitTextToSize(`•  ${step}`, 170);
      for (const line of lines) {
        if (y > pageH - 20) {
          doc.addPage();
          drawPageHeader(doc, "Installation Notes (cont.)");
          y = 33;
        }
        doc.text(line, 17, y);
        y += 5;
      }
      y += 1;
    }

    y += 5;
  }
}
