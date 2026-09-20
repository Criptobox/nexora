# AGENTS.md

Contrato de los agentes de NEXORA. **Ningún agente actúa fuera de sus permisos**; el
Orchestrator es el único que decide quién trabaja, cuándo y con qué información.

## Brain (no es un prompt gigante)

```
Brain
├── Intent Analyzer     analyzeIntent()          design-engine/intent.ts
├── Discovery Planner   planDiscovery()          design-engine/discovery.ts
├── Design Director     generateDirections()     design-engine/direction.ts
├── Prototype Planner   generatePrototype()      code-engine/prototype.ts
├── Code Planner        generateSite()           code-engine/generator.ts
├── Execution Planner   ExecutionEngine          execution/runner.ts
├── QA Planner          runQaPipeline()          qa/pipeline.ts
├── Reviewer            verificationGate()       qa/verification-gate.ts
├── Critic              criticAgent              agents/critic.ts
├── Repair Planner      repair()                 code-engine/repair.ts
└── Memory Manager      ProjectMemory            memory/memory.ts
```

## Agentes registrados

| Agente | Tareas que atiende | Permisos | Qué produce |
|---|---|---|---|
| `designer` | `design-direction`, `design-system`, `prototype` | read:project, write:project, net:models | Direcciones, `DESIGN.md`, tokens, prototipo |
| `coder` | `implementation`, `repair` | read:project, write:project, net:models | Archivos del sitio, parches verificados, `Change[]` |
| `critic` | `visual-review` | read:project, net:models | Issues de severidad alta antes de codificar |
| `qa` | `visual-qa`, `functional-qa`, `regression` | read:project, run:commands, browser | Issues con evidencia, scores, gate |
| `researcher` | `research` | read:project, net:models | Principios extraídos de referencias |

Permisos disponibles: `read:project`, `write:project`, `run:commands`, `net:models`, `browser`, `git`.
`AgentRegistry.assertPermission()` lanza `PermissionDenied` si un agente se sale de su ámbito.

## Contrato

```ts
interface Agent {
  id: string;
  description: string;
  permissions: AgentPermission[];
  handles: TaskType[];
  run(task: Task, ctx: AgentContext): Promise<AgentResult>;
}

type AgentResult = {
  success: boolean;
  changes: Change[];      // qué, por qué, archivos, riesgo, tests, resultado
  artifacts: Artifact[];
  issues: Issue[];        // con evidencia obligatoria
  evidence: Evidence[];
  summary?: string;
};
```

## Actividad visible para el usuario

`Understanding → Planning → Researching → Designing → Prototyping → Coding → Running →
Inspecting → Fixing → Testing → Verified`

Se emiten por `EventBus` y llegan a la UI vía SSE. **No se exponen cadenas internas de
razonamiento**: solo plan, acciones, decisiones, resultados, errores y evidencias (plan §46).

## Debate controlado

Cuando designer, developer y QA proponen soluciones distintas, `resolveDebate()` puntúa
contra requisitos, `DESIGN.md`, issues abiertos y preferencias del usuario. Con issues
críticos abiertos, QA tiene prioridad. **Nunca decide "quién habló último".**

## Reglas de oro

1. Si un agente no puede hacer algo, lo reporta: qué ocurrió, qué intentó, qué puede hacer, qué necesita.
2. Un agente no declara verificado lo que no comprobó.
3. Toda modificación de archivos pasa por el `ChangeLog` con razón y riesgo.
4. Antes de un cambio importante: checkpoint de Git.
