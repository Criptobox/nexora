import type { DesignSystem, Issue } from '@nexora/schemas';
import { seqId } from '@nexora/core';
import { snapshotDom, type DomSnapshot } from './dom.js';
import { contrastRatio, meetsAA } from './contrast.js';
import type { BrowserObservation } from './browser.js';

/** Plan §24/§25 — comparar lo observado con DESIGN.md y producir issues con evidencia. */
export interface VisionInput {
  html: string;
  css: string;
  designSystem?: DesignSystem;
  observations?: BrowserObservation[];
}

export interface VisionReport {
  snapshot: DomSnapshot;
  issues: Issue[];
  scores: Record<string, number>;
  observedWithBrowser: boolean;
}

export function analyzeVisual(input: VisionInput): VisionReport {
  const snapshot = snapshotDom(input.html);
  const issues: Issue[] = [];
  let n = 0;
  const add = (i: Omit<Issue, 'id' | 'status'>) => issues.push({ ...i, id: seqId('VQA', ++n), status: 'open' });

  // Hierarchy
  const h1 = snapshot.headings.filter((h) => h.level === 1);
  if (h1.length !== 1) {
    add({ category: 'Hierarchy', title: h1.length ? 'Múltiples H1 en la página' : 'Falta el H1 principal',
      severity: 'high', location: 'document', suggestedFix: 'Mantener exactamente un H1 que exprese la propuesta de valor.',
      evidence: [{ kind: 'file', ref: 'index.html', detail: `h1 count = ${h1.length}` }] });
  }
  const jumps = snapshot.headings.slice(1).filter((h, i) => h.level - snapshot.headings[i].level > 1);
  if (jumps.length) {
    add({ category: 'Hierarchy', title: 'Saltos de nivel en encabezados', severity: 'medium', location: 'document',
      suggestedFix: 'No saltar de h2 a h4; mantener la secuencia.',
      evidence: [{ kind: 'file', ref: 'index.html', detail: `${jumps.length} saltos` }] });
  }

  // Accessibility
  const noAlt = snapshot.images.filter((i) => i.attrs.alt === undefined);
  if (noAlt.length) {
    add({ category: 'Accessibility', title: 'Imágenes sin atributo alt', severity: 'high', location: 'img',
      suggestedFix: 'Añadir alt descriptivo, o alt="" si la imagen es decorativa.',
      evidence: [{ kind: 'file', ref: 'index.html', detail: `${noAlt.length} imágenes` }] });
  }
  if (!snapshot.lang) {
    add({ category: 'Accessibility', title: 'El elemento <html> no declara idioma', severity: 'medium', location: 'html',
      suggestedFix: 'Añadir lang="es" (o el idioma real del contenido).', evidence: [{ kind: 'file', ref: 'index.html' }] });
  }
  if (!snapshot.landmarks.includes('main')) {
    add({ category: 'Accessibility', title: 'Falta landmark <main>', severity: 'medium', location: 'body',
      suggestedFix: 'Envolver el contenido principal en <main>.', evidence: [{ kind: 'file', ref: 'index.html' }] });
  }
  const emptyLinks = snapshot.links.filter((l) => !l.text && !l.attrs['aria-label']);
  if (emptyLinks.length) {
    add({ category: 'Accessibility', title: 'Enlaces sin nombre accesible', severity: 'high', location: 'a',
      suggestedFix: 'Añadir texto visible o aria-label.',
      evidence: [{ kind: 'file', ref: 'index.html', detail: `${emptyLinks.length} enlaces` }] });
  }

  // Color / contraste contra el design system
  if (input.designSystem) {
    const { ink, bg, muted, surface, accent } = input.designSystem.color as Record<string, string>;
    const pairs: Array<[string, string, string]> = [
      ['texto principal', ink, bg], ['texto secundario', muted, bg], ['texto sobre superficie', ink, surface],
      ['acento sobre fondo', accent, bg],
    ];
    for (const [label, fg, background] of pairs) {
      if (!fg || !background) continue;
      const ratio = contrastRatio(fg, background);
      if (ratio !== null && !meetsAA(ratio, label === 'acento sobre fondo')) {
        add({ category: 'Color', title: `Contraste insuficiente: ${label} (${ratio}:1)`, severity: ratio < 3 ? 'high' : 'medium',
          location: 'design tokens', suggestedFix: `Ajustar los tokens para alcanzar al menos ${label === 'acento sobre fondo' ? '3' : '4.5'}:1.`,
          evidence: [{ kind: 'metric', ref: `${fg} sobre ${background}`, detail: `ratio ${ratio}` }] });
      }
    }
  }

  // Responsive
  if (!snapshot.hasViewport) {
    add({ category: 'Responsive', title: 'Falta la meta viewport', severity: 'critical', location: 'head',
      suggestedFix: 'Añadir <meta name="viewport" content="width=device-width, initial-scale=1">.',
      evidence: [{ kind: 'file', ref: 'index.html' }] });
  }
  if (!/@media/.test(input.css)) {
    add({ category: 'Responsive', title: 'CSS sin media queries', severity: 'high', location: 'styles.css',
      suggestedFix: 'Definir breakpoints y reflow real del layout.', evidence: [{ kind: 'file', ref: 'styles.css' }] });
  }

  // Observaciones reales de navegador
  for (const obs of input.observations ?? []) {
    if (!obs.available) continue;
    if (obs.overflowX) {
      add({ category: 'Responsive', title: `Scroll horizontal en ${obs.viewport.name}`, severity: 'high',
        location: `${obs.viewport.width}x${obs.viewport.height}`, suggestedFix: 'Revisar anchos fijos y overflow de contenedores.',
        evidence: [{ kind: 'browser', ref: obs.url, detail: `overflowX en ${obs.viewport.name}` },
                   ...(obs.screenshotPath ? [{ kind: 'screenshot' as const, ref: obs.screenshotPath }] : [])] });
    }
    if (obs.consoleErrors.length) {
      add({ category: 'Runtime', title: `Errores de consola (${obs.consoleErrors.length})`, severity: 'critical',
        location: obs.url, suggestedFix: 'Corregir los errores de JavaScript antes de entregar.',
        evidence: obs.consoleErrors.slice(0, 5).map((e) => ({ kind: 'browser' as const, ref: obs.url, detail: e })) });
    }
    if (obs.smallTapTargets > 0) {
      add({ category: 'Accessibility', title: `${obs.smallTapTargets} áreas táctiles menores de 44px`, severity: 'medium',
        location: obs.viewport.name, suggestedFix: 'Aumentar padding de los controles interactivos.',
        evidence: [{ kind: 'browser', ref: obs.url, detail: `${obs.smallTapTargets} elementos` }] });
    }
    if (obs.failedRequests.length) {
      add({ category: 'Runtime', title: `Peticiones fallidas (${obs.failedRequests.length})`, severity: 'medium',
        location: obs.url, suggestedFix: 'Corregir rutas rotas de assets.',
        evidence: obs.failedRequests.slice(0, 5).map((r) => ({ kind: 'browser' as const, ref: r })) });
    }
  }

  const categories = ['Hierarchy','Composition','Typography','Spacing','Color','Consistency','Responsive','Accessibility','Interaction','Brand alignment'];
  const scores: Record<string, number> = {};
  for (const c of categories) {
    const penalty = issues.filter((i) => i.category === c)
      .reduce((a, i) => a + ({ low: 5, medium: 12, high: 22, critical: 35 }[i.severity]), 0);
    scores[c] = Math.max(0, 100 - penalty);
  }
  scores.overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / categories.length);

  return { snapshot, issues, scores, observedWithBrowser: (input.observations ?? []).some((o) => o.available) };
}
