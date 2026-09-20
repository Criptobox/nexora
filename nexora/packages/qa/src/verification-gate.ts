import type { Issue, VerificationLevel } from '@nexora/schemas';

/** Plan §62/§63 — no se puede declarar DONE sin comprobaciones. */
export interface GateInput {
  requirementsMet: boolean;
  buildOk: boolean | null;
  testsOk: boolean | null;
  consoleClean: boolean | null;
  visualQaPassed: boolean | null;
  responsivePassed: boolean | null;
  accessibilityPassed: boolean | null;
  regressionPassed: boolean | null;
  changesSaved: boolean;
  issues: Issue[];
}

export interface GateResult {
  level: VerificationLevel;
  verified: boolean;
  blocking: string[];
  unverified: string[];
  checklist: Array<{ check: string; status: 'pass' | 'fail' | 'unknown' }>;
}

export function verificationGate(input: GateInput): GateResult {
  const checks: Array<[string, boolean | null]> = [
    ['Requirement complete', input.requirementsMet],
    ['Build works', input.buildOk],
    ['Tests pass', input.testsOk],
    ['No critical console errors', input.consoleClean],
    ['Visual QA passed', input.visualQaPassed],
    ['Responsive passed', input.responsivePassed],
    ['Accessibility passed', input.accessibilityPassed],
    ['Regression passed', input.regressionPassed],
    ['Changes saved', input.changesSaved],
  ];
  const checklist = checks.map(([check, v]) => ({ check, status: (v === null ? 'unknown' : v ? 'pass' : 'fail') as 'pass' | 'fail' | 'unknown' }));
  const blocking = checklist.filter((c) => c.status === 'fail').map((c) => c.check);
  const unverified = checklist.filter((c) => c.status === 'unknown').map((c) => c.check);
  const criticalIssues = input.issues.filter((i) => i.severity === 'critical' && i.status === 'open');
  if (criticalIssues.length) blocking.push(`${criticalIssues.length} issue(s) críticos abiertos`);

  const level: VerificationLevel =
    blocking.length ? 'Not verified'
    : unverified.length === 0 ? 'Verified'
    : unverified.length <= 3 ? 'Partially verified'
    : 'Tested';

  return { level, verified: level === 'Verified', blocking, unverified, checklist };
}
