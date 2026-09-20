/** Paridad con el daemon: intención, discovery y direcciones sin ejecutar el run. */
import { analyzeIntent, planDiscovery, generateDirections } from '../packages/design-engine/dist/index.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'usa POST' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const brief = String(body.brief ?? '').trim();
    if (!brief) return res.status(400).json({ error: 'brief requerido' });

    const intent = analyzeIntent(brief);
    res.status(200).json({
      intent,
      discovery: planDiscovery(intent, body.autonomy ?? 'balanced'),
      directions: generateDirections(intent, 3),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, where: 'api/plan' });
  }
}
