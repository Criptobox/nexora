export function slugify(input: string, maxLen = 48): string {
  const s = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return (s || 'project').slice(0, maxLen).replace(/-+$/,'');
}
export function titleCase(input: string): string {
  const MINOR = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'al', 'en', 'a']);
  return input
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && MINOR.has(w.toLowerCase()))
      ? w.toLowerCase()
      : w[0].toLocaleUpperCase('es') + w.slice(1).toLocaleLowerCase('es'))
    .join(' ');
}
