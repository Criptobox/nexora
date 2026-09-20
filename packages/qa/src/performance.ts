import type { Issue } from '@nexora/schemas';
import { seqId } from '@nexora/core';

/** Plan §57 — presupuesto de performance estático (sin ejecutar Lighthouse). */
export interface PerfBudget { maxHtmlKb: number; maxCssKb: number; maxJsKb: number; maxRequests: number; maxImageKb: number; }
export const DEFAULT_BUDGET: PerfBudget = { maxHtmlKb: 120, maxCssKb: 90, maxJsKb: 150, maxRequests: 25, maxImageKb: 400 };

export function performanceQa(files: Array<{ path: string; contents: string }>, budget: PerfBudget = DEFAULT_BUDGET): Issue[] {
  const issues: Issue[] = [];
  let n = 0;
  const kb = (s: string) => Buffer.byteLength(s, 'utf8') / 1024;
  const add = (title: string, severity: Issue['severity'], location: string, fix: string, detail: string) =>
    issues.push({ id: seqId('PERF', ++n), category: 'Performance', title, severity, location, suggestedFix: fix, status: 'open',
      evidence: [{ kind: 'metric', ref: location, detail }] });

  for (const f of files) {
    const size = kb(f.contents);
    if (/\.html?$/.test(f.path) && size > budget.maxHtmlKb) add(`HTML pesado (${size.toFixed(1)}kB)`, 'medium', f.path, 'Dividir contenido o diferir bloques no críticos.', `${size.toFixed(1)}kB`);
    if (/\.css$/.test(f.path) && size > budget.maxCssKb) add(`CSS pesado (${size.toFixed(1)}kB)`, 'medium', f.path, 'Eliminar reglas no usadas y consolidar tokens.', `${size.toFixed(1)}kB`);
    if (/\.js$/.test(f.path) && size > budget.maxJsKb) add(`JS pesado (${size.toFixed(1)}kB)`, 'medium', f.path, 'Cargar de forma diferida lo no crítico.', `${size.toFixed(1)}kB`);
  }
  const html = files.filter((f) => /\.html?$/.test(f.path)).map((f) => f.contents).join('\n');
  const external = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  if (external.length > budget.maxRequests) add(`Demasiadas peticiones externas (${external.length})`, 'medium', 'index.html', 'Autoalojar fuentes y reducir dependencias de terceros.', `${external.length} requests`);
  const imgs = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  const noLazy = imgs.filter((i) => !/loading="lazy"/.test(i));
  if (noLazy.length > 2) add(`${noLazy.length} imágenes sin loading="lazy"`, 'low', 'index.html', 'Añadir loading="lazy" salvo en la imagen del hero.', `${noLazy.length}`);
  const noDims = imgs.filter((i) => !/width=/.test(i) || !/height=/.test(i));
  if (noDims.length) add(`${noDims.length} imágenes sin dimensiones (riesgo de CLS)`, 'medium', 'index.html', 'Declarar width/height o aspect-ratio.', `${noDims.length}`);
  return issues;
}
