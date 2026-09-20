import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { planProject, orderTasks, resolveDebate, AgentRegistry, designerAgent, coderAgent } from '../../packages/agents/dist/index.js';
import { PermissionDenied } from '../../packages/core/dist/index.js';

describe('agents', () => {
  test('planProject genera el flujo base completo', () => {
    const plan = planProject('Crea una web para una hamburguesería con menú', 'balanced');
    const types = plan.tasks.map((t) => t.type);
    for (const t of ['discovery','design-direction','design-system','prototype','visual-review','implementation','execution','visual-qa','functional-qa','repair','regression','delivery']) {
      assert.ok(types.includes(t), `falta la tarea ${t}`);
    }
  });

  test('orderTasks respeta dependencias', () => {
    const plan = planProject('web de prueba');
    const ordered = orderTasks(plan.tasks);
    const seen = new Set();
    for (const t of ordered) {
      for (const d of t.dependencies) assert.ok(seen.has(d), `dependencia ${d} no resuelta antes de ${t.id}`);
      seen.add(t.id);
    }
    assert.equal(ordered.length, plan.tasks.length);
  });

  test('registry aplica permisos', () => {
    const reg = new AgentRegistry().register(designerAgent).register(coderAgent);
    assert.equal(reg.forTask('implementation').id, 'coder');
    assert.throws(() => reg.assertPermission(designerAgent, 'run:commands'), PermissionDenied);
    reg.assertPermission(designerAgent, 'write:project');
  });

  test('debate decide por criterio, no por turno', () => {
    const v = resolveDebate(
      [{ agent: 'designer', proposal: 'añadir animación', rationale: 'estética', cost: 5 },
       { agent: 'qa', proposal: 'corregir contraste', rationale: 'accesibilidad', cost: 1 }],
      { requirements: ['contraste'], designRules: [], openIssues: [{ severity: 'critical' }], userPreferences: [] }
    );
    assert.equal(v.winner.agent, 'qa');
  });
});
