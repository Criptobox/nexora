import { spawn } from 'node:child_process';
import path from 'node:path';
import { SandboxViolation, createLogger, ScopedFs } from '@nexora/core';
import { DEFAULT_POLICY, redactSecrets, sanitizeEnv, type SandboxPolicy } from './policy.js';

const log = createLogger('sandbox');

export interface ExecResult {
  command: string; args: string[]; code: number | null; signal: string | null;
  stdout: string; stderr: string; durationMs: number; timedOut: boolean;
}

/** Ejecución controlada: allowlist de binarios, sin shell, cwd confinado, sin secretos. */
export class Sandbox {
  readonly fs: ScopedFs;
  constructor(readonly policy: SandboxPolicy = DEFAULT_POLICY) { this.fs = new ScopedFs(policy.root); }

  assertAllowed(command: string, args: string[]): void {
    const full = [command, ...args].join(' ');
    const bin = path.basename(command);
    if (!this.policy.allowedCommands.includes(bin)) {
      throw new SandboxViolation(`command not allowed: ${bin}`, { allowed: this.policy.allowedCommands });
    }
    for (const re of this.policy.deniedPatterns) {
      if (re.test(full)) throw new SandboxViolation(`denied pattern matched: ${re}`, { command: full });
    }
    for (const a of args) {
      if (a.includes('..') && !a.startsWith('--')) {
        const abs = path.resolve(this.policy.root, a);
        if (!abs.startsWith(path.resolve(this.policy.root))) throw new SandboxViolation(`path escapes sandbox root: ${a}`);
      }
    }
  }

  async exec(command: string, args: string[] = [], opts: { cwd?: string; timeoutMs?: number; input?: string } = {}): Promise<ExecResult> {
    this.assertAllowed(command, args);
    const cwd = opts.cwd ? this.fs.resolve(opts.cwd) : this.policy.root;
    const timeoutMs = opts.timeoutMs ?? this.policy.timeoutMs;
    const started = Date.now();

    return new Promise<ExecResult>((resolve) => {
      const child = spawn(command, args, {
        cwd, env: sanitizeEnv(process.env, this.policy),
        shell: false, stdio: ['pipe', 'pipe', 'pipe'],
      });
      let stdout = '', stderr = '', timedOut = false;
      const cap = this.policy.maxOutputBytes;
      const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);

      child.stdout.on('data', (d) => { if (stdout.length < cap) stdout += d.toString(); });
      child.stderr.on('data', (d) => { if (stderr.length < cap) stderr += d.toString(); });
      child.on('error', (e) => { stderr += `\n${e.message}`; });
      if (opts.input) { child.stdin.write(opts.input); child.stdin.end(); } else child.stdin.end();

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        const result: ExecResult = {
          command, args, code, signal, timedOut,
          stdout: redactSecrets(stdout), stderr: redactSecrets(stderr),
          durationMs: Date.now() - started,
        };
        log.debug(`exec ${command} ${args.join(' ')} → ${code}`, { ms: result.durationMs });
        resolve(result);
      });
    });
  }

  isHostAllowed(host: string): boolean {
    if (this.policy.network === 'allow') return true;
    if (this.policy.network === 'deny') return ['localhost', '127.0.0.1'].includes(host);
    return this.policy.networkAllowlist.includes(host);
  }
}
