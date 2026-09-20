import type { Issue } from '@nexora/schemas';
import { seqId } from '@nexora/core';

/** Chequeos estáticos de código/seguridad sin dependencias externas. */
export function codeQa(files: Array<{ path: string; contents: string }>): Issue[] {
  const issues: Issue[] = [];
  let n = 0;
  const add = (i: Omit<Issue, 'id' | 'status'>) => issues.push({ ...i, id: seqId('CQA', ++n), status: 'open' });

  for (const f of files) {
    if (/\.html?$/.test(f.path)) {
      if (!/<!doctype html>/i.test(f.contents)) {
        add({ category: 'Code', title: `Falta doctype en ${f.path}`, severity: 'medium', location: f.path,
          suggestedFix: 'Añadir <!doctype html> como primera línea.', evidence: [{ kind: 'file', ref: f.path }] });
      }
      const open = (f.contents.match(/<(div|section|main|header|footer|nav|article)\b/g) ?? []).length;
      const close = (f.contents.match(/<\/(div|section|main|header|footer|nav|article)>/g) ?? []).length;
      if (open !== close) {
        add({ category: 'Code', title: `Etiquetas desbalanceadas en ${f.path}`, severity: 'high', location: f.path,
          suggestedFix: 'Revisar apertura/cierre de contenedores.',
          evidence: [{ kind: 'file', ref: f.path, detail: `${open} aperturas vs ${close} cierres` }] });
      }
    }
    if (/(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{8,}/i.test(f.contents)) {
      add({ category: 'Security', title: `Posible secreto embebido en ${f.path}`, severity: 'critical', location: f.path,
        suggestedFix: 'Mover el valor a variables de entorno y rotar la credencial.', evidence: [{ kind: 'file', ref: f.path }] });
    }
    if (/\.(js|ts|html)$/.test(f.path) && /\b(eval\(|new Function\(|innerHTML\s*=\s*[^'"])/.test(f.contents)) {
      add({ category: 'Security', title: `Uso peligroso de eval/innerHTML en ${f.path}`, severity: 'high', location: f.path,
        suggestedFix: 'Sustituir por textContent o parsers seguros.', evidence: [{ kind: 'file', ref: f.path }] });
    }
    if (/http:\/\/(?!localhost|127\.)/.test(f.contents)) {
      add({ category: 'Security', title: `Recurso por HTTP sin cifrar en ${f.path}`, severity: 'medium', location: f.path,
        suggestedFix: 'Usar https:// en todos los recursos externos.', evidence: [{ kind: 'file', ref: f.path }] });
    }
    if (/target="_blank"/.test(f.contents) && !/rel="[^"]*noopener/.test(f.contents)) {
      add({ category: 'Security', title: `target="_blank" sin rel="noopener" en ${f.path}`, severity: 'medium', location: f.path,
        suggestedFix: 'Añadir rel="noopener noreferrer".', evidence: [{ kind: 'file', ref: f.path }] });
    }
  }
  return issues;
}
