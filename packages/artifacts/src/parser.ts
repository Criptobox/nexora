import type { ArtifactFile } from '@nexora/schemas';

/**
 * Parser de artifacts en la salida del modelo. INSPIRE (no copia) del enfoque
 * artifact-first de OpenDesign/Claude Design — ver FEATURE-MATRIX.
 *
 * Formato soportado:
 *   ```file:src/index.html
 *   <!doctype html> ...
 *   ```
 * y bloques <nexora-file path="...">...</nexora-file>
 */
export function parseArtifactFiles(raw: string): ArtifactFile[] {
  const files: ArtifactFile[] = [];

  const fence = /```(?:file:)?([\w./@-]+\.[a-z0-9]+)\n([\s\S]*?)```/gi;
  for (const m of raw.matchAll(fence)) files.push({ path: normalize(m[1]), contents: m[2].replace(/\s*$/, '\n') });

  const tag = /<nexora-file\s+path="([^"]+)"\s*>\n?([\s\S]*?)<\/nexora-file>/gi;
  for (const m of raw.matchAll(tag)) files.push({ path: normalize(m[1]), contents: m[2].replace(/\s*$/, '\n') });

  // Fallback: documento HTML suelto.
  if (!files.length) {
    const html = raw.match(/<!doctype html>[\s\S]*<\/html>/i);
    if (html) files.push({ path: 'index.html', contents: html[0] + '\n' });
  }
  return dedupe(files);
}

function normalize(p: string): string {
  return p.replace(/^\.?\//, '').replace(/\\/g, '/').replace(/\.\.\//g, '');
}
function dedupe(files: ArtifactFile[]): ArtifactFile[] {
  const map = new Map<string, ArtifactFile>();
  for (const f of files) map.set(f.path, f); // la última definición gana
  return [...map.values()];
}
