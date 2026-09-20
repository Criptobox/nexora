import type { Task } from '@nexora/schemas';
import { shortId } from '@nexora/core';
import { analyzeIntent, planDiscovery, type Intent } from '@nexora/design-engine';

/** Plan §10 — el Brain está dividido en responsabilidades, no es un prompt gigante. */
export interface Plan { intent: Intent; tasks: Task[]; questions: ReturnType<typeof planDiscovery>; }

const T = (type: Task['type'], priority: number, deps: string[], input: unknown): Task => ({
  id: `${type}-${shortId('t').slice(-6)}`, type, status: 'pending', priority, dependencies: deps, input,
});

/** Planner: construye el grafo de tareas del flujo base (plan §1.5). */
export function planProject(brief: string, autonomy: 'guided' | 'balanced' | 'autonomous' | 'expert' = 'balanced'): Plan {
  const intent = analyzeIntent(brief);
  const questions = planDiscovery(intent, autonomy);

  const discovery = T('discovery', 100, [], { brief, autonomy });
  const direction = T('design-direction', 90, [discovery.id], { brief });
  const system = T('design-system', 85, [direction.id], {});
  const prototype = T('prototype', 80, [system.id], {});
  const review = T('visual-review', 75, [prototype.id], {});
  const implementation = T('implementation', 70, [review.id], {});
  const execution = T('execution', 65, [implementation.id], {});
  const visualQa = T('visual-qa', 60, [execution.id], {});
  const functionalQa = T('functional-qa', 58, [execution.id], {});
  const repairTask = T('repair', 50, [visualQa.id, functionalQa.id], {});
  const regression = T('regression', 40, [repairTask.id], {});
  const delivery = T('delivery', 10, [regression.id], {});

  return {
    intent, questions,
    tasks: [discovery, direction, system, prototype, review, implementation, execution, visualQa, functionalQa, repairTask, regression, delivery],
  };
}

/** Orden topológico estable por dependencias y prioridad. */
export function orderTasks(tasks: Task[]): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const done = new Set<string>();
  const out: Task[] = [];
  let guard = 0;
  while (out.length < tasks.length && guard++ < tasks.length * 4) {
    const ready = tasks
      .filter((t) => !done.has(t.id) && t.dependencies.every((d) => done.has(d) || !byId.has(d)))
      .sort((a, b) => b.priority - a.priority);
    if (!ready.length) break; // dependencia rota: no bloquear en bucle infinito
    for (const t of ready) { out.push(t); done.add(t.id); }
  }
  return out;
}
