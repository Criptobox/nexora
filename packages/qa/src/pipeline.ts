import type { DesignSystem, Issue } from '@nexora/schemas';
import { analyzeVisual, BrowserAgent, VIEWPORTS, type BrowserObservation } from '@nexora/vision';
import { detectAntiPatterns } from '@nexora/design-engine';
import { codeQa } from './code-qa.js';
import { expectationsFor, functionalQa } from './functional-qa.js';
import { performanceQa } from './performance.js';
import { RegressionEngine } from './regression.js';
import { verificationGate, type GateResult } from './verification-gate.js';
import { ScopedFs, createLogger } from '@nexora/core';

const log = createLogger('qa:pipeline');

export interface QaInput {
  files: Array<{ path: string; contents: string }>;
  designSystem?: DesignSystem;
  features: string[];
  primaryAction: string;
  fs: ScopedFs;
  previewUrl?: string;
  screenshotDir?: string;
  buildOk?: boolean | null;
  testsOk?: boolean | null;
}

export interface QaReport {
  issues: Issue[];
  scores: Record<string, number>;
  observations: BrowserObservation[];
  gate: GateResult;
  byCategory: Record<string, number>;
}

/** Plan §36 — pipeline completo: código, runtime, funcional, responsive, a11y, visual, regresión. */
export async function runQaPipeline(input: QaInput): Promise<QaReport> {
  const html = input.files.filter((f) => /\.html?$/.test(f.path)).map((f) => f.contents).join('\n');
  const css = input.files.filter((f) => /\.css$/.test(f.path)).map((f) => f.contents).join('\n');

  const observations: BrowserObservation[] = [];
  if (input.previewUrl) {
    const agent = new BrowserAgent();
    for (const vp of VIEWPORTS) {
      const shot = input.screenshotDir ? `${input.fs.resolve(input.screenshotDir)}/${vp.name}.png` : undefined;
      if (input.screenshotDir) await input.fs.ensureDir(input.screenshotDir);
      observations.push(await agent.observe(input.previewUrl, vp, shot));
    }
    await agent.close();
  }

  const vision = analyzeVisual({ html, css, designSystem: input.designSystem, observations });
  const regression = new RegressionEngine(input.fs);
  const reg = await regression.compare('index', html);

  const issues: Issue[] = [
    ...codeQa(input.files),
    ...detectAntiPatterns(html, css, input.designSystem),
    ...functionalQa(html, expectationsFor(input.features, input.primaryAction)),
    ...performanceQa(input.files),
    ...vision.issues,
    ...reg.issues,
  ];

  const openOf = (cat: string[]) => issues.filter((i) => cat.includes(i.category) && i.status === 'open');
  const hasBlocking = (cat: string[]) => openOf(cat).some((i) => i.severity === 'critical' || i.severity === 'high');

  const consoleClean = observations.some((o) => o.available)
    ? observations.every((o) => !o.available || o.consoleErrors.length === 0) : null;

  const gate = verificationGate({
    requirementsMet: !openOf(['Interaction']).some((i) => i.severity === 'critical'),
    buildOk: input.buildOk ?? null,
    testsOk: input.testsOk ?? null,
    consoleClean,
    visualQaPassed: !hasBlocking(['Hierarchy', 'Composition', 'Typography', 'Spacing', 'Color', 'Consistency', 'Brand alignment']),
    responsivePassed: !hasBlocking(['Responsive']),
    accessibilityPassed: !hasBlocking(['Accessibility']),
    regressionPassed: reg.hasBaseline ? reg.issues.length === 0 : null,
    changesSaved: true,
    issues,
  });

  const byCategory: Record<string, number> = {};
  for (const i of issues) byCategory[i.category] = (byCategory[i.category] ?? 0) + 1;

  log.info(`QA: ${issues.length} issues — gate: ${gate.level}`);
  return { issues, scores: vision.scores, observations, gate, byCategory };
}
