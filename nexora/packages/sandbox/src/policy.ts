/** Plan §32/§33 — ningún modelo tiene permisos ilimitados. */
export interface SandboxPolicy {
  root: string;
  allowedCommands: string[];
  deniedPatterns: RegExp[];
  network: 'deny' | 'allowlist' | 'allow';
  networkAllowlist: string[];
  timeoutMs: number;
  maxOutputBytes: number;
  maxMemoryMb: number;
  env: Record<string, string>;
}

export const DEFAULT_POLICY: SandboxPolicy = {
  root: process.cwd(),
  allowedCommands: ['node', 'npm', 'npx', 'pnpm', 'yarn', 'tsc', 'vite', 'playwright', 'git', 'ls', 'cat', 'echo'],
  deniedPatterns: [
    /rm\s+-rf\s+\//, /:\(\)\{.*\};:/, /mkfs/, /dd\s+if=/, /shutdown|reboot|halt/,
    /curl[^|]*\|\s*(ba)?sh/, /wget[^|]*\|\s*(ba)?sh/, /chmod\s+777\s+\//,
    /\bsudo\b/, /\/etc\/passwd/, /~\/\.ssh/, /\.aws\/credentials/, /history\s+-c/,
    />\s*\/dev\/(sd|nvme)/, /\bnc\s+-l/, /base64\s+-d.*\|\s*(ba)?sh/,
  ],
  network: 'deny',
  networkAllowlist: ['registry.npmjs.org', 'localhost', '127.0.0.1'],
  timeoutMs: 120_000,
  maxOutputBytes: 1_000_000,
  maxMemoryMb: 2048,
  env: {},
};

/** Secretos nunca se propagan al sandbox (plan §33). */
const SECRET_KEY_RE = /(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTH)/i;

export function sanitizeEnv(env: NodeJS.ProcessEnv, policy: SandboxPolicy): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) continue;
    if (SECRET_KEY_RE.test(k)) continue;
    out[k] = v;
  }
  return { ...out, ...policy.env, NEXORA_SANDBOX: '1', CI: '1' };
}

export function redactSecrets(text: string): string {
  return text
    .replace(/(sk-[A-Za-z0-9_-]{8,})/g, 'sk-***REDACTED***')
    .replace(/(ghp_[A-Za-z0-9]{8,})/g, 'ghp_***REDACTED***')
    .replace(/(AIza[A-Za-z0-9_-]{10,})/g, 'AIza***REDACTED***')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{10,}/gi, '$1***REDACTED***');
}
