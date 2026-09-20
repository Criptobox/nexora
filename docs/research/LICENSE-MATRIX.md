# LICENSE-MATRIX.md

Procedimiento obligatorio antes de reutilizar cualquier código (plan §76):

1. identificar repositorio → 2. identificar licencia → 3. comprobar archivos incluidos →
4. revisar restricciones → 5. conservar atribución → 6. documentar procedencia →
7. evitar mezclar licencias incompatibles.

## Estado actual de NEXORA

| Componente | Origen | Licencia | Usado para | ¿Modificado? | ¿Atribución? |
|---|---|---|---|---|---|
| Todo el código de `packages/` y `apps/` | Propio | Apache-2.0 | Motor completo | — | — |
| Skills (`skills/*/SKILL.md`) | Propio | Apache-2.0 | Reglas de diseño y QA | — | — |
| Direcciones visuales (`design-systems/*.json`) | Propio | Apache-2.0 | Catálogo de diseño | — | — |
| Node.js stdlib | Node.js | MIT | Runtime | No | No |
| TypeScript | Microsoft | Apache-2.0 | Build (devDependency) | No | No |
| `@types/node` | DefinitelyTyped | MIT | Tipos (devDependency) | No | No |
| Playwright | Microsoft | Apache-2.0 | Visual QA (opcional, no incluido) | No | No |

**Dependencias de runtime: cero.** Ver ADR-008.

## Ideas adoptadas sin código

Las ideas y patrones arquitectónicos no son objeto de copyright; el código y los assets sí.
Estas referencias han inspirado arquitectura **sin reutilización de código**:

| Fuente | Idea adoptada | Código reutilizado |
|---|---|---|
| OpenDesign | Flujo artifact-first, `DESIGN.md`, skills como archivos | Ninguno |
| OpenDesign Design Intelligence | Sistemas visuales como datos consultables | Ninguno |
| FORJA-IA | Project Map, Visual QA, Web Studio (conceptos) | Ninguno |
| Claude Design | Auto-crítica antes de entregar | Ninguno |
| Google Stitch | Ofrecer varias direcciones visuales | Ninguno |

## Fuentes tipográficas

El CSS generado referencia familias por nombre (`'Inter'`, `'Playfair Display'`, `'Space
Grotesk'`…) con fallback de sistema. **No se incluyen archivos de fuente** en el repositorio.
Si un proyecto necesita autoalojarlas, debe verificar su licencia (la mayoría son SIL OFL,
que permite uso comercial y web con atribución en el archivo de licencia de la fuente).

## Antes de aceptar código externo

- [ ] Licencia identificada y compatible con Apache-2.0.
- [ ] Añadido a `THIRD-PARTY.md` con fuente, licencia, uso y si fue modificado.
- [ ] Aviso de copyright original conservado si la licencia lo exige.
- [ ] Sin mezcla de licencias incompatibles (p. ej. GPL en un binario Apache-2.0).
