import type { AgentResult, ArtifactFile, Issue, Task } from '@nexora/schemas';
import { EventBus, ScopedFs, createLogger, slugify, titleCase, type NexoraEvents } from '@nexora/core';
import { ProjectMemory } from '@nexora/memory';
import { ArtifactStore } from '@nexora/artifacts';
import { Project } from '@nexora/project-engine';
import { planProject, orderTasks, type Plan } from '@nexora/agents';
import { renderDesignMd } from '@nexora/design-engine';
import { exportToDir } from '@nexora/code-engine';
import { serveStatic } from '@nexora/execution';
import { ChangeLog, GitEngine } from '@nexora/git';
import { Sandbox, DEFAULT_POLICY } from '@nexora/sandbox';
import { Metrics } from '@nexora/telemetry';
import type { Runtime } from './bootstrap.js';
import { renderReport, type RunReport } from './report.js';

const log = createLogger('orchestrator');

export interface RunOptions {
  brief: string;
  outDir: string;
  projectName?: string;
  autonomy?: 'guided' | 'balanced' | 'autonomous' | 'expert';
  answers?: Record<string, string>;
  directionChoice?: string;
  maxIterations?: number;
  usePreviewServer?: boolean;
  signal?: AbortSignal;
}

export interface RunOutcome { report: RunReport; reportMd: string; files: ArtifactFile[]; plan: Plan; }

/**
 * Autonomous Loop (plan FASE 12):
 * DISCOVERY → DESIGN → PROTOTYPE → REVIEW → CODE → RUN → VISION → QA → FIX → REGRESSION → VERIFY → DELIVER
 */
export class Orchestrator {
  readonly bus = new EventBus<NexoraEvents>();
  private metrics = new Metrics();

  constructor(private readonly runtime: Runtime) {}

