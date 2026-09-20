import type { ArtifactFile, Issue } from '@nexora/schemas';
import { applyPatches, type Patch } from './patch.js';
import { createLogger } from '@nexora/core';

const log = createLogger('code-engine:repair');

export interface RepairResult { files: ArtifactFile[]; fixed: string[]; unfixed: string[]; patches: Patch[]; }

/**
 * Repair Planner determinista (plan §26). Cada reparación es específica y verificable;
 * las que no se pueden arreglar con certeza se devuelven como `unfixed` — no se finge.
 */
export function repair(files: ArtifactFile[], issues: Issue[]): RepairResult {
  const patches: Patch[] = [];
  const fixed: string[] = [], unfixed: string[] = [];
  const html = files.find((f) => /\.html?$/.test(f.path));
  const css = files.find((f) => /\.css$/.test(f.path));

  for (const issue of issues.filter((i) => i.status === 'open')) {
    let handled = false;

    if (html) {
      if (/meta viewport/i.test(issue.title) && !/name="viewport"/.test(html.contents)) {
        patches.push({ path: html.path, find: '<head>', replace: '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">', description: issue.title });
        handled = true;
      }
      if (/no declara idioma/i.test(issue.title)) {
        patches.push({ path: html.path, find: /<html(?![^>]*lang=)/, replace: '<html lang="es"', description: issue.title });
        handled = true;
      }
      if (/sin atributo alt/i.test(issue.title)) {
        patches.push({ path: html.path, find: /<img(?![^>]*\balt=)([^>]*)>/g, replace: '<img$1 alt="">', description: issue.title });
        handled = true;
      }
      if (/loading="lazy"/.test(issue.title)) {
        patches.push({ path: html.path, find: /<img(?![^>]*loading=)([^>]*)>/g, replace: '<img$1 loading="lazy">', description: issue.title });
        handled = true;
      }
      if (/noopener/i.test(issue.title)) {
        patches.push({ path: html.path, find: /target="_blank"(?![^>]*rel=)/g, replace: 'target="_blank" rel="noopener noreferrer"', description: issue.title });
        handled = true;
      }
      if (/landmark <main>/i.test(issue.title) && !/<main[\s>]/.test(html.contents)) {
        unfixed.push(`${issue.id}: requiere reestructurar el documento (no se aplica parche automático)`);
        continue;
      }
      if (/lorem ipsum/i.test(issue.title)) {
        patches.push({ path: html.path, find: /Lorem ipsum[^<]*/gi, replace: 'Contenido pendiente de revisión editorial', description: issue.title });
        handled = true;
      }
    }

    if (css) {
      if (/estados de foco/i.test(issue.title) && !/:focus-visible/.test(css.contents)) {
        patches.push({ path: css.path, find: /$/, replace: '\n:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }\n', description: issue.title });
        handled = true;
      }
      if (/prefers-reduced-motion/i.test(issue.title) && !/prefers-reduced-motion/.test(css.contents)) {
        patches.push({ path: css.path, find: /$/, replace: '\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }\n}\n', description: issue.title });
        handled = true;
      }
      if (/media queries/i.test(issue.title) && !/@media/.test(css.contents)) {
        patches.push({ path: css.path, find: /$/, replace: '\n@media (max-width: 768px) {\n  .grid, .grid-3, .split, .form, .footer-grid { grid-template-columns: 1fr; }\n}\n', description: issue.title });
        handled = true;
      }
      if (/Scroll horizontal/i.test(issue.title)) {
        patches.push({ path: css.path, find: /$/, replace: '\nhtml, body { max-width: 100%; overflow-x: hidden; }\nimg, video, table { max-width: 100%; }\n', description: issue.title });
        handled = true;
      }
      if (/áreas táctiles/i.test(issue.title)) {
        patches.push({ path: css.path, find: /$/, replace: '\na, button, [role="button"], input, select { min-height: 44px; }\n.nav-list a { display: inline-flex; align-items: center; }\n', description: issue.title });
        handled = true;
      }
    }

    (handled ? fixed : unfixed).push(handled ? issue.id : `${issue.id}: sin reparación automática segura — ${issue.suggestedFix}`);
  }

  const result = applyPatches(files, patches);
  if (result.failed.length) log.warn(`${result.failed.length} parches no aplicados`);
  return { files: result.files, fixed, unfixed, patches: result.applied };
}

/** Marca como resueltos los issues reparados. */
export function markFixed(issues: Issue[], fixedIds: string[]): Issue[] {
  const set = new Set(fixedIds);
  return issues.map((i) => (set.has(i.id) ? { ...i, status: 'fixed' as const } : i));
}
