import { ProviderRegistry, MockProvider, OpenAIProvider, AnthropicProvider, GoogleProvider, OllamaProvider, OpenRouterProvider } from '@nexora/models';
import { ModelRouter } from '@nexora/router';
import { SkillRegistry, loadSkillsFromDir } from '@nexora/skills';
import { DesignSystemRegistry } from '@nexora/design-systems';
import { AgentRegistry, designerAgent, coderAgent, criticAgent, qaAgent, researcherAgent } from '@nexora/agents';
import { ScopedFs, loadConfig, type NexoraConfig } from '@nexora/core';

export interface Runtime {
  config: NexoraConfig;
  providers: ProviderRegistry;
  router: ModelRouter;
  skills: SkillRegistry;
  designSystems: DesignSystemRegistry;
  agents: AgentRegistry;
}

/** Arranque del sistema: registra proveedores disponibles y carga skills desde disco. */
export async function bootstrap(opts: { repoRoot?: string; config?: Partial<NexoraConfig> } = {}): Promise<Runtime> {
  const config = loadConfig(process.env, opts.config);

  const providers = new ProviderRegistry();
  providers.register(new MockProvider('mock'));
  if (process.env.OPENAI_API_KEY) providers.register(new OpenAIProvider());
  if (process.env.ANTHROPIC_API_KEY) providers.register(new AnthropicProvider());
  if (process.env.GOOGLE_API_KEY) providers.register(new GoogleProvider());
  if (process.env.OPENROUTER_API_KEY) providers.register(new OpenRouterProvider());
  if (process.env.OLLAMA_BASE_URL) providers.register(new OllamaProvider());

  const router = new ModelRouter(providers, {
    maxRetries: 1, timeoutMs: 120_000,
    fallbackOrder: [config.defaultProvider, 'anthropic', 'openai', 'google', 'ollama', 'mock'],
  });

  const skills = new SkillRegistry();
  const designSystems = new DesignSystemRegistry();
  if (opts.repoRoot) {
    const fs = new ScopedFs(opts.repoRoot);
    skills.registerAll(await loadSkillsFromDir(fs, 'skills'));
    await designSystems.loadFrom(fs, 'design-systems');
  }

  const agents = new AgentRegistry();
  agents.register(designerAgent).register(coderAgent).register(criticAgent).register(qaAgent).register(researcherAgent);

  return { config, providers, router, skills, designSystems, agents };
}
