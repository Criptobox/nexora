/** Plan §66 — métricas de benchmark interno. */
export interface BenchmarkRecord {
  project: string;
  timeToFirstPreviewMs: number;
  timeToWorkingSiteMs: number;
  buildSuccess: boolean;
  visualIssueCount: number;
  repairSuccessRate: number;
  regressionRate: number;
  modelFailureRate: number;
  tokenUsage: number;
  costUsd: number;
}

export function summarize(records: BenchmarkRecord[]) {
  const n = records.length || 1;
  const avg = (f: (r: BenchmarkRecord) => number) => records.reduce((a, r) => a + f(r), 0) / n;
  return {
    projects: records.length,
    avgTimeToFirstPreviewMs: Math.round(avg((r) => r.timeToFirstPreviewMs)),
    avgTimeToWorkingSiteMs: Math.round(avg((r) => r.timeToWorkingSiteMs)),
    buildSuccessRate: records.filter((r) => r.buildSuccess).length / n,
    avgVisualIssues: Number(avg((r) => r.visualIssueCount).toFixed(2)),
    avgRepairSuccessRate: Number(avg((r) => r.repairSuccessRate).toFixed(2)),
    avgRegressionRate: Number(avg((r) => r.regressionRate).toFixed(2)),
    avgModelFailureRate: Number(avg((r) => r.modelFailureRate).toFixed(2)),
    totalTokens: records.reduce((a, r) => a + r.tokenUsage, 0),
    totalCostUsd: Number(records.reduce((a, r) => a + r.costUsd, 0).toFixed(4)),
  };
}
