# templates/

Estructuras de partida para tipos de proyecto. **No son diseños**: NEXORA genera la
identidad visual cada vez (plan §3: "nunca la misma web dos veces"). Una plantilla aquí
define qué secciones tiene sentido incluir, no cómo se ven.

## Formato

```json
{
  "id": "restaurant",
  "sections": ["hero", "menu", "about", "testimonials", "contact"],
  "requiredFeatures": ["menu"],
  "suggestedFeatures": ["booking", "whatsapp"],
  "notes": "El menú es la razón de la visita: nunca debajo del fold."
}
```

## Relación con las skills

| | `templates/` | `skills/` |
|---|---|---|
| Define | Qué secciones | Cómo se juzga la calidad |
| Formato | JSON | `SKILL.md` + reglas |
| Afecta a | Estructura | Criterio y validación |

Estado: `PLANNED` (CAP-091). Hoy la estructura la decide `code-engine/src/generator.ts`
a partir del intent. Este directorio existe para extraer esa lógica a datos sin romper
la API. Ver `docs/spec/IMPLEMENTATION-ROADMAP.md`.
