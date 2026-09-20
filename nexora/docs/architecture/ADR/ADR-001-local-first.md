# ADR-001 — Local-first sin cuenta ni nube

**Estado:** Accepted · 2026-09-19

## Context

El plan (§50, §51) exige que proyecto, memoria, design system, skills, artifacts y logs
puedan existir localmente, y que NEXORA no necesite una cuenta para funcionar. La nube
debe ser opcional y no bloquear la versión local. Además, una herramienta de creación que
no arranca sin red es inusable en demos, aviones y redes corporativas.

## Decision

NEXORA v0.1 funciona **completa y offline**:

- Todo el estado vive en el filesystem, bajo `.nexora/` del proyecto.
- El proveedor `mock` es determinista y no necesita red ni claves.
- El generador de código y todo el pipeline de QA son deterministas.
- La UI se sirve desde el daemon local, sin CDNs ni fuentes remotas.
- No hay cuentas, telemetría remota ni llamadas de red no solicitadas.

## Alternatives

1. **Cloud-first con modo offline degradado** — más fácil de monetizar, pero contradice el plan y hace la herramienta inútil sin conexión.
2. **Exigir al menos una API key** — simplificaría el diseño (sin generador determinista), pero impide testear el loop end-to-end en CI y bloquea la primera experiencia.
3. **Híbrido con sincronización obligatoria** — complejidad de conflictos sin beneficio en v0.1.

## Consequences

**Positivas**
- El loop completo es testeable en CI sin secretos (7 tests E2E reales).
- La demo funciona siempre; nunca falla por cuota o red.
- Cero coste para empezar; privacidad por defecto.

**Negativas**
- Obliga a mantener un generador determinista además de la vía con modelo.
- Sin sincronización ni colaboración en v0.1.
- La calidad creativa sin modelo real está acotada por las plantillas.

**Mitigación:** la arquitectura de proveedores permite añadir modelos reales sin tocar el
resto; NEXORA Cloud queda declarado como FASE 19, no como requisito.
