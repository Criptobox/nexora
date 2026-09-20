export const MODEL_CAPABILITIES = [
  'TEXT', 'CODE', 'VISION', 'LONG_CONTEXT', 'REASONING', 'FAST', 'CHEAP', 'LOCAL', 'TOOL_USE', 'IMAGE',
] as const;
export type ModelCapability = (typeof MODEL_CAPABILITIES)[number];

export interface ModelCapabilities {
  supports: ModelCapability[];
  contextWindow: number;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}

export interface HealthStatus { ok: boolean; latencyMs?: number; detail?: string; checkedAt: string; }

export interface ModelMessage { role: 'system' | 'user' | 'assistant'; content: string; images?: string[]; }

export interface ModelRequest {
  messages: ModelMessage[];
  capabilities?: ModelCapability[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  signal?: AbortSignal;
  purpose?: string;
}

export type ModelEvent =
  | { type: 'delta'; text: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number; costUsd?: number }
  | { type: 'done'; text: string }
  | { type: 'error'; error: string };

/** Interfaz literal del plan §12. */
export interface ModelProvider {
  id: string;
  capabilities: ModelCapabilities;
  health(): Promise<HealthStatus>;
  generate(request: ModelRequest): AsyncIterable<ModelEvent>;
}
