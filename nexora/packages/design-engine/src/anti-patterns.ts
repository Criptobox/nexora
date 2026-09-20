import type { DesignSystem, Issue } from '@nexora/schemas';
import { seqId } from '@nexora/core';

/** Plan §19 — Anti-pattern Engine sobre el HTML/CSS generado. */
export interface AntiPatternRule {
  id: string;
  title: string;
  category: Issue['category'];
  severity: Issue['severity'];
  detect: (html: string, css: string, ds?: DesignSystem) => { hit: boolean; detail?: string };
  fix: string;
}

const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

export const ANTI_PATTERN_RULES: AntiPatternRule[] = [
  {
    id: 'AP-GRADIENT-OVERLOAD', title: 'Exceso de gradientes decorativos', category: 'Color', severity: 'medium',
    detect: (_h, css) => { const n = count(css, /linear-gradient|radial-gradient/g); return { hit: n > 6, detail: `${n} gradientes` }; },
    fix: 'Reducir a un gradiente de marca como máximo por vista; usar color plano en superficies.',
  },
  {
    id: 'AP-SHADOW-OVERLOAD', title: 'Exceso de sombras', category: 'Consistency', severity: 'low',
    detect: (_h, css) => { const n = count(css, /box-shadow\s*:/g); return { hit: n > 10, detail: `${n} box-shadow` }; },
    fix: 'Definir 3 niveles de elevación en tokens y usar solo esos.',
  },
  {
    id: 'AP-WEAK-HIERARCHY', title: 'Jerarquía tipográfica débil', category: 'Hierarchy', severity: 'high',
    detect: (html) => {
      const h1 = count(html, /<h1[\s>]/g); const h2 = count(html, /<h2[\s>]/g);
      if (h1 === 0) return { hit: true, detail: 'no hay <h1>' };
      if (h1 > 1) return { hit: true, detail: `${h1} elementos <h1>` };
      if (h2 === 0 && html.length > 4000) return { hit: true, detail: 'documento largo sin <h2>' };
      return { hit: false };
    },
    fix: 'Exactamente un <h1> por página y subtítulos jerárquicos con <h2>/<h3>.',
  },
  {
    id: 'AP-CARD-SOUP', title: 'Cards innecesarias / repetición de patrón', category: 'Composition', severity: 'medium',
    detect: (html) => { const n = count(html, /class="[^"]*\bcard\b/g); return { hit: n > 14, detail: `${n} cards` }; },
    fix: 'Alternar composiciones: listas, bloques editoriales, tablas. No convertir todo en tarjeta.',
  },
  {
    id: 'AP-LOREM', title: 'Contenido artificial sin marcar', category: 'Brand alignment', severity: 'high',
    detect: (html) => ({ hit: /lorem ipsum/i.test(html), detail: 'lorem ipsum presente' }),
    fix: 'Sustituir por contenido plausible del dominio y marcar placeholders con data-placeholder.',
  },
  {
    id: 'AP-BUTTON-PRIORITY', title: 'Botones sin prioridad clara', category: 'Interaction', severity: 'medium',
    detect: (html) => { const n = count(html, /class="[^"]*btn-primary/g); return { hit: n > 4, detail: `${n} botones primarios` }; },
    fix: 'Un primario por sección; el resto secundario o enlace de texto.',
  },
  {
    id: 'AP-NO-FOCUS', title: 'Sin estados de foco visibles', category: 'Accessibility', severity: 'high',
    detect: (_h, css) => ({ hit: !/:focus-visible|:focus\b/.test(css), detail: 'sin reglas :focus' }),
    fix: 'Añadir :focus-visible con outline de 2px y offset.',
  },
  {
    id: 'AP-NO-REDUCED-MOTION', title: 'Animaciones sin prefers-reduced-motion', category: 'Accessibility', severity: 'medium',
    detect: (_h, css) => ({ hit: /@keyframes|transition\s*:/.test(css) && !/prefers-reduced-motion/.test(css) }),
    fix: 'Añadir @media (prefers-reduced-motion: reduce) desactivando animaciones no esenciales.',
  },
  {
    id: 'AP-NO-RESPONSIVE', title: 'Mobile roto o sin media queries', category: 'Responsive', severity: 'critical',
    detect: (html, css) => ({ hit: !/@media/.test(css) || !/name="viewport"/.test(html) }),
    fix: 'Añadir meta viewport y al menos breakpoints md/lg con reflow real del layout.',
  },
  {
    id: 'AP-SPACING-DRIFT', title: 'Spacing inconsistente (valores mágicos)', category: 'Spacing', severity: 'medium',
    detect: (_h, css) => {
      const values = [...css.matchAll(/(?:padding|margin|gap)\s*:\s*([^;]+);/g)].flatMap((m) => m[1].split(/\s+/));
      const px = values.filter((v) => /^\d+px$/.test(v)).map((v) => parseInt(v, 10));
      const offGrid = px.filter((v) => v % 4 !== 0);
      return { hit: offGrid.length > 6, detail: `${offGrid.length} valores fuera de la rejilla de 4px` };
    },
    fix: 'Usar var(--space-*) en lugar de píxeles arbitrarios.',
  },
  {
    id: 'AP-GENERIC-DESIGN', title: 'Diseño genérico (plantilla sin identidad)', category: 'Brand alignment', severity: 'medium',
    detect: (html, css, ds) => {
      if (!ds) return { hit: false };
      const accent = ds.color.accent?.toLowerCase();
      const usesAccent = accent ? css.toLowerCase().includes(accent) || css.includes('--color-accent') : true;
      return { hit: !usesAccent, detail: 'el acento de marca no aparece en el CSS' };
    },
    fix: 'Aplicar el color de acento del sistema en la acción principal y en detalles de marca.',
  },
  {
    id: 'AP-TEXT-ON-IMAGE', title: 'Texto sobre imagen sin capa de contraste', category: 'Color', severity: 'medium',
    detect: (html, css) => ({ hit: /background-image\s*:\s*url/.test(css) && !/(overlay|::before|rgba\(0,\s*0,\s*0)/.test(css) }),
    fix: 'Añadir overlay con rgba o gradiente oscuro bajo el texto.',
  },
];

export function detectAntiPatterns(html: string, css: string, ds?: DesignSystem): Issue[] {
  const issues: Issue[] = [];
  let n = 0;
  for (const rule of ANTI_PATTERN_RULES) {
    const r = rule.detect(html, css, ds);
    if (!r.hit) continue;
    issues.push({
      id: seqId('AP', ++n), category: rule.category, title: rule.title, severity: rule.severity,
      location: 'documento', suggestedFix: rule.fix, status: 'open',
      evidence: [{ kind: 'file', ref: 'index.html', detail: r.detail ?? rule.id }],
    });
  }
  return issues;
}
