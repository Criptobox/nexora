export interface NexoraConfig {
  defaultProvider: string;
  maxIterations: number;
  autonomy: 'guided' | 'balanced' | 'autonomous' | 'expert';
  sandboxNetwork: 'deny' | 'allowlist' | 'allow';
  networkAllowlist: string[];
  home: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env, overrides: Partial<NexoraConfig> = {}): NexoraConfig {
  return {
    defaultProvider: env.NEXORA_DEFAULT_PROVIDER ?? 'mock',
    maxIterations: Number(env.NEXORA_MAX_ITERATIONS ?? 3),
    autonomy: (env.NEXORA_AUTONOMY as NexoraConfig['autonomy']) ?? 'balanced',
    sandboxNetwork: (env.NEXORA_SANDBOX_NETWORK as NexoraConfig['sandboxNetwork']) ?? 'deny',
    networkAllowlist: (env.NEXORA_NETWORK_ALLOWLIST ?? '').split(',').filter(Boolean),
    home: env.NEXORA_HOME ?? '.nexora',
    logLevel: (env.NEXORA_LOG_LEVEL as NexoraConfig['logLevel']) ?? 'info',
    ...overrides,
  };
}
