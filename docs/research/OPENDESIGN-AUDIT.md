# OPENDESIGN-AUDIT.md

**Estado: PARCIAL — analizado a nivel de flujo y arquitectura declarada; código PENDIENTE de lectura.**

## Lo que sí se ha analizado (flujo y conceptos públicos)

| Concepto | Valoración | Decisión | Dónde vive en NEXORA |
|---|---|---|---|
| Flujo artifact-first | Muy útil: el resultado es el centro, no la conversación | ADAPT | `packages/artifacts`, UI con live canvas |
| Discovery antes de generar | Correcto, pero puede volverse interrogatorio | ADAPT con límite | `design-engine/discovery.ts` con presupuesto por autonomía |
| Question form | Útil para lo de alto impacto | ADAPT | `DiscoveryQuestion` con campo `impact` y `assumptionIfSkipped` |
| Dirección visual antes del código | Clave; evita rehacer | ADAPT | `design-engine/direction.ts` |
| Skills componibles | Excelente: versionables y auditables | ADAPT | `skills/*/SKILL.md` + `SkillRegistry` |
| Design Systems portables | Buena idea de fondo | ADAPT | `design-systems/*.json` |
| `DESIGN.md` | El mejor concepto del proyecto | ADAPT + EXTEND | 14 secciones + tokens + anti-patterns + decisiones |
| Preview sandbox | Necesario | REBUILD | `execution/static-server.ts` + iframe con `sandbox` |
| Export | Necesario | ADAPT | `code-engine/export.ts` |
| Integración con coding agents | Flexible pero delega el resultado | INSPIRE | Nosotros ejecutamos y verificamos dentro del sistema |
| Auto-crítica | Muy valioso | ADAPT | `agents/critic.ts` con límite de iteraciones |
| Catálogos de sistemas visuales | Útil como semilla | INSPIRE | Catálogo propio |
| Workflow de prototipado | Correcto | ADAPT | `code-engine/prototype.ts` |

## Pendiente de leer en el código

```
apps/  skills/  design-systems/  templates/  assets/  docs/
packages/  tools/  prompt-templates/  schemas/
```

Y específicamente: agente/adapters, skill registry, design-system loader, artifact parser,
preview sandbox, project storage, agent streaming, question form, direction picker,
self-critique, export, desktop/sidecar, CLI.

## Lo que NO hacemos

```
git clone OpenDesign → cambiar nombre → cambiar colores → llamar NEXORA
```

Eso sería un fork. Se han adoptado **principios**; el código es propio y los contratos
están en `packages/schemas`. Cualquier reutilización futura de código exige licencia
verificada y entrada en `THIRD-PARTY.md`.

## Dónde mejoramos sobre el flujo de OpenDesign

1. **Ejecutamos**: el artifact no se queda en preview, se escribe, se sirve y se observa.
2. **Verificamos**: verification gate con lenguaje honesto en lugar de "hecho".
3. **Reparamos con evidencia**: cada parche es determinista y se re-verifica.
4. **Recordamos**: memoria de proyecto que sobrevive entre iteraciones.
5. **No dependemos de un agente externo** para cerrar el ciclo.
