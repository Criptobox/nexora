# DESIGN-INTELLIGENCE-AUDIT.md

Auditoría conceptual de `qiuyiwu1989-star/opendesign` (extracción estructurada de sistemas de diseño).

**Estado: PARCIAL — concepto analizado; dataset y código PENDIENTES de revisión de licencia y procedencia.**

## El concepto que sí adoptamos

> Convertir sistemas visuales reales en información estructurada que una IA pueda consultar.

Esta es la aportación valiosa: el diseño deja de ser un adjetivo dentro de un prompt
("moderno", "premium") y pasa a ser **datos**: paleta, escala tipográfica, ritmo espacial,
componentes, motion y anti-patterns.

## Cómo lo implementa NEXORA

```jsonc
// design-systems/coastal-premium.json
{
  "id": "coastal-premium",
  "rationale": "Arena cálida, agua profunda y tipografía editorial…",
  "palette": { "bg": "#0b1f2a", "accent": "#ff7a45", … },
  "typography": { "display": "…", "body": "…", "scale": "major-third" },
  "layout": "…", "imagery": "…", "motion": "…",
  "components": ["hero-fullbleed", "menu-list", …],
  "tone": "…", "references": ["…"]
}
```

El `DesignSystemRegistry` carga este directorio al arrancar; `INDUSTRY_HINTS` mapea
industria → direcciones candidatas; `buildDesignSystem()` convierte la dirección elegida
en tokens y estos alimentan directamente el CSS generado.

## Riesgos identificados y cómo se mitigan

| Riesgo | Mitigación en NEXORA |
|---|---|
| Catálogo estático que envejece | El catálogo es semilla, no dogma: `DesignSystemRegistry.add()` y carga desde disco |
| Homogeneización estética | La dirección se cruza con intención, personalidad e industria; el usuario puede imponer la suya |
| Procedencia y licencia de sistemas extraídos | **No importamos el dataset.** Catálogo propio, escrito desde cero |
| Copiar identidad de marcas reales | `Reference Engine` separa explícitamente `learnable` de `forbidden` |
| Tokens ignorados por el código generado | `findUndeclaredTokens()` detecta valores mágicos fuera del sistema |

## Decisión

**INSPIRE + BUILD OWN PIPELINE.** Adoptamos la filosofía, construimos el catálogo.

## Pendiente

- [ ] Revisar la licencia del repositorio y del dataset antes de considerar cualquier importación.
- [ ] Definir pipeline propio de extracción desde referencias aportadas por el usuario.
- [ ] Ampliar el catálogo a ≥ 20 direcciones con verificación de contraste automática.
