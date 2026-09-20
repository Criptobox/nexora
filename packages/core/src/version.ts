export const NEXORA_VERSION = '0.1.4';
export function bump(version: string, kind: 'major' | 'minor' | 'patch'): string {
  const [ma, mi, pa] = version.split('.').map((n) => Number(n) || 0);
  if (kind === 'major') return `${ma + 1}.0.0`;
  if (kind === 'minor') return `${ma}.${mi + 1}.0`;
  return `${ma}.${mi}.${pa + 1}`;
}
export function compare(a: string, b: string): number {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0); }
  return 0;
}
