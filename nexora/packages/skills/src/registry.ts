import { createLogger } from '@nexora/core';
import { validateSkill, skillToPrompt, type Skill } from './skill.js';

const log = createLogger('skills:registry');

export class SkillRegistry {
  private skills = new Map<string, Skill>();

  register(skill: Skill): this {
    const errors = validateSkill(skill);
    if (errors.length) { log.warn(`skill ${skill.id} rejected`, errors); return this; }
    this.skills.set(skill.id, skill);
    return this;
  }
  registerAll(skills: Skill[]): this { for (const s of skills) this.register(s); return this; }
  get(id: string): Skill | undefined { return this.skills.get(id); }
  list(category?: Skill['category']): Skill[] {
    return [...this.skills.values()].filter((s) => !category || s.category === category);
  }

  /** Discovery: puntúa skills contra un brief (plan FASE 5). */
  select(brief: string, opts: { categories?: Skill['category'][]; limit?: number } = {}): Skill[] {
    const text = brief.toLowerCase();
    const scored = this.list().filter((s) => !opts.categories || opts.categories.includes(s.category)).map((s) => {
      let score = 0;
      for (const cue of [...s.whenToUse, s.name, s.id]) {
        for (const word of cue.toLowerCase().split(/[^a-záéíóúñ0-9]+/).filter((w) => w.length > 3)) {
          if (text.includes(word)) score += 2;
        }
      }
      if (s.category === 'visual' || s.category === 'qa') score += 1; // siempre útiles
      return { s, score };
    }).sort((a, b) => b.score - a.score);
    return scored.filter((x) => x.score > 0).slice(0, opts.limit ?? 5).map((x) => x.s);
  }

  prompt(skills: Skill[]): string { return skills.map(skillToPrompt).join('\n\n---\n\n'); }
}
