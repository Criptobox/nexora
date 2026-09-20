import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeIntent, contentSeed, sectionContent, generateDirections, buildDesignSystem } from '../../packages/design-engine/dist/index.js';
import { generateSite } from '../../packages/code-engine/dist/index.js';

// Regresión: una cafetería mostraba el copy de una hamburguesería (carne madurada,
// pan brioche, "pedí por WhatsApp"). El contenido debe seguir al nicho del brief.
test('el contenido no se contamina entre nichos', () => {
  const cafe = sectionContent('Cafetería de Especialidad');
  const burger = sectionContent('Hamburguesería Frente al Mar');

  const cafeText = JSON.stringify(cafe).toLowerCase();
  assert.ok(!cafeText.includes('carne madurada'), 'la cafetería no debe hablar de carne madurada');
  assert.ok(!cafeText.includes('brioche'), 'la cafetería no debe ofrecer pan brioche');
  assert.ok(cafeText.includes('tueste') || cafeText.includes('café') || cafeText.includes('grano'));

  const burgerText = JSON.stringify(burger).toLowerCase();
  assert.ok(burgerText.includes('carne'), 'la hamburguesería sí debe hablar de carne');
  assert.notDeepEqual(cafe.menuItems, burger.menuItems);
});

test('un nicho desconocido cae en contenido genérico, no en el de otro negocio', () => {
  const generic = sectionContent('Taller Mecánico Rivas');
  const text = JSON.stringify(generic).toLowerCase();
  for (const leak of ['brioche', 'carne madurada', 'ristretto', 'masa madre', 'nigiri']) {
    assert.ok(!text.includes(leak), `contenido genérico contaminado con "${leak}"`);
  }
});

test('el nombre derivado del brief conserva acentos y no arrastra las features', () => {
  const seed = contentSeed('restaurant', 'Cafetería de Especialidad', 'Reservar');
  assert.match(seed.heroTitle, /Cafetería/);
  assert.ok(!seed.heroTitle.includes('con menú'), 'el nombre no debe incluir la lista de features');
});

test('el HTML generado refleja el nicho del brief', () => {
  const brief = 'Crea una web para una cafetería de especialidad con menú y reservas';
  const intent = analyzeIntent(brief);
  const ds = buildDesignSystem(intent, generateDirections(intent, 1)[0], brief);
  const files = generateSite({ intent, designSystem: ds, projectName: 'Cafetería de Especialidad', brief });
  const html = files.find((f) => f.path === 'index.html').contents;

  assert.ok(!/brioche/i.test(html), 'HTML de cafetería con copy de hamburguesería');
  assert.match(html, /Espresso|Filtrado|Flat white/i);
  assert.match(html, /Cafetería/);
});
