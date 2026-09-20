import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseSkillMarkdown, loadSkillsFromDir, SkillRegistry, validateSkill } from '../../packages/skills/dist/index.js';
import { tokensToCss, findUndeclaredTokens, BASE_TOKENS, mergeTokens } from '../../packages/design-systems/dist/index.js';
import { ScopedFs } from '../../packages/core/dist/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('skills & design systems', () => {
  test('parsea SKILL.md con frontmatter y secciones', () => {
    const skill = parseSkillMarkdown(`---
id: demo
version: 1.0.0
name: Demo
category: design
purpose: Probar
when_to_use:
  - demo
---

## Rules
- regla uno
- regla dos

## Anti-patterns
- nada de esto
`, 'skills/demo/SKILL.md');
    assert.equal(skill.id, 'demo');
    assert.equal(skill.rules.length, 2);
    assert.equal(skill.antiPatterns.length, 1);
    assert.deepEqual(validateSkill(skill), []);
  });

  test('carga todas las skills del repo y todas son válidas', async () => {
    const skills = await loadSkillsFromDir(new ScopedFs(repoRoot), 'skills');
    assert.ok(skills.length >= 13, `solo ${skills.length} skills`);
    for (const s of skills) {
      assert.deepEqual(validateSkill(s), [], `skill inválida: ${s.id}`);
      assert.ok(s.rules.length > 0, `skill sin reglas: ${s.id}`);
    }
  });

  test('select puntúa skills contra el brief', async () => {
    const reg = new SkillRegistry().registerAll(await loadSkillsFromDir(new ScopedFs(repoRoot), 'skills'));
    const picked = reg.select('web para una hamburguesería con menú', { limit: 5 });
    assert.ok(picked.length > 0);
    assert.ok(reg.prompt(picked).includes('SKILL'));
  });

  test('tokens generan CSS válido y detectan deriva', () => {
    const tokens = mergeTokens(BASE_TOKENS, { color: { accent: '#ff0000', bg: '#000000' } });
    const css = tokensToCss(tokens);
    assert.match(css, /--color-accent: #ff0000;/);
    assert.match(css, /--space-4: 16px;/);
    assert.deepEqual(findUndeclaredTokens('a{color:var(--color-accent)}', tokens), []);
    assert.deepEqual(findUndeclaredTokens('a{color:var(--color-inventado)}', tokens), ['color-inventado']);
  });
});