  async run(opts: RunOptions): Promise<RunOutcome> {
    const started = Date.now();
    this.metrics.start('total');
    const autonomy = opts.autonomy ?? this.runtime.config.autonomy;
    const maxIterations = opts.maxIterations ?? this.runtime.config.maxIterations;

    this.bus.emit('phase', { phase: 'Understanding', detail: opts.brief.slice(0, 80) });
    const plan = planProject(opts.brief, autonomy);
    // titleCase directo: slugify eliminaría acentos del nombre visible.
    const projectName = opts.projectName ?? titleCase(deriveName(opts.brief));

    const project = await Project.create(opts.outDir, { brief: opts.brief, name: projectName, autonomy });
    const fs = project.fs;
    const memory = new ProjectMemory(fs);
    const artifacts = new ArtifactStore(fs);
    const changeLog = new ChangeLog(fs);

    // Preferencias explícitas del usuario → memoria (plan §47)
    for (const p of ProjectMemory.extractPreferences(opts.brief)) {
      await memory.remember({ kind: 'preference', decision: p.decision, doNot: p.doNot, source: 'brief' });
    }

    const ctx = {
      router: this.runtime.router, memory, skills: this.runtime.skills, bus: this.bus,
      log: log.child('agent'),
      state: {
        brief: opts.brief, intent: plan.intent, projectName, fs, issues: [] as Issue[],
        directionChoice: opts.directionChoice, buildOk: null as boolean | null, testsOk: null as boolean | null,
      } as Record<string, unknown>,
    };

    // Discovery: preguntas solo si el modo lo permite y hay respuestas pendientes
    this.bus.emit('phase', { phase: 'Planning', detail: `${plan.tasks.length} tareas` });
    for (const q of plan.questions.questions) {
      if (opts.answers?.[q.id]) continue;
      this.bus.emit('question', { id: q.id, question: q.question, options: q.options });
    }
    if (opts.answers) {
      const { applyAnswers } = await import('@nexora/design-engine');
      ctx.state.intent = applyAnswers(plan.intent, opts.answers);
    }
    for (const a of plan.questions.assumptions) {
      await memory.remember({ kind: 'project', decision: `Asunción (${a.field}): ${a.value}`, reason: a.reason, source: 'discovery' });
    }

    const tasks = orderTasks(plan.tasks);
    const results: AgentResult[] = [];
    let iterations = 0;
    let previewServer: Awaited<ReturnType<typeof serveStatic>> | null = null;

    for (const task of tasks) {
      if (opts.signal?.aborted) { task.status = 'cancelled'; continue; }
      if (task.type === 'discovery') { task.status = 'done'; continue; }

      if (task.type === 'execution') {
        task.status = 'running';
        this.bus.emit('phase', { phase: 'Running', detail: 'escribiendo y sirviendo el proyecto' });
        await this.writeProject(fs, ctx.state, projectName);
        if (opts.usePreviewServer !== false) {
          try {
            previewServer = await serveStatic(fs.resolve('site'));
            ctx.state.previewUrl = previewServer.url;
            this.metrics.inc('preview.started');
          } catch (e) { log.warn('no se pudo iniciar el preview', { error: (e as Error).message }); }
        }
        ctx.state.buildOk = true; // sitio estático: "build" = escritura correcta de archivos
        task.status = 'done';
        continue;
      }

      if (task.type === 'delivery') {
        task.status = 'running';
        // Bucle de reparación acotado (plan §26): nunca infinito.
        while (iterations < maxIterations && this.hasBlockingIssues(ctx.state.issues as Issue[])) {
          iterations++;
          this.bus.emit('phase', { phase: 'Fixing', detail: `iteración ${iterations}/${maxIterations}` });
          const coder = this.runtime.agents.get('coder')!;
          const repairTask: Task = { id: `repair-${iterations}`, type: 'repair', status: 'running', priority: 50, dependencies: [], input: {} };
          const r = await coder.run(repairTask, ctx as any);
          results.push(r);
          for (const c of r.changes) changeLog.record({ what: c.what, why: c.why, files: c.files, risk: c.risk, tests: c.tests, result: c.result });
          await this.writeProject(fs, ctx.state, projectName);
          const qa = this.runtime.agents.get('qa')!;
          const qaTask: Task = { id: `visual-qa-${iterations}`, type: 'visual-qa', status: 'running', priority: 60, dependencies: [], input: {} };
          results.push(await qa.run(qaTask, ctx as any));
          if (!this.improved(ctx.state)) break; // si no mejora, parar y reportar
        }
        task.status = 'done';
        continue;
      }

      const agent = this.runtime.agents.forTask(task.type);
      if (!agent) { task.status = 'skipped'; continue; }
      task.status = 'running';
      this.bus.emit('task', { id: task.id, status: 'running', type: task.type });
      try {
        const result = await this.metrics.time(`task:${task.type}`, () => agent.run(task, ctx as any));
        results.push(result);
        for (const c of result.changes) changeLog.record({ what: c.what, why: c.why, files: c.files, risk: c.risk, tests: c.tests, result: c.result });
        task.status = result.success ? 'done' : 'failed';
        task.output = result.summary;
      } catch (e) {
        task.status = 'failed';
        task.error = (e as Error).message;
        this.bus.emit('error', {
          where: task.type, what: (e as Error).message, tried: `agente ${agent.id}`,
          canDo: 'reintentar la tarea o revisar la configuración de proveedores',
          needs: 'decisión del usuario',
        });
        log.error(`tarea ${task.type} falló`, { error: (e as Error).message });
      }
      this.bus.emit('task', { id: task.id, status: task.status, type: task.type });
    }

    await this.writeProject(fs, ctx.state, projectName);
    if (previewServer) await previewServer.close();

    const files = (ctx.state.files as ArtifactFile[]) ?? [];
    const issues = (ctx.state.issues as Issue[]) ?? [];
    const qaReport = ctx.state.qaReport as any;

    // Artifact versionado + checkpoint git
    await artifacts.save({ id: project.manifest.slug, type: 'web', source: 'orchestrator', project: project.manifest.id, files });
    const sandbox = new Sandbox({ ...DEFAULT_POLICY, root: fs.resolve('site') });
    const git = new GitEngine(sandbox);
    await git.checkpoint('delivery').catch(() => null);
    await changeLog.persist();

    this.metrics.end('total');
    const report: RunReport = {
      project: projectName, brief: opts.brief,
      startedAt: new Date(started).toISOString(), finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      direction: String((ctx.state.direction as any)?.name ?? 'n/d'),
      tasks: tasks.map((t) => ({ id: t.id, type: t.type, status: t.status })),
      issues, unfixed: (ctx.state.unfixed as string[]) ?? [],
      gate: qaReport?.gate ?? { level: 'Not verified', verified: false, blocking: ['QA no ejecutado'], unverified: [], checklist: [] },
      scores: qaReport?.scores ?? {}, iterations,
      modelStats: { ...this.runtime.router.stats(), metrics: this.metrics.snapshot() },
      outputDir: opts.outDir,
      browserObserved: Boolean(qaReport?.observations?.some((o: any) => o.available)),
    };

    const reportMd = renderReport(report);
    await fs.write('REPORT.md', reportMd);
    await fs.writeJson('.nexora/reports/run.json', report);
    this.bus.emit('done', { verified: report.gate.verified, summary: report.gate.level });

    return { report, reportMd, files, plan };
  }

