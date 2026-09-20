import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeIntent, planDiscovery, generateDirections, buildDesignSystem, renderDesignMd, detectAntiPatterns, contentSeed, markPlaceholders, auditContent } from '../../packages/design-engine/dist/index.js';

describe('design-engine', () => {
  test('analyzeIntent detecta industria, features e idioma', () => {
    const i = analyzeIntent('Crea una web premium para una hamburguesería frente al mar con menú y pedidos por WhatsApp');
    assert.equal(i.industry, 'restaurant');
    assert.equal(i.language, 'es');
    assert.ok(i.features.includes('whatsapp'));
    assert.ok(i.features.includes('menu'));
    assert.equal(i.primaryAction, 'Pedir por WhatsApp');
    assert.ok(i.personality.includes('premium'));
  });

  test('analyzeIntent distingue SaaS', () => {
    const i = analyzeIntent('Crea una landing para una plataforma de automatización empresarial con precios');
    assert.equal(i.industry, 'saas');
    assert.ok(i.pages.includes('pricing'));
  });

  test('planDiscovery respeta el presupuesto de preguntas por autonomía', () => {
    const i = analyzeIntent('Hazme una web de una cafetería');
    assert.equal(planDiscovery(i, 'autonomous').questions.length, 0);
    assert.ok(planDiscovery(i, 'balanced').questions.length <= 2);
    assert.ok(planDiscovery(i, 'guided').questions.length >= planDiscovery(i, 'balanced').questions.length);
    assert.ok(planDiscovery(i, 'autonomous').assumptions.length > 0);
  });

  test('generateDirections prioriza la industria', () => {
    const i = analyzeIntent('web para un restaurante premium');
    const dirs = generateDirections(i, 3);
    assert.equal(dirs.length, 3);
    assert.ok(dirs[0].palette.accent);
  });

  test('DESIGN.md contiene las 14 secciones del plan', () => {
    const i = analyzeIntent('web para una hamburguesería premium con menú');
    const ds = buildDesignSystem(i, generateDirections(i, 1)[0], 'brief');
    const md = renderDesignMd(ds);
    for (const s of ['Identity','Brand','Color','Typography','Spacing','Layout','Components','Motion','Voice','Anti-patterns','Accessibility','Responsive rules','References','Decisions']) {
      assert.ok(md.includes(s), `falta la sección ${s}`);
    }
    assert.ok(md.includes('--color-accent'));
  });

  test('detectAntiPatterns encuentra lorem y falta de responsive', () => {
    const issues = detectAntiPatterns('<html><body><p>Lorem ipsum dolor</p></body></html>', 'body{color:red}');
    const ids = issues.map((i) => i.title);
    assert.ok(issues.length >= 2);
    assert.ok(ids.some((t) => /artificial/i.test(t)));
    assert.ok(ids.some((t) => /Mobile roto/i.test(t)));
  });

  test('content intelligence marca placeholders', () => {
    const html = markPlaceholders('<p>Lorem ipsum dolor sit</p>');
    assert.ok(html.includes('data-placeholder="true"'));
    assert.equal(auditContent(html).placeholders, 1);
    assert.ok(contentSeed('restaurant', 'Test', 'Pedir').heroSubtitle.length > 10);
  });
});
