/** Plan §54 — Content Intelligence: distinguir y marcar el origen del contenido. */
export type ContentOrigin = 'real' | 'placeholder' | 'ai-generated' | 'user-provided';

export interface ContentBlock { key: string; text: string; origin: ContentOrigin; }

export function markPlaceholders(html: string): string {
  return html.replace(/<([a-z0-9]+)([^>]*)>(\s*)(Lorem ipsum[^<]*)</gi,
    (_m, tag, attrs, ws, text) => `<${tag}${attrs} data-placeholder="true">${ws}${text}<`);
}

export function auditContent(html: string): { placeholders: number; lorem: number; aiGenerated: number } {
  return {
    placeholders: (html.match(/data-placeholder="true"/g) ?? []).length,
    lorem: (html.match(/lorem ipsum/gi) ?? []).length,
    aiGenerated: (html.match(/data-origin="ai-generated"/g) ?? []).length,
  };
}

/** Copy plausible por industria: evita textos genéricos vacíos. */
export function contentSeed(industry: string, name: string, action: string): Record<string, string> {
  const base = {
    heroKicker: 'Abierto todos los días',
    heroTitle: name,
    heroSubtitle: 'Un lugar con carácter propio.',
    cta: action,
    secondaryCta: 'Ver más',
  };
  const byIndustry: Record<string, Partial<typeof base>> = {
    restaurant: { heroKicker: 'Cocina propia · Producto fresco', heroSubtitle: 'Producto de temporada, carta corta y cocina honesta. Reserva en dos toques.' },
    saas: { heroKicker: 'Automatización empresarial', heroSubtitle: 'Conecta tus procesos y elimina el trabajo repetitivo en semanas, no meses.' },
    ecommerce: { heroKicker: 'Envío en 24-48h', heroSubtitle: 'Tecnología seleccionada, garantía real y soporte que responde.' },
    portfolio: { heroKicker: 'Dirección de arte · 3D', heroSubtitle: 'Imágenes que explican productos antes de que existan.' },
    dashboard: { heroKicker: 'Panel operativo', heroSubtitle: 'Todos tus indicadores en una sola vista, actualizados al minuto.' },
  };
  const seed = { ...base, ...(byIndustry[industry] ?? {}) };

  // Especializaciones dentro de una industria: solo se aplican si el brief las nombra.
  // Sin esto, una cafetería heredaría el copy de una hamburguesería (falso concreto).
  const NICHES: Array<[RegExp, Partial<typeof base>]> = [
    [/hamburgue|burger/i, { heroKicker: 'Carne madurada · Pan del día', heroSubtitle: 'Doble carne, pan brioche y punto exacto. Pide en dos toques.' }],
    [/cafeter[íi]a|caf[ée]\b|coffee/i, { heroKicker: 'Tueste propio · Grano de origen', heroSubtitle: 'Café de especialidad, repostería del día y sitio para quedarse.' }],
    [/pizzer[íi]a|pizza/i, { heroKicker: 'Masa madre · Horno de piedra', heroSubtitle: 'Fermentación de 48 horas y producto italiano. Recoge o pide a casa.' }],
    [/sushi|japon[ée]s/i, { heroKicker: 'Pescado fresco · Corte diario', heroSubtitle: 'Barra de sushi con producto de lonja y arroz templado al momento.' }],
    [/panader[íi]a|bakery/i, { heroKicker: 'Horno propio · Masa madre', heroSubtitle: 'Pan de fermentación lenta y bollería hecha cada mañana.' }],
  ];
  for (const [re, patch] of NICHES) {
    if (re.test(name)) return { ...seed, ...patch };
  }
  return seed;
}

/** Contenido de secciones coherente con el nicho del negocio (plan §31: nada de placeholders falsos). */
export interface SectionContent {
  menuTitle: string;
  menuLead: string;
  menuItems: Array<[string, string, string]>;
  reasons: Array<[string, string]>;
  testimonials: Array<[string, string]>;
}

const DEFAULT_SECTIONS: SectionContent = {
  menuTitle: 'Carta',
  menuLead: 'Producto fresco, carta corta y honesta.',
  menuItems: [
    ['Plato de la casa', 'Preparación diaria con producto de temporada.', '12.00'],
    ['Opción de mercado', 'Cambia cada semana según el proveedor.', '13.50'],
    ['Alternativa vegetal', 'Verdura de temporada, legumbre y hierbas frescas.', '10.50'],
  ],
  reasons: [
    ['Producto propio.', 'Elaboración diaria, proveedores locales.'],
    ['Servicio rápido.', 'Pedido confirmado en menos de dos minutos.'],
    ['Espacio cuidado.', 'Sala cómoda, apta para grupos.'],
  ],
  testimonials: [
    ['La mejor relación calidad-precio de la zona.', 'Ana R.'],
    ['Trato cercano y todo puntual.', 'Marcos D.'],
    ['Volvimos tres veces en una semana.', 'Lucía P.'],
  ],
};