  private hasBlockingIssues(issues: Issue[]): boolean {
    return issues.some((i) => i.status === 'open' && (i.severity === 'critical' || i.severity === 'high'));
  }

  private improved(state: Record<string, unknown>): boolean {
    const issues = (state.issues as Issue[]) ?? [];
    const open = issues.filter((i) => i.status === 'open').length;
    const prev = (state.__prevOpen as number) ?? Infinity;
    state.__prevOpen = open;
    return open < prev;
  }

  /** Escribe el proyecto en disco: site/ + documentación + prototipo. */
  private async writeProject(fs: ScopedFs, state: Record<string, unknown>, projectName: string): Promise<void> {
    const files = (state.files as ArtifactFile[]) ?? [];
    if (files.length) await exportToDir(files, fs, 'site');
    const proto = (state.prototypeFiles as ArtifactFile[]) ?? [];
    if (proto.length) await exportToDir(proto, fs, 'prototype');
    if (state.designMd) await fs.write('DESIGN.md', renderDesignMd(state.designSystem as any));
    if (state.designSystem) await fs.writeJson('tokens.json', (state.designSystem as any).tokens);
    await fs.write('PROJECT.md', projectDoc(projectName, state));
  }
}

function deriveName(brief: string): string {
  const m = brief.match(/para (?:una?|el|la)\s+([^,.;]{3,40})/i);
  let raw = (m?.[1] ?? brief.split(/[,.]/)[0] ?? 'proyecto nexora').trim();
  // Corta en la primera preposición que introduce la lista de features:
  // "cafetería de especialidad con menú y reservas" → "cafetería de especialidad".
  raw = raw.split(/\s+(?:con|que|para|donde|y)\s+/i)[0] ?? raw;
  // Quita adjetivos de tono que no forman parte del nombre del negocio.
  raw = raw.replace(/\s*\b(premium|moderna?|elegante|juvenil|nueva?|sencilla?|profesional)\b/gi, '').trim();
  // Un nombre de marca no debería pasar de unas pocas palabras.
  const words = raw.split(/\s+/).filter(Boolean).slice(0, 5);
  return words.join(' ') || 'Proyecto NEXORA';
}

function projectDoc(name: string, state: Record<string, unknown>): string {
  const intent = state.intent as any;
  return `# ${name}

Proyecto generado y verificado por NEXORA.

## Brief
${String(state.brief ?? '')}

## Intención detectada
- Industria: ${intent?.industry}
- Acción principal: ${intent?.primaryAction}
- Personalidad: ${(intent?.personality ?? []).join(', ')}
- Funcionalidades: ${(intent?.features ?? []).join(', ') || 'ninguna explícita'}
- Idioma: ${intent?.language}
- Confianza del análisis: ${intent?.confidence}

## Estructura
- \`site/\` — sitio generado (abrir \`site/index.html\`)
- \`prototype/\` — prototipo de dirección visual
- \`DESIGN.md\` — Design System del proyecto
- \`tokens.json\` — design tokens
- \`REPORT.md\` — informe de QA y verificación
- \`.nexora/\` — memoria, artifacts, baselines, reportes

## Cómo ejecutar
\`\`\`bash
npx serve site   # o abrir site/index.html en el navegador
\`\`\`
`;
}
