export const ISSUE_CATEGORIES = [
  'Hierarchy', 'Composition', 'Typography', 'Spacing', 'Color', 'Consistency',
  'Responsive', 'Accessibility', 'Interaction', 'Brand alignment',
  'Code', 'Build', 'Runtime', 'Performance', 'Security', 'Regression',
] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Plan §25: cada problema se convierte en tarea accionable con evidencia. */
export interface Issue {
  id: string;
  category: IssueCategory;
  title: string;
  severity: IssueSeverity;
  location: string;
  suggestedFix: string;
  evidence: import('./task.js').Evidence[];
  status: 'open' | 'fixed' | 'wontfix' | 'deferred';
}
