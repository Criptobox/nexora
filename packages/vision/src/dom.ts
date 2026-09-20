/**
 * Analizador estático de DOM sin dependencias.
 * Es el camino por defecto para que Vision QA funcione siempre; cuando Playwright
 * está instalado, `BrowserAgent` aporta observación real (screenshot, consola, layout).
 */
export interface DomElement { tag: string; attrs: Record<string, string>; text: string; index: number; }

export function parseElements(html: string): DomElement[] {
  const out: DomElement[] = [];
  const re = /<([a-zA-Z][\w-]*)((?:\s+[^<>]*?)?)\/?>/g;
  let m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs: Record<string, string> = {};
    for (const a of m[2].matchAll(/([\w:-]+)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)')?/g)) {
      attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? '';
    }
    const after = html.slice(re.lastIndex);
    const close = after.indexOf(`</${tag}>`);
    const text = close >= 0 && close < 3000 ? after.slice(0, close).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    out.push({ tag, attrs, text, index: i++ });
  }
  return out;
}

export interface DomSnapshot {
  elements: DomElement[];
  headings: Array<{ level: number; text: string }>;
  images: DomElement[];
  links: DomElement[];
  buttons: DomElement[];
  forms: DomElement[];
  landmarks: string[];
  hasViewport: boolean;
  lang: string | null;
  title: string | null;
  textLength: number;
}

export function snapshotDom(html: string): DomSnapshot {
  const elements = parseElements(html);
  const headings = elements.filter((e) => /^h[1-6]$/.test(e.tag)).map((e) => ({ level: Number(e.tag[1]), text: e.text }));
  return {
    elements, headings,
    images: elements.filter((e) => e.tag === 'img'),
    links: elements.filter((e) => e.tag === 'a'),
    buttons: elements.filter((e) => e.tag === 'button' || e.attrs.role === 'button'),
    forms: elements.filter((e) => e.tag === 'form'),
    landmarks: elements.filter((e) => ['header', 'nav', 'main', 'footer', 'aside', 'section'].includes(e.tag)).map((e) => e.tag),
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    lang: html.match(/<html[^>]+lang=["']([^"']+)/i)?.[1] ?? null,
    title: html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null,
    textLength: html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length,
  };
}
