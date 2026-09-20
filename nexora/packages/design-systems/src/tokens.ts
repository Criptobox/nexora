import type { DesignTokens } from '@nexora/schemas';

export const EMPTY_TOKENS: DesignTokens = {
  color: {}, typography: {}, spacing: {}, radius: {}, shadow: {}, motion: {}, breakpoints: {}, zIndex: {},
};

export const BASE_TOKENS: DesignTokens = {
  color: {},
  typography: {
    'font-display': "'Space Grotesk', system-ui, sans-serif",
    'font-body': "'Inter', system-ui, sans-serif",
    'size-xs': '0.8125rem', 'size-sm': '0.9375rem', 'size-md': '1.0625rem',
    'size-lg': '1.375rem', 'size-xl': '2rem', 'size-2xl': '2.75rem', 'size-3xl': '4rem',
    'leading-tight': '1.05', 'leading-normal': '1.6', 'tracking-tight': '-0.02em',
  },
  spacing: { '1': '4px', '2': '8px', '3': '12px', '4': '16px', '5': '24px', '6': '32px', '7': '48px', '8': '64px', '9': '96px', '10': '128px' },
  radius: { none: '0', sm: '6px', md: '10px', lg: '18px', pill: '999px' },
  shadow: { sm: '0 1px 2px rgba(0,0,0,.08)', md: '0 8px 24px rgba(0,0,0,.10)', lg: '0 24px 60px rgba(0,0,0,.18)' },
  motion: { 'duration-fast': '140ms', 'duration-base': '240ms', 'duration-slow': '520ms', 'ease-out': 'cubic-bezier(.16,1,.3,1)', 'ease-in-out': 'cubic-bezier(.65,0,.35,1)' },
  breakpoints: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
  zIndex: { base: '0', sticky: '100', overlay: '200', modal: '300', toast: '400' },
};

export function mergeTokens(base: DesignTokens, override: Partial<DesignTokens>): DesignTokens {
  const out: DesignTokens = { ...EMPTY_TOKENS };
  for (const key of Object.keys(base) as (keyof DesignTokens)[]) {
    out[key] = { ...base[key], ...(override[key] ?? {}) };
  }
  return out;
}

/** Los tokens alimentan el código: nunca valores inventados por componente (plan §18). */
export function tokensToCss(tokens: DesignTokens, selector = ':root'): string {
  const lines: string[] = [`${selector} {`];
  const groups: Array<[keyof DesignTokens, string]> = [
    ['color', 'color'], ['typography', 'font'], ['spacing', 'space'], ['radius', 'radius'],
    ['shadow', 'shadow'], ['motion', 'motion'], ['breakpoints', 'bp'], ['zIndex', 'z'],
  ];
  for (const [group, prefix] of groups) {
    const entries = Object.entries(tokens[group]);
    if (!entries.length) continue;
    lines.push(`  /* ${group} */`);
    for (const [k, v] of entries) {
      const name = k.startsWith(prefix) ? k : `${prefix}-${k}`;
      lines.push(`  --${name}: ${v};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

export function tokensToJson(tokens: DesignTokens): string { return JSON.stringify(tokens, null, 2) + '\n'; }

/** Devuelve tokens usados en un CSS que no existen en el sistema (detección de deriva). */
export function findUndeclaredTokens(css: string, tokens: DesignTokens): string[] {
  const declared = new Set<string>();
  for (const group of Object.keys(tokens) as (keyof DesignTokens)[]) {
    const prefix = { color: 'color', typography: 'font', spacing: 'space', radius: 'radius', shadow: 'shadow', motion: 'motion', breakpoints: 'bp', zIndex: 'z' }[group];
    for (const k of Object.keys(tokens[group])) declared.add(k.startsWith(prefix) ? k : `${prefix}-${k}`);
  }
  const used = new Set([...css.matchAll(/var\(--([\w-]+)/g)].map((m) => m[1]));
  return [...used].filter((u) => !declared.has(u));
}