const SECTION_NICHES: Array<[RegExp, Partial<SectionContent>]> = [
  [/hamburgue|burger/i, {
    menuTitle: 'Menú',
    menuItems: [
      ['Clásica de la casa', 'Doble carne madurada, cheddar curado, pan brioche.', '8.50'],
      ['Costera', 'Camarón crujiente, alioli de lima, brotes frescos.', '9.90'],
      ['Ahumada', 'Pulled beef, cebolla caramelizada, salsa de whisky.', '10.20'],
      ['Verde', 'Garbanzo especiado, aguacate, yogur de hierbas.', '7.80'],
    ],
    reasons: [
      ['Carne madurada.', 'Picada cada mañana, nunca congelada.'],
      ['Servicio rápido.', 'Pedido confirmado en menos de dos minutos.'],
      ['Espacio con vistas.', 'Terraza frente al agua, apta para grupos.'],
    ],
    testimonials: [
      ['La mejor hamburguesa de la zona, sin discusión.', 'Ana R.'],
      ['Pedí por WhatsApp y llegó en veinte minutos.', 'Marcos D.'],
      ['Volvimos tres veces en una semana.', 'Lucía P.'],
    ],
  }],
  [/cafeter[íi]a|caf[ée]\b|coffee/i, {
    menuTitle: 'Carta',
    menuLead: 'Tueste propio, repostería del día.',
    menuItems: [
      ['Espresso de origen', 'Grano de finca, tueste medio, cuerpo limpio.', '1.80'],
      ['Flat white', 'Doble ristretto y leche texturizada.', '2.90'],
      ['Filtrado V60', 'Extracción manual, notas cítricas y florales.', '3.40'],
      ['Croissant de mantequilla', 'Hojaldre laminado a mano cada mañana.', '2.20'],
    ],
    reasons: [
      ['Tueste propio.', 'Tostamos cada semana en el local.'],
      ['Grano trazable.', 'Origen, finca y altitud en cada carta.'],
      ['Sitio para quedarse.', 'Mesas amplias, enchufes y wifi.'],
    ],
    testimonials: [
      ['El mejor filtrado que he tomado en la ciudad.', 'Ana R.'],
      ['Vengo a trabajar y acabo quedándome toda la mañana.', 'Marcos D.'],
      ['El croissant merece el viaje.', 'Lucía P.'],
    ],
  }],
  [/pizzer[íi]a|pizza/i, {
    menuTitle: 'Menú',
    menuItems: [
      ['Margherita', 'San Marzano, fiordilatte, albahaca fresca.', '9.50'],
      ['Diavola', 'Salami picante, mozzarella, orégano.', '11.50'],
      ['Quattro formaggi', 'Mozzarella, gorgonzola, parmesano y taleggio.', '12.50'],
      ['Verdure', 'Calabacín, berenjena y pimiento asado.', '10.50'],
    ],
    reasons: [
      ['Masa madre.', 'Fermentación lenta de 48 horas.'],
      ['Horno de piedra.', 'Cocción a 450°C en 90 segundos.'],
      ['Producto italiano.', 'Tomate y quesos de importación directa.'],
    ],
  }],
  [/sushi|japon[ée]s/i, {
    menuTitle: 'Carta',
    menuItems: [
      ['Nigiri selección', 'Ocho piezas de pescado de lonja del día.', '18.00'],
      ['Sashimi variado', 'Corte grueso, tres especies según mercado.', '16.50'],
      ['Uramaki de la casa', 'Salmón, aguacate y sésamo tostado.', '12.00'],
      ['Edamame', 'Vaina salteada con sal marina.', '4.50'],
    ],
    reasons: [
      ['Pescado de lonja.', 'Compra diaria, corte a la vista.'],
      ['Arroz al momento.', 'Avinagrado y templado en cada servicio.'],
      ['Barra abierta.', 'Se cocina delante de ti.'],
    ],
  }],
  [/panader[íi]a|bakery/i, {
    menuTitle: 'Obrador',
    menuItems: [
      ['Hogaza de masa madre', 'Fermentación de 24 horas, corteza gruesa.', '4.50'],
      ['Croissant', 'Mantequilla francesa, laminado a mano.', '2.20'],
      ['Pan de centeno', 'Grano molido a la piedra.', '5.00'],
    ],
    reasons: [
      ['Masa madre viva.', 'Refrescada cada día desde hace años.'],
      ['Horno propio.', 'Cocción en solera de piedra.'],
      ['Sin aditivos.', 'Harina, agua, sal y tiempo.'],
    ],
  }],
];

export function sectionContent(name: string): SectionContent {
  for (const [re, patch] of SECTION_NICHES) {
    if (re.test(name)) return { ...DEFAULT_SECTIONS, ...patch };
  }
  return DEFAULT_SECTIONS;
}
