import { bootstrap } from '../packages/orchestrator/dist/index.js';
import { NEXORA_VERSION } from '../packages/core/dist/index.js';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
let runtimePromise;

export default async function handler(req, res) {
  try {
    runtimePromise ??= bootstrap({ repoRoot });
    const rt = await runtimePromise;
    res.status(200).json({
      ok: true,
      version: NEXORA_VERSION,
      providers: rt.providers.ids(),
      skills: rt.skills.list().length,
      agents: rt.agents.list().map((a) => a.id),
      deploy: 'serverless',
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
