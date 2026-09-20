/** Cálculo WCAG real: usado por Accessibility QA (plan §56). */
export function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

export function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = hexToRgb(fg), b = hexToRgb(bg);
  if (!a || !b) return null;
  const l1 = relativeLuminance(a), l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
}

export function meetsAA(ratio: number, largeText = false): boolean { return ratio >= (largeText ? 3 : 4.5); }
export function meetsAAA(ratio: number, largeText = false): boolean { return ratio >= (largeText ? 4.5 : 7); }
