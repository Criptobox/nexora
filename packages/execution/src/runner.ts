import { Sandbox, type ExecResult } from '@nexora/sandbox';
import { createLogger } from '@nexora/core';

const log = createLogger('execution');

export interface RunSummary { step: string; ok: boolean; result?: ExecResult; skipped?: string; }

/** Plan §31 — install / build / dev / test / lint / typecheck, siempre en sandbox. */
export class ExecutionEngine {
  constructor(private readonly sandbox: Sandbox) {}

  private async hasScript(name: string): Promise<boolean> {
    try {
      const pkg = await this.sandbox.fs.readJson<any>('package.json');
      return Boolean(pkg?.scripts?.[name]);
    } catch { return false; }
  }

  private async npm(script: string, step: string): Promise<RunSummary> {
    if (!(await this.hasScript(script))) return { step, ok: true, skipped: `no npm script "${script}"` };
    const result = await this.sandbox.exec('npm', ['run', script, '--silent']);
    return { step, ok: result.code === 0, result };
  }

  async install(): Promise<RunSummary> {
    if (!(await this.sandbox.fs.exists('package.json'))) return { step: 'install', ok: true, skipped: 'no package.json' };
    const result = await this.sandbox.exec('npm', ['install', '--no-audit', '--no-fund'], { timeoutMs: 300_000 });
    return { step: 'install', ok: result.code === 0, result };
  }
  typecheck() { return this.npm('typecheck', 'typecheck'); }
  lint() { return this.npm('lint', 'lint'); }
  test() { return this.npm('test', 'test'); }
  build() { return this.npm('build', 'build'); }

  /** Pipeline base; se detiene en el primer fallo crítico. */
  async pipeline(steps: Array<keyof ExecutionEngine> = ['install', 'typecheck', 'lint', 'test', 'build']): Promise<RunSummary[]> {
    const out: RunSummary[] = [];
    for (const step of steps) {
      const fn = this[step] as unknown as () => Promise<RunSummary>;
      const r = await fn.call(this);
      out.push(r);
      log.info(`step ${r.step}: ${r.ok ? 'ok' : 'FAIL'}${r.skipped ? ` (${r.skipped})` : ''}`);
      if (!r.ok) break;
    }
    return out;
  }
}
