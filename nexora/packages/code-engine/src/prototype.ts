import type { ArtifactFile, DesignDirection, DesignSystem } from '@nexora/schemas';
import { tokensToCss } from '@nexora/design-systems';

/** Plan §23 — prototipo para validar dirección antes de invertir en implementación. */
export function generatePrototype(ds: DesignSystem, direction: DesignDirection, projectName: string): ArtifactFile[] {
  const preview = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prototipo — ${projectName}</title>
<style>
${tokensToCss(ds.tokens)}
body { margin:0; font-family: var(--font-font-body); background: var(--color-bg); color: var(--color-ink); }
.wrap { width: min(1100px, 100% - 32px); margin-inline: auto; padding: var(--space-8) 0; }
h1,h2 { font-family: var(--font-font-display); letter-spacing: -0.02em; }
.swatches { display: flex; flex-wrap: wrap; gap: var(--space-4); margin: var(--space-5) 0 var(--space-8); }
.swatch { width: 120px; }
.chip { height: 72px; border-radius: var(--radius-md); border: 1px solid rgba(128,128,128,.25); }
.frames { display: grid; grid-template-columns: 375px 1fr; gap: var(--space-6); align-items: start; }
.frame { border: 1px solid rgba(128,128,128,.3); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-surface); }
.frame header { padding: var(--space-3) var(--space-4); font-size: 13px; color: var(--color-muted); border-bottom: 1px solid rgba(128,128,128,.2); }
.mock { padding: var(--space-6); display: grid; gap: var(--space-4); }
.bar { height: 12px; border-radius: 6px; background: color-mix(in srgb, var(--color-ink) 16%, transparent); }
.bar.w70{width:70%} .bar.w50{width:50%} .bar.w90{width:90%}
.block { height: 140px; border-radius: var(--radius-md); background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 40%, var(--color-surface)), var(--color-surface)); }
.cta { display:inline-block; padding: 12px 20px; border-radius: var(--radius-md); background: var(--color-accent); color: var(--color-bg); font-weight:600; }
@media (max-width: 860px){ .frames { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="wrap">
  <p style="color:var(--color-accent);text-transform:uppercase;letter-spacing:.14em;font-size:13px">Prototipo · dirección visual</p>
  <h1>${direction.name}</h1>
  <p style="color:var(--color-muted);max-width:60ch">${direction.rationale}</p>

  <h2>Paleta</h2>
  <div class="swatches">
${Object.entries(ds.color).map(([k, v]) => `    <div class="swatch"><div class="chip" style="background:${v}"></div><small>${k}<br>${v}</small></div>`).join('\n')}
  </div>

  <h2>Frames</h2>
  <div class="frames">
    <div class="frame"><header>mobile · 375px</header><div class="mock">
      <div class="bar w50"></div><div class="block"></div><div class="bar w90"></div><div class="bar w70"></div><span class="cta">Acción principal</span>
    </div></div>
    <div class="frame"><header>desktop · fluido</header><div class="mock">
      <div class="bar w50"></div><div class="block" style="height:220px"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div>
      </div>
      <span class="cta">Acción principal</span>
    </div></div>
  </div>
</div>
</body>
</html>
`;
  return [{ path: 'prototype.html', contents: preview }];
}
