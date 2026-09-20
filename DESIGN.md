# DESIGN.md — del propio NEXORA

Este archivo describe el sistema visual **de la aplicación NEXORA** (el estudio).
Cada proyecto generado obtiene su propio `DESIGN.md`, con la misma estructura de 14 secciones.

## 1. Identity
Una mesa de trabajo, no un chat. La interfaz es un estudio de creación: el resultado ocupa
el centro; el agente y sus hallazgos, los márgenes.

## 2. Brand
Técnica, oscura, silenciosa. NEXORA no compite con el trabajo que muestra.

## 3. Color
| Token | Valor | Función |
|---|---|---|
| `bg` | `#0a0c12` | Fondo de la aplicación |
| `surface` | `#131724` | Paneles |
| `surface-2` | `#1a2033` | Elementos elevados |
| `ink` | `#e8ecf7` | Texto principal (17.2:1 sobre bg) |
| `muted` | `#8b93aa` | Texto secundario (6.9:1 sobre bg) |
| `accent` | `#5b8cff` | Acción principal y foco |
| `accent-2` | `#31e1b3` | Éxito / verificado |
| `danger` | `#ff6b6b` | Crítico |
| `warn` | `#ffc857` | Aviso |

## 4. Typography
Display y cuerpo comparten familia de sistema; la jerarquía se construye con tamaño,
peso y espacio. Monoespaciada solo para logs y datos.

## 5. Spacing
Rejilla de 4px. Escala 4-8-12-16-24-32-48-64-96-128.

## 6. Layout
Tres columnas (320 / fluido / 320) con barra superior de 56px y consola inferior de 140px.
Bajo 1100px colapsa a una columna con scroll.

## 7. Components
topbar, mode switcher, panel, brief form, phase list, live canvas, viewport switcher,
issue list, gate card, log console.

## 8. Motion
Transiciones de 140ms. Sin animaciones decorativas: el movimiento solo comunica estado.

## 9. Voice
Directa y verificable. "Partially verified — faltan: tests, consola" en lugar de "¡Listo!".
Nunca exclamaciones sobre el propio trabajo.

## 10. Anti-patterns
- Barras de progreso falsas.
- Declarar éxito antes de que el gate lo confirme.
- Ocultar errores del modelo o del build.
- Mostrar cadenas de razonamiento internas.
- Puntuación estética presentada como verdad objetiva.

## 11. Accessibility
Contraste AA en todo texto, foco visible de 2px, objetivos de 44px, Escape cierra overlays,
`aria-live` en el estado del gate, landmarks semánticos.

## 12. Responsive rules
Mobile-first. Bajo 1100px los paneles se apilan y el canvas mantiene 420px mínimos.
El selector de viewport (375 / 768 / full) actúa sobre el iframe, no sobre la app.

## 13. References
Editores de código de panel triple, herramientas de observabilidad, paneles de CI.
Se toma la **estructura**, nunca la identidad.

## 14. Decisions
- La UI v0.1 es HTML/CSS/JS nativo: arranca sin red y sin bundler (ADR-001, ADR-008).
- El preview va en `iframe` con `sandbox="allow-scripts allow-forms"`.
- Los logs son siempre visibles: ocultar errores está prohibido por diseño (plan §44).
