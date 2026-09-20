# QA Engine

## Pipeline

```
TYPECHECK → LINT → UNIT TEST → BUILD → RUNTIME → CONSOLE
→ FUNCTIONAL → RESPONSIVE → ACCESSIBILITY → VISUAL → REGRESSION
```

`runQaPipeline()` ejecuta: Code QA, anti-patterns, Functional QA, Performance QA, Visual QA
(estático + navegador si hay Playwright) y regresión. Devuelve issues, scores y gate.

## Categorías de issue

`Hierarchy` `Composition` `Typography` `Spacing` `Color` `Consistency` `Responsive`
`Accessibility` `Interaction` `Brand alignment` `Code` `Build` `Runtime` `Performance`
`Security` `Regression`

## Anatomía de un issue

```
VQA-003
Contraste insuficiente: texto secundario (3.1:1)
severity: medium
location: design tokens
suggested_fix: Ajustar los tokens para alcanzar al menos 4.5:1
evidence: metric:#8b93aa sobre #0a0c12 (ratio 3.1)
```

**Sin evidencia no hay issue.**

## Verification Gate

Nueve comprobaciones; cada una `pass` / `fail` / `unknown`:

| Nivel | Condición |
|---|---|
| `Verified` | 0 fallos y 0 desconocidos |
| `Partially verified` | 0 fallos, ≤ 3 desconocidos |
| `Tested` | 0 fallos, > 3 desconocidos |
| `Not verified` | cualquier fallo o issue crítico abierto |

El sistema **nunca** reporta `Verified` sin haber comprobado todo. Un `unknown` no es un
`pass`.

## Scores

Score interno por categoría (100 − penalizaciones: crítico 35, alto 22, medio 12, bajo 5).
Se usan para detectar degradación entre versiones, **no** como nota estética al usuario.

## Regresión

Firma estructural (hash, longitud de texto, número de elementos) contra baseline. Detecta
pérdida > 25 % de contenido o nodos. La comparación de píxeles está `PLANNED` (CAP-063).
