import type { Issue } from '@nexora/schemas';
import { seqId } from '@nexora/core';
import { snapshotDom } from '@nexora/vision';

export interface FunctionalExpectation { id: string; description: string; check: (html: string) => boolean; severity: Issue['severity']; fix: string; }

/** Expectativas funcionales derivadas del brief/intent (plan §36). */
export function expectationsFor(features: string[], primaryAction: string): FunctionalExpectation[] {
  const list: FunctionalExpectation[] = [
    { id: 'FN-TITLE', description: 'La página tiene <title> no vacío', severity: 'high',
      check: (h) => Boolean(snapshotDom(h).title?.trim()), fix: 'Añadir un <title> descriptivo.' },
    { id: 'FN-CTA', description: `Existe la acción principal: "${primaryAction}"`, severity: 'critical',
      check: (h) => new RegExp(primaryAction.split(' ')[0], 'i').test(h) || /href="(https:\/\/wa\.me|tel:|mailto:|#contact)/.test(h),
      fix: 'Añadir un botón visible con la acción principal.' },
    { id: 'FN-NAV', description: 'Existe navegación', severity: 'medium',
      check: (h) => /<nav[\s>]/i.test(h), fix: 'Añadir <nav> con los enlaces principales.' },
    { id: 'FN-FOOTER', description: 'Existe footer con información de contacto', severity: 'low',
      check: (h) => /<footer[\s>]/i.test(h), fix: 'Añadir <footer>.' },
    { id: 'FN-LINKS', description: 'No hay enlaces vacíos (href="#" sin función)', severity: 'medium',
      check: (h) => (h.match(/href="#"/g) ?? []).length <= 1, fix: 'Sustituir href="#" por destinos reales o botones.' },
  ];
  if (features.includes('whatsapp')) list.push({ id: 'FN-WA', description: 'Enlace de WhatsApp funcional', severity: 'high',
    check: (h) => /https:\/\/wa\.me\/\d+/.test(h), fix: 'Usar https://wa.me/<número> con mensaje prellenado.' });
  if (features.includes('menu')) list.push({ id: 'FN-MENU', description: 'Sección de menú con productos y precios', severity: 'high',
    check: (h) => /id="menu"/.test(h) && /[€$]\s?\d/.test(h), fix: 'Añadir sección #menu con precios.' });
  if (features.includes('pricing')) list.push({ id: 'FN-PRICING', description: 'Tabla de precios con planes', severity: 'high',
    check: (h) => /id="pricing"/.test(h) && /[€$]\s?\d/.test(h), fix: 'Añadir sección #pricing con al menos dos planes.' });
  if (features.includes('contact')) list.push({ id: 'FN-CONTACT', description: 'Formulario o datos de contacto', severity: 'medium',
    check: (h) => /<form[\s>]/i.test(h) || /mailto:|tel:/.test(h), fix: 'Añadir formulario o datos de contacto directos.' });
  return list;
}

export function functionalQa(html: string, expectations: FunctionalExpectation[]): Issue[] {
  const issues: Issue[] = [];
  let n = 0;
  for (const e of expectations) {
    if (e.check(html)) continue;
    issues.push({
      id: seqId('FQA', ++n), category: 'Interaction', title: `Requisito no cumplido: ${e.description}`,
      severity: e.severity, location: 'index.html', suggestedFix: e.fix, status: 'open',
      evidence: [{ kind: 'test', ref: e.id, detail: 'check estático fallido' }],
    });
  }
  return issues;
}
