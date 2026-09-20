# COMPETITIVE-MATRIX.md

> **Estado: análisis de capacidades y flujos observables públicamente.**
> Las auditorías de código de `Criptobox/FORJA-IA`, `vustudio/opendesign` y
> `qiuyiwu1989-star/opendesign` requieren acceso y lectura directa de los repositorios;
> lo que sigue documenta **el método y las conclusiones a nivel de capacidades**, y marca
> explícitamente lo que está pendiente de verificar leyendo el código. No se afirma haber
> leído lo que no se ha leído (plan §1.1, §63).

## Método

Para cada referente se responde:

1. ¿Qué problema resuelve?
2. ¿Cómo lo resuelve?
3. ¿Qué funciona?
4. ¿Qué falla?
5. ¿Qué podemos mejorar?
6. ¿Qué no queremos?

## 1. FORJA-IA (`Criptobox/FORJA-IA`) — repositorio de referencia

**Estado de auditoría: PENDIENTE de lectura del código.** Ver `FORJA-AUDIT.md`.

| Área | Estado en FORJA | Valor | Acción para NEXORA | Verificado |
|---|---|---:|---|---|
| Web Studio | existente | alto | adaptar | ⬜ pendiente |
| Visual QA | existente | alto | rediseñar | ⬜ pendiente |
| Project Map | existente | alto | evolucionar | ⬜ pendiente |
| Agent loop | existente | alto | reconstruir | ⬜ pendiente |
| Model routing | existente | alto | mejorar | ⬜ pendiente |
| UI | existente | medio | rediseñar | ⬜ pendiente |
| Arquitectura | existente | por evaluar | no copiar sin auditoría | ⬜ pendiente |
| Seguridad | existente | por evaluar | rehacer según NEXORA | ⬜ pendiente |
| Persistencia | existente | por evaluar | seleccionar arquitectura final | ⬜ pendiente |

**Lo ya decidido sin depender de la auditoría:** NEXORA no hereda código de FORJA. Las
ideas de Project Map, Visual QA y Web Studio se han **reconstruido desde cero** en
`packages/project-engine`, `packages/qa` y `apps/web`, con contratos propios en
`packages/schemas`. Si la auditoría revela patrones superiores, se incorporan como ADR nuevo.

## 2. OpenDesign (`vustudio/opendesign`)

**Estado: analizado a nivel de flujo y arquitectura declarada. Código PENDIENTE.**

| Pregunta | Respuesta |
|---|---|
| Problema | Convertir una idea en diseño ejecutable con un flujo artifact-first en vez de chat-first |
| Cómo | Discovery con question form → dirección visual → skills componibles → `DESIGN.md` → preview sandbox → export, con adapters a distintos coding agents |
| Funciona | Separar *decidir cómo debe verse* de *escribir el código*; `DESIGN.md` como contrato legible por humanos y agentes; skills en archivos versionables; auto-crítica antes de entregar |
| Falla | Dependencia del coding agent externo para el resultado final; verificación visual limitada; el salto de diseño a código ejecutado y probado queda incompleto |
| Mejoramos | Cerramos el ciclo: ejecución real en sandbox + observación del navegador + QA funcional + regresión + verification gate |
| No queremos | Hacer fork y renombrar; depender de un único agente externo; presentar el diseño como producto terminado sin ejecutarlo |

## 3. OpenDesign Design Intelligence (`qiuyiwu1989-star/opendesign`)

| Pregunta | Respuesta |
|---|---|
| Problema | Que una IA pueda **consultar** sistemas visuales reales en vez de improvisar estética |
| Cómo | Extracción estructurada de sistemas de diseño a datos consultables (~1.486 sistemas) |
| Funciona | La idea de fondo: el diseño como datos, no como prompt |
| Falla | Riesgo de catálogo estático que envejece; procedencia y licencia de cada sistema extraído; homogeneización estética si se usa como única fuente |
| Mejoramos | Catálogo propio y ampliable (`design-systems/*.json`) + heurística por industria + detección de deriva de tokens; el catálogo alimenta, no dicta |
| No queremos | Importar el dataset sin revisar procedencia ni licencia de cada entrada |

## 4. Otros referentes

| Producto | Qué resuelve | Qué funciona | Qué falla | Qué tomamos | Qué rechazamos |
|---|---|---|---|---|---|
| **v0** (Vercel) | Prompt → componentes React | Iteración rápida, calidad visual alta por defecto | Resultado genérico entre proyectos; sin QA propio | Velocidad hasta el primer preview | La estética uniforme como destino |
| **Lovable** | App full-stack desde chat | Loop completo hasta deploy | Verificación superficial; declara éxito sin evidencia | Ambición del alcance end-to-end | Declarar hecho lo no comprobado |
| **Bolt** | IDE en navegador con agente | Ejecución en WebContainer, feedback inmediato | Diseño subordinado al código | Ejecución como parte del loop | Diseño como accidente del código |
| **Replit Agent** | Construir y desplegar en la nube | Entorno real, iteración autónoma | Sin verificación visual; coste | Autonomía acotada con checkpoints | Cloud obligatoria |
| **Framer AI / Webflow AI** | Sitios desde prompt en editor visual | Control fino del diseño | Encierro en la plataforma; export limitado | Prototipo antes del código | Lock-in; no poder exportar código real |
| **Google Stitch** | Propuesta visual desde prompt | Generación de dirección visual y variantes | Se detiene en el diseño | Idea de ofrecer varias direcciones | Terminar en imagen sin código |
| **Claude Design / Artifacts** | Iteración artifact-first | Preview inmediato, buena auto-crítica | Sin ejecución ni QA persistentes | Modelo artifact-first y auto-crítica | Ausencia de memoria de proyecto |
| **Coding agents (Codex, Aider, Cline…)** | Cambios sobre repos existentes | Diff seguro, tests, contexto de repo | Sin criterio visual | Checkpoints y diffs verificables | Que el criterio visual sea del modelo |

## 5. Hueco que ocupa NEXORA

Nadie cierra a la vez estos cinco eslabones con evidencia:

```
dirección visual decidida → código ejecutado → observado en navegador
→ corregido automáticamente → verificado con criterio explícito
```

- Las herramientas de **diseño** paran antes de ejecutar.
- Las de **código** no tienen criterio visual.
- Las **end-to-end** no verifican y declaran éxito sin pruebas.

NEXORA se define por el **Verification Gate**: prefiere decir *"Partially verified — faltan
tests y consola"* antes que mentir con un *"¡Listo!"*.

## 6. Pendiente de la próxima ronda

- [ ] Clonar y leer `Criptobox/FORJA-IA`; completar `FORJA-AUDIT.md` con arquitectura real.
- [ ] Clonar y leer `vustudio/opendesign`; completar `OPENDESIGN-AUDIT.md`.
- [ ] Revisar licencias de ambos y actualizar `LICENSE-MATRIX.md`.
- [ ] Reevaluar antes de cada decisión importante: estos repos cambian.
