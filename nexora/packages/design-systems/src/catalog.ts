import type { DesignDirection } from '@nexora/schemas';

/**
 * Biblioteca base de direcciones visuales (plan §4/§22).
 * INSPIRE: la filosofía "sistemas visuales como datos consultables" se adopta,
 * pero el catálogo es propio y ampliable — no una lista estática importada.
 */
export const DIRECTION_CATALOG: DesignDirection[] = [
  {
    id: 'coastal-premium', name: 'Coastal Premium',
    rationale: 'Arena cálida, agua profunda y tipografía editorial: premium sin resultar frío.',
    palette: { bg: '#0b1f2a', surface: '#123241', ink: '#f4efe6', muted: '#9fb6bf', accent: '#ff7a45', accent2: '#ffd166' },
    typography: { display: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif", scale: 'major-third' },
    layout: 'Hero a pantalla completa con imagen, contenido en columnas asimétricas, mucho aire.',
    imagery: 'Fotografía de producto con luz natural cálida, horizonte marino como recurso recurrente.',
    motion: 'Fades largos y parallax muy sutil; nada rebota.',
    components: ['hero-fullbleed', 'menu-list', 'testimonial-quote', 'cta-whatsapp', 'gallery-masonry'],
    tone: 'Cálido, seguro, con oficio.',
    references: ['editorial gastronómico', 'hotelería boutique'],
  },
  {
    id: 'tropical-modern', name: 'Tropical Modern',
    rationale: 'Color saturado y formas orgánicas para público joven sin caer en lo infantil.',
    palette: { bg: '#07110f', surface: '#0f1f1b', ink: '#f2fff8', muted: '#8fb3a6', accent: '#2bd576', accent2: '#ffe066' },
    typography: { display: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", scale: 'perfect-fourth' },
    layout: 'Bloques en diagonal, tarjetas con bordes amplios, grid de 12 columnas.',
    imagery: 'Fotografía de alto contraste, recortes con máscaras orgánicas.',
    motion: 'Entradas rápidas con desplazamiento corto; hover con elevación.',
    components: ['hero-split', 'card-grid', 'sticky-order-bar', 'faq-accordion'],
    tone: 'Energético, directo, juvenil.',
    references: ['street food moderno', 'marcas de bebidas'],
  },
  {
    id: 'editorial-minimal', name: 'Editorial Minimal',
    rationale: 'La tipografía hace el trabajo: jerarquía fuerte, casi sin decoración.',
    palette: { bg: '#fbfaf7', surface: '#ffffff', ink: '#14110f', muted: '#6f6a64', accent: '#1f4fd8', accent2: '#e3dbcd' },
    typography: { display: "'Fraunces', Georgia, serif", body: "'Inter', system-ui, sans-serif", scale: 'minor-third' },
    layout: 'Columna de lectura centrada, reglas horizontales finas, márgenes generosos.',
    imagery: 'Poca imagen, mucho blanco; fotografía en blanco y negro cuando aparece.',
    motion: 'Prácticamente nula; solo focus y transición de color.',
    components: ['hero-type', 'article-list', 'quiet-cta', 'footer-index'],
    tone: 'Sobrio, culto, confiable.',
    references: ['revistas de diseño', 'estudios de arquitectura'],
  },
  {
    id: 'technical-dark', name: 'Technical Dark',
    rationale: 'Superficie oscura, datos densos y acentos de precisión para producto/SaaS.',
    palette: { bg: '#0a0c12', surface: '#131724', ink: '#e8ecf7', muted: '#8b93aa', accent: '#5b8cff', accent2: '#31e1b3' },
    typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", scale: 'major-second' },
    layout: 'Grid modular denso, secciones con bordes de 1px, tablas y métricas.',
    imagery: 'Diagramas, capturas de producto, degradados muy contenidos.',
    motion: 'Micro-interacciones de 140ms, sin scroll-jacking.',
    components: ['hero-product', 'feature-grid', 'pricing-table', 'logo-wall', 'code-block'],
    tone: 'Preciso, técnico, sin exageración.',
    references: ['herramientas de desarrollo', 'infraestructura'],
  },
  {
    id: 'soft-luxury', name: 'Soft Luxury',
    rationale: 'Neutros cálidos, mucho espacio negativo y detalles metálicos discretos.',
    palette: { bg: '#f6f2ec', surface: '#ffffff', ink: '#221d18', muted: '#7d746a', accent: '#8a6a3b', accent2: '#d9cbb6' },
    typography: { display: "'Cormorant Garamond', Georgia, serif", body: "'Jost', system-ui, sans-serif", scale: 'major-third' },
    layout: 'Composición asimétrica, imágenes grandes, texto pequeño y preciso.',
    imagery: 'Fotografía de detalle, texturas, sombra suave.',
    motion: 'Transiciones lentas y continuas.',
    components: ['hero-editorial', 'product-detail', 'lookbook', 'reservation-form'],
    tone: 'Elegante, pausado, exclusivo.',
    references: ['moda', 'joyería', 'hospitalidad de lujo'],
  },
  {
    id: 'bold-brutal', name: 'Bold Brutal',
    rationale: 'Contraste extremo y tipografía enorme para portfolios que deben recordarse.',
    palette: { bg: '#111111', surface: '#1c1c1c', ink: '#fafafa', muted: '#9a9a9a', accent: '#ff3b2f', accent2: '#00e0ff' },
    typography: { display: "'Archivo Black', Impact, sans-serif", body: "'Inter', system-ui, sans-serif", scale: 'augmented-fourth' },
    layout: 'Bloques a sangre, superposiciones, grid roto de forma intencional.',
    imagery: 'Render 3D, duotono, imagen a pantalla completa.',
    motion: 'Cortes rápidos, cursor personalizado, sin excesos que rompan scroll.',
    components: ['hero-oversized', 'work-index', 'marquee', 'contact-block'],
    tone: 'Contundente, seguro, creativo.',
    references: ['portfolios 3D', 'estudios creativos'],
  },
];

export function findDirection(id: string): DesignDirection | undefined {
  return DIRECTION_CATALOG.find((d) => d.id === id);
}

/** Heurística de industria → direcciones candidatas. */
export const INDUSTRY_HINTS: Record<string, string[]> = {
  restaurant: ['coastal-premium', 'tropical-modern', 'soft-luxury'],
  ecommerce: ['technical-dark', 'soft-luxury', 'editorial-minimal'],
  saas: ['technical-dark', 'editorial-minimal', 'tropical-modern'],
  dashboard: ['technical-dark', 'editorial-minimal'],
  portfolio: ['bold-brutal', 'editorial-minimal', 'soft-luxury'],
  agency: ['bold-brutal', 'technical-dark'],
  fintech: ['technical-dark', 'editorial-minimal'],
  healthcare: ['editorial-minimal', 'soft-luxury'],
  education: ['editorial-minimal', 'tropical-modern'],
  entertainment: ['bold-brutal', 'tropical-modern'],
  generic: ['editorial-minimal', 'technical-dark', 'tropical-modern'],
};
