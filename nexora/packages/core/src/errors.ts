export class NexoraError extends Error {
  constructor(message: string, readonly code: string, readonly detail?: unknown) {
    super(message);
    this.name = 'NexoraError';
  }
}
export class SandboxViolation extends NexoraError {
  constructor(message: string, detail?: unknown) { super(message, 'SANDBOX_VIOLATION', detail); }
}
export class PermissionDenied extends NexoraError {
  constructor(message: string, detail?: unknown) { super(message, 'PERMISSION_DENIED', detail); }
}
export class ProviderError extends NexoraError {
  constructor(message: string, detail?: unknown) { super(message, 'PROVIDER_ERROR', detail); }
}
export class VerificationFailed extends NexoraError {
  constructor(message: string, detail?: unknown) { super(message, 'NOT_VERIFIED', detail); }
}
