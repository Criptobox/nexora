import { createLogger } from '@nexora/core';

const log = createLogger('vision:browser');

export interface BrowserObservation {
  url: string;
  viewport: { width: number; height: number; name: string };
  screenshotPath?: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  failedRequests: string[];
  overflowX: boolean;
  documentHeight: number;
  smallTapTargets: number;
  available: boolean;
  reason?: string;
}

export const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

/**
 * Plan §38 — Browser Agent. Playwright es opcional: si no está instalado,
 * se reporta `available:false` y el QA degrada a análisis estático,
 * NUNCA se inventa que se observó el navegador (plan §63).
 */
export class BrowserAgent {
  private playwright: any = null;
  private browser: any = null;

  async init(): Promise<boolean> {
    if (this.browser) return true;
    try {
      this.playwright = await import('playwright' as string);
      this.browser = await this.playwright.chromium.launch({ args: ['--no-sandbox'] });
      return true;
    } catch (e) {
      log.warn('playwright no disponible — Visual QA usará análisis estático', { error: (e as Error).message });
      return false;
    }
  }

  async observe(url: string, viewport: { name: string; width: number; height: number }, screenshotPath?: string): Promise<BrowserObservation> {
    const base: BrowserObservation = {
      url, viewport, consoleErrors: [], consoleWarnings: [], failedRequests: [],
      overflowX: false, documentHeight: 0, smallTapTargets: 0, available: false,
    };
    if (!(await this.init())) return { ...base, reason: 'playwright not installed' };

    const context = await this.browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const consoleErrors: string[] = [], consoleWarnings: string[] = [], failedRequests: string[] = [];
    page.on('console', (m: any) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
      if (m.type() === 'warning') consoleWarnings.push(m.text());
    });
    page.on('pageerror', (e: Error) => consoleErrors.push(e.message));
    page.on('requestfailed', (r: any) => failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`));

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const small = Array.prototype.slice.call(document.querySelectorAll('a,button,[role="button"],input,select'))
          .filter((el) => { const r = (el as HTMLElement).getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44); }).length;
        return { overflowX: doc.scrollWidth > doc.clientWidth + 1, documentHeight: doc.scrollHeight, smallTapTargets: small };
      });
      await context.close();
      return { ...base, ...metrics, consoleErrors, consoleWarnings, failedRequests, screenshotPath, available: true };
    } catch (e) {
      await context.close().catch(() => {});
      return { ...base, reason: (e as Error).message, consoleErrors, consoleWarnings, failedRequests };
    }
  }

  async close(): Promise<void> { if (this.browser) { await this.browser.close(); this.browser = null; } }
}
