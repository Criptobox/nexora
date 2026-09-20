/** Plan §14 — una skill es un archivo versionable, no un prompt escondido en el código. */
export interface SkillMeta {
  id: string;
  version: string;
  name: string;
  category: 'design' | 'ui' | 'visual' | 'code' | 'qa' | 'research';
  purpose: string;
  whenToUse: string[];
  inputs: string[];
  outputs: string[];
  permissions: string[];
}

export interface Skill extends SkillMeta {
  path: string;
  rules: string[];
  antiPatterns: string[];
  references: string[];
  validation: string[];
  examples: string[];
  body: string;
}

export function validateSkill(skill: Partial<Skill>): string[] {
  const errors: string[] = [];
  const required: (keyof Skill)[] = ['id', 'version', 'name', 'category', 'purpose'];
  for (const f of required) if (!skill[f]) errors.push(`skill: missing "${String(f)}"`);
  if (skill.rules && skill.rules.length === 0) errors.push('skill: rules section is empty');
  if (skill.version && !/^\d+\.\d+\.\d+$/.test(skill.version)) errors.push(`skill: invalid semver "${skill.version}"`);
  return errors;
}

/** Renderiza la skill como contexto para el modelo. */
export function skillToPrompt(skill: Skill): string {
  return [
    `### SKILL ${skill.id}@${skill.version} — ${skill.name}`,
    `Propósito: ${skill.purpose}`,
    skill.rules.length ? `Reglas:\n${skill.rules.map((r) => `- ${r}`).join('\n')}` : '',
    skill.antiPatterns.length ? `Anti-patterns (prohibido):\n${skill.antiPatterns.map((r) => `- ${r}`).join('\n')}` : '',
    skill.validation.length ? `Validación:\n${skill.validation.map((r) => `- ${r}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
}
