import type { ArtifactFile, DesignSystem } from '@nexora/schemas';
import { tokensToCss, tokensToJson } from '@nexora/design-systems';
import { contentSeed, sectionContent, type Intent } from '@nexora/design-engine';

export interface GenerateInput {
  intent: Intent;
  designSystem: DesignSystem;
  projectName: string;
  brief: string;
  whatsappNumber?: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Generador determinista del sitio. Es el "suelo" del Code Engine: garantiza que
 * NEXORA siempre produce un resultado ejecutable y verificable aunque no haya modelo.
 * Cuando hay un proveedor real, el agente Coder mejora/sustituye estas secciones.
 * Todos los valores visuales vienen de tokens: ningún componente inventa valores (plan §18).
 */
export function generateSite(input: GenerateInput): ArtifactFile[] {
  const { intent, designSystem: ds, projectName } = input;
  const copy = contentSeed(intent.industry, projectName, intent.primaryAction);
  const wa = input.whatsappNumber ?? '5350000000';
  const ctaHref = intent.features.includes('whatsapp')
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hola ${projectName}, quiero hacer un pedido`)}`
    : '#contacto';

  const sections = buildSections(intent, projectName, copy, ctaHref);

  const html = `<!doctype html>
<html lang="${intent.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(input.brief.slice(0, 150))}">
<meta name="color-scheme" content="dark light">
<title>${esc(projectName)} — ${esc(copy.heroKicker)}</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="#inicio"><span class="brand-mark" aria-hidden="true"></span>${esc(projectName)}</a>
    <nav class="nav" aria-label="Navegación principal">
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-list" aria-label="Abrir menú">
        <span class="nav-toggle-bar" aria-hidden="true"></span>
      </button>
      <ul class="nav-list" id="nav-list">
${sections.map((s) => `        <li><a href="#${s.id}">${esc(s.navLabel)}</a></li>`).join('\n')}
      </ul>
    </nav>
    <a class="btn btn-primary btn-compact" href="${ctaHref}"${ctaHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(intent.primaryAction)}</a>
  </div>
</header>

<main id="contenido">
${sections.map((s) => s.html).join('\n')}
</main>

<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <p class="footer-brand">${esc(projectName)}</p>
      <p class="muted">${esc(copy.heroKicker)}</p>
    </div>
    <div>
      <h2 class="footer-title">Contacto</h2>
      <ul class="plain">
        <li><a href="mailto:hola@${slug(projectName)}.com">hola@${slug(projectName)}.com</a></li>
        <li><a href="tel:+${wa}">+${wa}</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Horario</h2>
      <p class="muted" data-placeholder="true">Lunes a domingo · 12:00 – 23:00</p>
    </div>
  </div>
  <div class="container footer-legal">
    <p class="muted small">© ${new Date().getFullYear()} ${esc(projectName)}. Sitio generado por NEXORA.</p>
  </div>
</footer>

<script src="app.js" defer></script>
</body>
</html>
`;

  return [
    { path: 'index.html', contents: html },
    { path: 'styles.css', contents: generateCss(ds) },
    { path: 'app.js', contents: generateJs() },
    { path: 'tokens.json', contents: tokensToJson(ds.tokens) },
    { path: 'robots.txt', contents: 'User-agent: *\nAllow: /\n' },
  ];
}

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ''); }

interface Section { id: string; navLabel: string; html: string; }

