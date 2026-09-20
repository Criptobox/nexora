import { mkdirSync, writeFileSync } from 'node:fs';
const pkgs = {
  schemas: [], core: ['schemas'], telemetry: ['core'], memory: ['core','schemas'],
  artifacts: ['core','schemas'], models: ['core','schemas'], router: ['core','models'],
  skills: ['core','schemas'], 'design-systems': ['core','schemas'],
  'design-engine': ['core','skills','design-systems','models','router'],
  'project-engine': ['core','artifacts','schemas'], sandbox: ['core'],
  execution: ['core','sandbox'], 'code-engine': ['core','design-engine','artifacts','router','models'],
  vision: ['core','execution'], qa: ['core','vision','execution','design-engine'],
  git: ['core'], agents: ['core','models','router','skills','memory','design-engine','code-engine','vision','qa','artifacts','project-engine','execution'],
  orchestrator: ['core','agents','router','models','memory','project-engine','design-engine','code-engine','execution','vision','qa','artifacts','git','telemetry','skills','design-systems','sandbox','schemas'],
};
for (const [name, deps] of Object.entries(pkgs)) {
  const dir = `packages/${name}`;
  mkdirSync(`${dir}/src`, { recursive: true });
  writeFileSync(`${dir}/package.json`, JSON.stringify({
    name: `@nexora/${name}`, version: '0.1.0', private: true, type: 'module',
    main: './dist/index.js', types: './dist/index.d.ts', exports: { '.': { types: './dist/index.d.ts', default: './dist/index.js' } },
    dependencies: Object.fromEntries(deps.map(d => [`@nexora/${d}`, '0.1.0'])),
    scripts: { build: 'tsc -b', test: 'node --test' }
  }, null, 2) + '\n');
  writeFileSync(`${dir}/tsconfig.json`, JSON.stringify({
    extends: '../../tsconfig.base.json',
    compilerOptions: { outDir: './dist', rootDir: './src' },
    include: ['src/**/*'],
    references: deps.map(d => ({ path: `../${d}` }))
  }, null, 2) + '\n');
}
const all = Object.keys(pkgs);
writeFileSync('tsconfig.build.json', JSON.stringify({
  files: [], references: [...all.map(p => ({ path: `packages/${p}` })), { path: 'apps/cli' }, { path: 'apps/daemon' }]
}, null, 2) + '\n');
writeFileSync('tsconfig.json', JSON.stringify({ extends: './tsconfig.base.json', files: [], references: [{path:'tsconfig.build.json'}] }, null, 2) + '\n');
console.log('scaffolded', all.length, 'packages');
