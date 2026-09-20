export interface DesignTokens {
  color: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  motion: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndex: Record<string, string>;
}

export interface DesignDirection {
  id: string;
  name: string;
  rationale: string;
  palette: Record<string, string>;
  typography: { display: string; body: string; scale: string };
  layout: string;
  imagery: string;
  motion: string;
  components: string[];
  tone: string;
  references: string[];
}

/** Estructura de DESIGN.md (plan §17): 14 secciones legibles por humanos y agentes. */
export interface DesignSystem {
  identity: string;
  brand: string;
  color: Record<string, string>;
  typography: { display: string; body: string; scale: string; rules: string[] };
  spacing: Record<string, string>;
  layout: string[];
  components: string[];
  motion: string[];
  voice: string[];
  antiPatterns: string[];
  accessibility: string[];
  responsive: string[];
  references: string[];
  decisions: string[];
  tokens: DesignTokens;
}
