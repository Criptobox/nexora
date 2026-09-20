export const TASK_TYPES = [
  'discovery', 'design-direction', 'design-system', 'prototype', 'visual-review',
  'implementation', 'execution', 'visual-qa', 'functional-qa', 'regression',
  'repair', 'delivery', 'scan', 'memory', 'research',
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = ['pending', 'running', 'blocked', 'done', 'failed', 'cancelled', 'skipped'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Contrato literal del plan §60. */
export type Task = {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: number;
  dependencies: string[];
  input: unknown;
  output?: unknown;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
};

export type Change = {
  id: string;
  what: string;
  why: string;
  files: string[];
  risk: 'low' | 'medium' | 'high';
  tests: string[];
  result: 'applied' | 'reverted' | 'failed';
};

export type Evidence = {
  kind: 'file' | 'line' | 'screenshot' | 'test' | 'command' | 'browser' | 'metric';
  ref: string;
  detail?: string;
};

export type AgentResult = {
  success: boolean;
  changes: Change[];
  artifacts: import('./artifact.js').Artifact[];
  issues: import('./issue.js').Issue[];
  evidence: Evidence[];
  summary?: string;
};
