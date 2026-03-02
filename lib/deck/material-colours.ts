/**
 * Material-to-colour mapping for 3D deck preview.
 * Returns hex colours for boards, offcuts, joists, and bearers
 * based on the selected material slug and optional finish hex.
 */

const SLUG_COLOUR_MAP: Record<string, string> = {
  "sa-pine-cca":     "#C4A46C",  // warm tan (treated pine)
  "sa-pine":         "#D4B87A",  // natural pine, lighter
  "balau":           "#6B3A2A",  // rich dark brown (hardwood)
  "garapa":          "#B8924A",  // golden honey
  "composite-grey":  "#6B7280",  // slate grey
  "composite-brown": "#8B6F47",  // warm composite
  "composite":       "#6B7280",  // generic composite fallback
};

export interface Material3DColours {
  boardColour: string;
  offcutColour: string;
  joistColour: string;
  bearerColour: string;
}

export function getMaterial3DColours(
  materialSlug: string,
  finishHex: string | null
): Material3DColours {
  // Board colour: finish hex takes priority, then exact slug, then prefix match, then fallback
  const baseBoard =
    finishHex ||
    SLUG_COLOUR_MAP[materialSlug] ||
    Object.entries(SLUG_COLOUR_MAP).find(([prefix]) =>
      materialSlug.startsWith(prefix)
    )?.[1] ||
    "#C4A46C";

  return {
    boardColour: baseBoard,
    offcutColour: "#6AAF6A",  // green (matching 2D convention)
    joistColour: "#6B5B3D",   // medium structural brown
    bearerColour: "#4A3728",  // dark structural brown
  };
}