function buildSections(intent: Intent, name: string, copy: Record<string, string>, ctaHref: string): Section[] {
  // Contenido coherente con el nicho: nunca copy de otro negocio (plan §31).
  const sc = sectionContent(name);
  const out: Section[] = [];
  const extern = ctaHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';

  out.push({ id: 'inicio', navLabel: 'Inicio', html: `  <section class="hero" id="inicio">
    <div class="container hero-inner">
      <p class="kicker">${esc(copy.heroKicker)}</p>
      <h1 class="hero-title">${esc(copy.heroTitle)}</h1>
      <p class="hero-sub">${esc(copy.heroSubtitle)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${ctaHref}"${extern}>${esc(intent.primaryAction)}</a>
        <a class="btn btn-ghost" href="#${intent.features.includes('menu') ? 'menu' : 'detalles'}">${esc(copy.secondaryCta)}</a>
      </div>
      <dl class="hero-stats">
        <div><dt>Valoración</dt><dd>4.8/5</dd></div>
        <div><dt>Entrega</dt><dd>25 min</dd></div>
        <div><dt>Abierto</dt><dd>Todos los días</dd></div>
      </dl>
    </div>
  </section>` });

  if (intent.features.includes('menu')) {
    const items = sc.menuItems;
    out.push({ id: 'menu', navLabel: sc.menuTitle, html: `  <section class="section" id="menu">
    <div class="container">
      <h2 class="section-title">${esc(sc.menuTitle)}</h2>
      <p class="section-lead">${esc(sc.menuLead)}</p>
      <ul class="menu-list">
${items.map(([t, d, p]) => `        <li class="menu-item">
          <div class="menu-item-head"><h3>${esc(t)}</h3><span class="price">€${p}</span></div>
          <p class="muted">${esc(d)}</p>
        </li>`).join('\n')}
      </ul>
    </div>
  </section>` });
  }

  if (intent.features.includes('pricing') || intent.industry === 'saas') {
    const plans = [['Starter', '29', ['3 automatizaciones', 'Soporte por email', '1 usuario']],
                   ['Growth', '89', ['Automatizaciones ilimitadas', 'Integraciones', '10 usuarios']],
                   ['Scale', '249', ['SLA 99.9%', 'SSO y auditoría', 'Usuarios ilimitados']]] as const;
    out.push({ id: 'pricing', navLabel: 'Precios', html: `  <section class="section" id="pricing">
    <div class="container">
      <h2 class="section-title">Precios</h2>
      <p class="section-lead">Sin permanencia. Cambia de plan cuando quieras.</p>
      <div class="grid grid-3">
${plans.map(([n, p, fs], i) => `        <article class="card${i === 1 ? ' card-featured' : ''}">
          <h3>${n}</h3>
          <p class="price-lg">€${p}<span class="muted small">/mes</span></p>
          <ul class="plain check">${fs.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <a class="btn ${i === 1 ? 'btn-primary' : 'btn-ghost'}" href="#contacto">Elegir ${n}</a>
        </article>`).join('\n')}
      </div>
    </div>
  </section>` });
  }

  out.push({ id: 'detalles', navLabel: 'Nosotros', html: `  <section class="section section-split" id="detalles">
    <div class="container split">
      <div>
        <h2 class="section-title">Por qué ${esc(name)}</h2>
        <p class="section-lead">Tres razones concretas, sin adjetivos de relleno.</p>
        <ul class="feature-list">
${sc.reasons.map(([t, d]) => `          <li><strong>${esc(t)}</strong> ${esc(d)}</li>`).join('\n')}
        </ul>
      </div>
      <figure class="media">
        <div class="media-frame" role="img" aria-label="Fotografía del local — pendiente de sustituir" data-placeholder="true"></div>
        <figcaption class="muted small">Imagen placeholder: sustituir por fotografía real.</figcaption>
      </figure>
    </div>
  </section>` });

  out.push({ id: 'opiniones', navLabel: 'Opiniones', html: `  <section class="section" id="opiniones">
    <div class="container">
      <h2 class="section-title">Lo que dicen</h2>
      <div class="grid grid-3">
${sc.testimonials.map(([q, a]) => `        <blockquote class="quote"><p>“${esc(q)}”</p><cite>— ${esc(a)}</cite></blockquote>`).join('\n')}
      </div>
    </div>
  </section>` });

  out.push({ id: 'contacto', navLabel: 'Contacto', html: `  <section class="section section-cta" id="contacto">
    <div class="container cta-inner">
      <h2 class="section-title">${esc(intent.primaryAction)}</h2>
      <p class="section-lead">Responde una persona real, no un bot.</p>
      <form class="form" method="post" action="#" novalidate>
        <div class="field">
          <label for="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" autocomplete="name" required>
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="field field-full">
          <label for="mensaje">Mensaje</label>
          <textarea id="mensaje" name="mensaje" rows="4"></textarea>
        </div>
        <div class="field field-full form-actions">
          <button class="btn btn-primary" type="submit">Enviar</button>
          <a class="btn btn-ghost" href="${ctaHref}"${extern}>${esc(intent.primaryAction)}</a>
        </div>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>` });

  return out;
}

function generateCss(ds: DesignSystem): string {
  return `/* Generado por NEXORA a partir de DESIGN.md — no editar valores a mano, editar tokens. */
${tokensToCss(ds.tokens)}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-font-body);
  font-size: var(--font-size-md);
  line-height: var(--font-leading-normal);
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { font-family: var(--font-font-display); line-height: var(--font-leading-tight); letter-spacing: var(--font-tracking-tight); margin: 0 0 var(--space-4); }
p { margin: 0 0 var(--space-4); }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; }
.muted { color: var(--color-muted); }
.small { font-size: var(--font-size-sm); }
.container { width: min(1200px, 100% - var(--space-6)); margin-inline: auto; }

.skip-link { position: absolute; left: -9999px; top: 0; background: var(--color-accent); color: var(--color-bg); padding: var(--space-3) var(--space-4); z-index: var(--z-toast); }
.skip-link:focus { left: var(--space-4); top: var(--space-4); }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: var(--radius-sm); }

/* Header */
.site-header { position: sticky; top: 0; z-index: var(--z-sticky); backdrop-filter: blur(12px); background: color-mix(in srgb, var(--color-bg) 82%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); }
.header-inner { display: flex; align-items: center; gap: var(--space-5); min-height: 68px; }
.brand { display: inline-flex; align-items: center; gap: var(--space-3); font-family: var(--font-font-display); font-size: var(--font-size-lg); text-decoration: none; }
.brand-mark { width: 14px; height: 14px; border-radius: var(--radius-sm); background: var(--color-accent); }
.nav { margin-left: auto; }
.nav-list { display: flex; gap: var(--space-5); list-style: none; margin: 0; padding: 0; }
.nav-list a { text-decoration: none; color: var(--color-muted); font-size: var(--font-size-sm); padding: var(--space-3) 0; display: inline-block; }
.nav-list a:hover { color: var(--color-ink); }
.nav-toggle { display: none; width: 44px; height: 44px; background: transparent; border: 1px solid color-mix(in srgb, var(--color-ink) 22%, transparent); border-radius: var(--radius-sm); color: inherit; }
.nav-toggle-bar, .nav-toggle-bar::before, .nav-toggle-bar::after { display: block; width: 18px; height: 2px; background: currentColor; margin-inline: auto; content: ''; position: relative; }
.nav-toggle-bar::before { top: -6px; } .nav-toggle-bar::after { top: 4px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); min-height: 48px; padding: 0 var(--space-5); border-radius: var(--radius-md); border: 1px solid transparent; font-weight: 600; font-size: var(--font-size-sm); text-decoration: none; cursor: pointer; transition: transform var(--motion-duration-fast) var(--motion-ease-out), background var(--motion-duration-fast) var(--motion-ease-out); }
.btn-compact { min-height: 40px; padding: 0 var(--space-4); }
.btn-primary { background: var(--color-accent); color: var(--color-bg); }
.btn-primary:hover { transform: translateY(-1px); }
.btn-ghost { border-color: color-mix(in srgb, var(--color-ink) 28%, transparent); color: var(--color-ink); background: transparent; }

/* Hero */
.hero { padding: var(--space-9) 0 var(--space-8); position: relative; overflow: hidden; isolation: isolate; }
.hero::after { content: ''; position: absolute; top: -20%; right: -15%; width: min(680px, 80vw); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at center, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 70%); pointer-events: none; z-index: -1; }
.hero-inner { position: relative; max-width: 780px; }
.kicker { text-transform: uppercase; letter-spacing: .14em; font-size: var(--font-size-xs); color: var(--color-accent); margin-bottom: var(--space-4); }
.hero-title { font-size: clamp(2.5rem, 7vw, var(--font-size-3xl)); margin-bottom: var(--space-4); }
.hero-sub { font-size: var(--font-size-lg); color: var(--color-muted); max-width: 56ch; }
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-6); }
.hero-stats { display: flex; flex-wrap: wrap; gap: var(--space-7); margin: var(--space-8) 0 0; padding: var(--space-5) 0 0; border-top: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); }
.hero-stats dt { font-size: var(--font-size-xs); color: var(--color-muted); text-transform: uppercase; letter-spacing: .1em; }
.hero-stats dd { margin: var(--space-1) 0 0; font-family: var(--font-font-display); font-size: var(--font-size-lg); }

/* Sections */
.section { padding: var(--space-8) 0; }
.section-title { font-size: clamp(1.75rem, 4vw, var(--font-size-2xl)); }
.section-lead { color: var(--color-muted); max-width: 58ch; }
.grid { display: grid; gap: var(--space-5); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.card { background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); border-radius: var(--radius-lg); padding: var(--space-6); }
.card-featured { border-color: var(--color-accent); box-shadow: var(--shadow-md); }
.price-lg { font-family: var(--font-font-display); font-size: var(--font-size-2xl); margin: var(--space-3) 0 var(--space-5); }
.plain { list-style: none; margin: 0 0 var(--space-5); padding: 0; display: grid; gap: var(--space-2); }
.plain.check li::before { content: '✓'; color: var(--color-accent); margin-right: var(--space-2); }
.menu-list { list-style: none; margin: var(--space-6) 0 0; padding: 0; display: grid; gap: var(--space-5); }
.menu-item { border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); padding-bottom: var(--space-5); }
.menu-item-head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-4); }
.menu-item-head h3 { margin: 0 0 var(--space-2); font-size: var(--font-size-lg); }
.price { font-family: var(--font-font-display); color: var(--color-accent); }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-7); align-items: center; }
.feature-list { list-style: none; margin: var(--space-5) 0 0; padding: 0; display: grid; gap: var(--space-4); }
.media-frame { aspect-ratio: 4 / 3; border-radius: var(--radius-lg); border: 1px solid color-mix(in srgb, var(--color-ink) 14%, transparent); background:
    repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-ink) 4%, transparent) 0 14px, transparent 14px 28px),
    linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 28%, var(--color-surface)), var(--color-surface)); }
.quote { margin: 0; background: var(--color-surface); border-left: 3px solid var(--color-accent); border-radius: var(--radius-md); padding: var(--space-5); }
.quote cite { color: var(--color-muted); font-style: normal; font-size: var(--font-size-sm); }
.section-cta { background: var(--color-surface); border-block: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); }
.cta-inner { max-width: 760px; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-6); }
.field { display: grid; gap: var(--space-2); }
.field-full { grid-column: 1 / -1; }
.field label { font-size: var(--font-size-sm); color: var(--color-muted); }
.field input, .field textarea { width: 100%; min-height: 48px; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border: 1px solid color-mix(in srgb, var(--color-ink) 22%, transparent); background: var(--color-bg); color: var(--color-ink); font: inherit; }
.form-actions { display: flex; gap: var(--space-4); flex-wrap: wrap; }
.form-status { grid-column: 1 / -1; margin: 0; min-height: 1.4em; color: var(--color-accent); font-size: var(--font-size-sm); }

/* Footer */
.site-footer { padding: var(--space-8) 0 var(--space-6); border-top: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); }
.footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.footer-brand { font-family: var(--font-font-display); font-size: var(--font-size-lg); margin: 0 0 var(--space-2); }
.footer-title { font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: .1em; color: var(--color-muted); }
.footer-legal { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); }

/* Responsive */
@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid-3, .footer-grid, .split, .form { grid-template-columns: 1fr; }
  .nav-toggle { display: block; }
  .nav-list { position: absolute; left: 0; right: 0; top: 68px; flex-direction: column; gap: 0; background: var(--color-surface); padding: var(--space-4) var(--space-5); border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); display: none; }
  .nav-list.is-open { display: flex; }
  .nav-list a { padding: var(--space-4) 0; min-height: 44px; }
  .hero { padding: var(--space-8) 0 var(--space-7); }
  .hero-stats { gap: var(--space-5); }
  .header-inner .btn-compact { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
`;
}

function generateJs(): string {
  return `// Comportamiento mínimo y accesible. Sin dependencias.
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var list = document.getElementById('nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', function () {
      var open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    list.addEventListener('click', function (e) {
      if (e.target instanceof HTMLAnchorElement) {
        list.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && list.classList.contains('is-open')) {
        list.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var email = form.querySelector('#email');
      var nombre = form.querySelector('#nombre');
      if (!nombre.value.trim() || !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email.value)) {
        if (status) status.textContent = 'Revisa el nombre y el email antes de enviar.';
        return;
      }
      if (status) status.textContent = 'Gracias. Te respondemos en breve.';
      form.reset();
    });
  }
})();
`;
}
