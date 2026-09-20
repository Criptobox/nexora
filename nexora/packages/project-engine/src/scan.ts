import { ScopedFs } from '@nexora/core';

/** Plan §28 — Existing Project Mode: entender antes de tocar. */
export interface ScanResult {
  framework: string;
  packageManager: string;
  entryPoints: string[];
  pages: string[];
  components: string[];
  assets: string[];
  styles: string[];
  tests: string[];
  configs: string[];
  dependencies: string[];
  scripts: Record<string, string>;
  hasGit: boolean;
  buildSystem: string;
  fileCount: number;
}

export async function scanProject(fs: ScopedFs): Promise<ScanResult> {
  const files = await fs.list('.', { recursive: true });
  const has = (p: string) => files.includes(p);
  const read = async <T>(p: string): Promise<T | null> => { try { return await fs.readJson<T>(p); } catch { return null; } };

  const pkg = await read<any>('package.json');
  const deps = pkg ? Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }) : [];

  const framework =
    deps.includes('next') ? 'next'
    : deps.includes('nuxt') ? 'nuxt'
    : deps.includes('@sveltejs/kit') ? 'sveltekit'
    : deps.includes('astro') ? 'astro'
    : deps.includes('react') ? 'react'
    : deps.includes('vue') ? 'vue'
    : files.some((f) => f.endsWith('.html')) ? 'static'
    : 'unknown';

  const packageManager =
    has('pnpm-lock.yaml') ? 'pnpm' : has('yarn.lock') ? 'yarn' : has('bun.lockb') ? 'bun' : pkg ? 'npm' : 'none';

  const buildSystem =
    deps.includes('vite') ? 'vite' : deps.includes('webpack') ? 'webpack'
    : framework === 'next' ? 'next' : framework === 'static' ? 'none' : 'unknown';

  const isIn = (f: string, ...dirs: string[]) => dirs.some((d) => f.startsWith(`${d}/`) || f.includes(`/${d}/`));

  return {
    framework, packageManager, buildSystem,
    entryPoints: files.filter((f) => /^(index\.html|src\/(main|index)\.(t|j)sx?|app\/page\.(t|j)sx?)$/.test(f)),
    pages: files.filter((f) => isIn(f, 'pages', 'routes') || /^app\/.*page\.(t|j)sx?$/.test(f) || (f.endsWith('.html') && !isIn(f, 'node_modules'))),
    components: files.filter((f) => isIn(f, 'components') && /\.(t|j)sx?|\.vue|\.svelte$/.test(f)),
    assets: files.filter((f) => /\.(png|jpe?g|svg|webp|avif|gif|woff2?|mp4)$/.test(f)),
    styles: files.filter((f) => /\.(css|scss|sass|less)$/.test(f)),
    tests: files.filter((f) => /\.(test|spec)\.[tj]sx?$/.test(f) || isIn(f, 'tests', '__tests__')),
    configs: files.filter((f) => /^(package\.json|tsconfig.*\.json|vite\.config\.[tj]s|next\.config\.[tjm]s|tailwind\.config\.[tj]s|\.eslintrc.*)$/.test(f)),
    dependencies: deps,
    scripts: pkg?.scripts ?? {},
    hasGit: await fs.exists('.git'),
    fileCount: files.length,
  };
}
