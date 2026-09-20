import type { Intent } from './intent.js';

/** Plan §21 — preguntar SOLO lo que cambia el resultado. */
export interface DiscoveryQuestion {
  id: string;
  question: string;
  options: string[];
  allowFreeText: boolean;
  impact: 'high' | 'medium' | 'low';
  assumptionIfSkipped: string;
}

export interface DiscoveryPlan {
  questions: DiscoveryQuestion[];
  assumptions: Array<{ field: string; value: string; reason: string }>;
}

const CATALOG: Record<string, Omit<DiscoveryQuestion, 'id'>> = {
  brand: {
    question: '¿Tienes identidad visual ya definida (logo, colores, tipografía)?',
    options: ['Sí, la aporto yo', 'Tengo logo pero nada más', 'No, créala tú'],
    allowFreeText: true, impact: 'high',
    assumptionIfSkipped: 'Se genera una identidad nueva coherente con la dirección elegida.',
  },
  audience: {
    question: '¿Quién es el cliente principal?',
    options: ['Público local', 'Turistas / visitantes', 'Empresas (B2B)', 'Público joven'],
    allowFreeText: true, impact: 'high',
    assumptionIfSkipped: 'Se asume público general adulto con uso mayoritariamente móvil.',
  },
  content: {
    question: '¿Tienes contenido real (textos, fotos, precios) o lo marcamos como placeholder?',
    options: ['Tengo contenido', 'Solo algunas fotos', 'Nada todavía'],
    allowFreeText: true, impact: 'medium',
    assumptionIfSkipped: 'Se genera contenido plausible y se marca explícitamente como placeholder.',
  },
  location: {
    question: '¿Dónde está el negocio? (afecta idioma, moneda y mapa)',
    options: ['No aplica / online', 'Lo indico yo'],
    allowFreeText: true, impact: 'medium',
    assumptionIfSkipped: 'Se omite mapa y se usa un formato de contacto neutro.',
  },
  action: {
    question: '¿Cuál es la acción principal que debe hacer el visitante?',
    options: ['Pedir por WhatsApp', 'Reservar', 'Comprar', 'Contactar'],
    allowFreeText: true, impact: 'high',
    assumptionIfSkipped: 'Se usa la acción inferida del brief.',
  },
};

export function planDiscovery(intent: Intent, autonomy: 'guided' | 'balanced' | 'autonomous' | 'expert' = 'balanced'): DiscoveryPlan {
  const budget = { guided: 5, balanced: 2, autonomous: 0, expert: 3 }[autonomy];
  const ordered = intent.unknowns
    .map((u) => ({ u, def: CATALOG[u] }))
    .filter((x) => x.def)
    .sort((a, b) => (b.def.impact === 'high' ? 1 : 0) - (a.def.impact === 'high' ? 1 : 0));

  const asked = ordered.slice(0, budget);
  const skipped = ordered.slice(budget);

  return {
    questions: asked.map(({ u, def }) => ({ id: u, ...def })),
    assumptions: skipped.map(({ u, def }) => ({ field: u, value: def.assumptionIfSkipped, reason: 'Inferible sin bloquear al usuario (plan §21).' })),
  };
}

export function applyAnswers(intent: Intent, answers: Record<string, string>): Intent {
  const next = { ...intent };
  if (answers.audience) next.audience = answers.audience;
  if (answers.action) next.primaryAction = answers.action;
  if (answers.brand) next.brandGiven = /sí|si|aporto|tengo/i.test(answers.brand);
  next.unknowns = intent.unknowns.filter((u) => !(u in answers));
  next.confidence = Math.min(1, intent.confidence + Object.keys(answers).length * 0.1);
  return next;
}
