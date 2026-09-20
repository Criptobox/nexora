import { Sandbox } from '@nexora/sandbox';
import { createLogger } from '@nexora/core';

const log = createLogger('git');

/** Plan §34 — checkpoint antes de cambios importantes, rollback si algo falla. */
export class GitEngine {
  constructor(private readonly sandbox: Sandbox) {}

  private async git(...args: string[]) { return this.sandbox.exec('git', args); }

  async isRepo(): Promise<boolean> { return (await this.git('rev-parse', '--is-inside-work-tree')).code === 0; }
  async init(): Promise<boolean> {
    if (await this.isRepo()) {
      // El repo ya existe (o estamos dentro de uno): aun así hay que garantizar la
      // identidad local, o `commit` falla con "Author identity unknown" cuando el
      // usuario no tiene configuración global de git.
      await this.ensureIdentity();
      return true;
    }
    const r = await this.git('init', '-q');
    await this.ensureIdentity();
    return r.code === 0;
  }

  /** Identidad local del repo. No toca la configuración global del usuario. */
  private async ensureIdentity(): Promise<void> {
    const email = await this.git('config', '--get', 'user.email');
    if (email.code !== 0 || !email.stdout.trim()) {
      await this.git('config', 'user.email', 'nexora@localhost');
    }
    const name = await this.git('config', '--get', 'user.name');
    if (name.code !== 0 || !name.stdout.trim()) {
      await this.git('config', 'user.name', 'NEXORA');
    }
  }
  async status(): Promise<string> { return (await this.git('status', '--porcelain')).stdout.trim(); }
  async diff(): Promise<string> { return (await this.git('diff')).stdout; }
  async branch(name: string): Promise<boolean> { return (await this.git('checkout', '-B', name)).code === 0; }
  async commit(message: string): Promise<string | null> {
    await this.git('add', '-A');
    // Sin cambios que confirmar no es un fallo: el árbol ya está en el estado deseado,
    // así que el checkpoint es el HEAD actual. git sale con código 1 igualmente.
    if (!(await this.status())) {
      const head = await this.git('rev-parse', 'HEAD');
      return head.code === 0 ? head.stdout.trim() : null;
    }
    const r = await this.git('commit', '-m', message, '--no-verify');
    if (r.code !== 0) {
      log.warn('commit failed', { stderr: (r.stderr || r.stdout).slice(0, 200) });
      return null;
    }
    return (await this.git('rev-parse', 'HEAD')).stdout.trim();
  }
  /** Checkpoint: commit etiquetado al que se puede volver. */
  async checkpoint(label: string): Promise<string | null> {
    await this.init();
    return this.commit(`checkpoint(${label}): ${new Date().toISOString()}`);
  }
  async rollback(ref: string): Promise<boolean> { return (await this.git('reset', '--hard', ref)).code === 0; }
  async log(n = 10): Promise<string[]> {
    return (await this.git('log', `-${n}`, '--pretty=%h %s')).stdout.split('\n').filter(Boolean);
  }
}
