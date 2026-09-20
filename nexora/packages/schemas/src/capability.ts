/** Estados explícitos de una capacidad (plan §1.2). Nunca declarar VERIFIED sin evidencia. */
export const CAPABILITY_STATES = [
  'PLANNED', 'DESIGNED', 'IMPLEMENTING', 'TESTING',
  'VERIFIED', 'PARTIAL', 'BLOCKED', 'DEPRECATED',
] as const;
export type CapabilityState = (typeof CAPABILITY_STATES)[number];

/** Lenguaje de verificación permitido (plan §63). */
export const VERIFICATION_LEVELS = [
  'Implemented', 'Tested', 'Verified', 'Partially verified', 'Not verified', 'Blocked',
] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export interface Capability {
  id: string;
  name: string;
  state: CapabilityState;
  implementation?: string;
  test?: string;
  acceptance: string;
  notes?: string;
}
