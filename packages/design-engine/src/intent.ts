/** Intent Analyzer (plan §10): interpreta el brief antes de preguntar nada. */
export interface Intent {
  industry: string;
  audience: string;
  primaryAction: string;
  personality: string[];
  language: string;
  pages: string[];
  features: string[];
  brandGiven: boolean;
  confidence: number;
  unknowns: string[];
}

const INDUSTRY_CUES: Record<string, string[]> = {
  restaurant: ['restaurante','hamburgues','burger','café','cafeter','pizzer','bar','menú','menu','cocina','comida','food','taquer','sushi'],
  ecommerce: ['tienda','shop','ecommerce','vender','productos','carrito','catálogo','store'],
  saas: ['saas','plataforma','software','automatiz','app web','suscripción','api','herramienta'],
  dashboard: ['dashboard','panel','métricas','analytics','admin','backoffice'],
  portfolio: ['portfolio','portafolio','diseñador','fotógraf','artista','3d','freelance'],
  agency: ['agencia','estudio','consultora','marketing'],
  fintech: ['fintech','banco','pagos','cripto','inversión','wallet'],
  healthcare: ['clínica','salud','médic','dentista','terapia'],
  education: ['curso','academia','escuela','formación','educa'],
  entertainment: ['evento','música','festival','juego','cine'],
};

const PERSONALITY_CUES: Record<string, string[]> = {
  premium: ['premium','lujo','elegante','exclusiv','alta gama'],
  youthful: ['juvenil','joven','fresco','divertido','urbano'],
  minimal: ['minimal','limpio','sobrio','simple'],
  bold: ['atrevid','impactante','llamativ','potente','brutal'],
  warm: ['cálid','acogedor','familiar','cercano'],
  technical: ['técnic','profesional','serio','corporativ','preciso'],
};

const FEATURE_CUES: Record<string, string[]> = {
  whatsapp: ['whatsapp','wasap','pedido por whatsapp'],
  menu: ['menú','menu','carta'],
  booking: ['reserva','cita','booking','agenda'],
  cart: ['carrito','checkout','comprar'],
  contact: ['contacto','formulario','email'],
  gallery: ['galería','fotos','imágenes'],
  pricing: ['precios','planes','pricing','tarifas'],
  blog: ['blog','noticias','artículos'],
  map: ['mapa','ubicación','dirección','cómo llegar'],
  testimonials: ['testimonios','reseñas','opiniones'],
};

function matchAll(text: string, cues: Record<string, string[]>): string[] {
  return Object.entries(cues).filter(([, list]) => list.some((c) => text.includes(c))).map(([k]) => k);
}

export function analyzeIntent(brief: string): Intent {
  const text = brief.toLowerCase();
  const industries = matchAll(text, INDUSTRY_CUES);
  const industry = industries[0] ?? 'generic';
  const personality = matchAll(text, PERSONALITY_CUES);
  const features = matchAll(text, FEATURE_CUES);
  const spanish = /[áéíóúñ¿¡]|(\b(el|la|los|las|una|para|con|crea|quiero)\b)/.test(text);

  const pages = new Set<string>(['home']);
  if (features.includes('menu')) pages.add('menu');
  if (industry === 'ecommerce') { pages.add('catalog'); pages.add('product'); }
  if (industry === 'saas') { pages.add('pricing'); }
  if (features.includes('contact') || features.includes('booking')) pages.add('contact');
  if (industry === 'portfolio') pages.add('work');

  const primaryAction =
    features.includes('whatsapp') ? 'Pedir por WhatsApp'
    : features.includes('booking') ? 'Reservar'
    : features.includes('cart') ? 'Comprar'
    : industry === 'saas' ? 'Empezar prueba gratis'
    : industry === 'portfolio' ? 'Ver proyectos'
    : 'Contactar';

  const unknowns: string[] = [];
  if (!/\b(marca|logo|identidad|brand)\b/.test(text)) unknowns.push('brand');
  if (!/(cliente|público|audiencia|para\s+\w+es)/.test(text)) unknowns.push('audience');
  if (!/(foto|imagen|assets|contenido|texto)/.test(text)) unknowns.push('content');
  if (!/(ciudad|barrio|calle|en\s+[A-ZÁ][a-zá]+)/i.test(brief)) unknowns.push('location');

  const confidence = Math.min(1,
    0.3 + (industries.length ? 0.25 : 0) + (personality.length ? 0.2 : 0)
    + (features.length ? 0.15 : 0) + (brief.length > 80 ? 0.1 : 0));

  return {
    industry, audience: 'no especificado', primaryAction,
    personality: personality.length ? personality : ['minimal'],
    language: spanish ? 'es' : 'en',
    pages: [...pages], features,
    brandGiven: /\b(logo|marca|identidad|brand)\b/.test(text) && !/sin (marca|logo|identidad)/.test(text),
    confidence: Number(confidence.toFixed(2)), unknowns,
  };
}
