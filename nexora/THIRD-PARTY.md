# THIRD-PARTY.md

Procedencia de todo lo que NEXORA usa o del que se inspira (plan §76).

## Código de terceros incluido en este repositorio

**Ninguno.** Todo el código de `packages/`, `apps/`, `skills/`, `design-systems/`,
`scripts/` y `tests/` es original y se publica bajo Apache-2.0.

## Dependencias

| Project | Source | License | Used for | Modified? | Attribution required? |
|---|---|---|---|---|---|
| Node.js (stdlib) | nodejs.org | MIT | Runtime completo | No | No |
| TypeScript | github.com/microsoft/TypeScript | Apache-2.0 | Compilación (devDependency) | No | No |
| @types/node | DefinitelyTyped | MIT | Tipos (devDependency) | No | No |
| Playwright | github.com/microsoft/playwright | Apache-2.0 | Visual QA (**opcional, no instalado por defecto**) | No | No |

**Dependencias de runtime: 0.** Ver [ADR-008](docs/architecture/ADR/ADR-008-zero-runtime-dependencies.md).

## Inspiración arquitectónica (ideas, sin reutilización de código)

Las ideas y patrones pueden inspirar arquitectura; el código y los assets se tratan según
su licencia. De estas fuentes se han adoptado **principios**, y no se ha copiado código:

| Project | Source | License | Used for | Code reused? | Attribution required? |
|---|---|---|---|---|---|
| OpenDesign | `vustudio/opendesign` | por verificar | Flujo artifact-first, `DESIGN.md`, skills como archivos | **No** | No (solo ideas) |
| OpenDesign Design Intelligence | `qiuyiwu1989-star/opendesign` | por verificar | Sistemas visuales como datos consultables | **No** | No (solo ideas) |
| FORJA-IA | `Criptobox/FORJA-IA` | por verificar | Conceptos de Project Map, Visual QA, Web Studio | **No** | No (solo ideas) |
| Claude Design | producto | n/a | Auto-crítica antes de entregar | **No** | No |
| Google Stitch | producto | n/a | Ofrecer varias direcciones visuales | **No** | No |

> Las licencias marcadas "por verificar" deben comprobarse **antes** de cualquier
> reutilización de código. Mientras tanto, NEXORA no incorpora nada de esos repositorios.
> Ver [`docs/research/LICENSE-MATRIX.md`](docs/research/LICENSE-MATRIX.md).

## Fuentes tipográficas

El CSS generado referencia familias por nombre con fallback de sistema
(`Inter`, `Space Grotesk`, `Playfair Display`, `Fraunces`, `Cormorant Garamond`, `Jost`,
`Archivo Black`). **No se distribuye ningún archivo de fuente en este repositorio.**
Quien autoaloje una fuente debe verificar su licencia (la mayoría son SIL OFL).

## Antes de aceptar código externo

1. Identificar repositorio y licencia.
2. Comprobar compatibilidad con Apache-2.0.
3. Conservar avisos de copyright.
4. Añadir fila a esta tabla con: Project · Source · License · Used for · Modified? · Attribution required?
5. No mezclar licencias incompatibles.
