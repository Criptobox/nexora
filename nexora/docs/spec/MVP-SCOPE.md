# MVP-SCOPE.md

## El MVP debe poder hacer (plan §68)

| # | Capacidad | Estado v0.1 | Comprobación |
|---|---|---|---|
| 1 | Crear proyecto | ✅ | `Project.create()` · `e2e` |
| 2 | Recibir brief | ✅ | CLI, daemon y UI |
| 3 | Hacer discovery | ✅ | `planDiscovery()` con presupuesto por autonomía |
| 4 | Elegir dirección | ✅ | 3 direcciones; elige el usuario o el sistema con criterio explicado |
| 5 | Generar `DESIGN.md` | ✅ | 14 secciones + tokens |
| 6 | Crear prototipo | ✅ | `prototype/prototype.html` |
| 7 | Mostrar preview | ✅ | Servidor estático + iframe en la UI |
| 8 | Generar código | ✅ | `site/` HTML+CSS+JS dirigido por tokens |
| 9 | Ejecutarlo | ✅ | Escritura + servidor en sandbox |
| 10 | Tomar screenshot | ✅ | Solo con Playwright instalado; se declara en el informe |
| 11 | Hacer Visual QA | ✅ | Estático siempre; con navegador si está disponible |
| 12 | Corregir | ✅ | 11 reparaciones deterministas + re-verificación |
| 13 | Ejecutar tests | ✅ | Pipeline de QA; `npm test` en proyectos con scripts |
| 14 | Exportar | ✅ | Directorio, ZIP y checkpoint de Git |

**Conclusión:** el núcleo funcional del MVP está cerrado de extremo a extremo, con la única
salvedad declarada del punto 10.

## El MVP NO incluye (plan §69)

marketplace · colaboración · cloud · billing · cuentas · decenas de proveedores ·
cientos de skills · miles de design systems · móvil nativo · plugin store.

Todo ello figura como `PLANNED` en `CAPABILITIES.md`; nada se presenta como hecho.

## Criterios de éxito (plan §79)

| Dimensión | Requisito | Estado |
|---|---|---|
| **Diseño** | Dirección coherente, design system, componentes consistentes, responsive | ✅ |
| **Código** | Proyecto ejecutable, build correcto, código mantenible | ✅ |
| **IA** | Planificación, selección de skills, selección de modelo, corrección autónoma | ✅ |
| **Visión** | Screenshot, detección de problemas, comparación | ✅ verificado con Chromium real (Playwright opcional; sin él se declara en el informe) |
| **QA** | Tests, responsive, accesibilidad, regresión visual | ✅ (regresión estructural; píxeles PLANNED) |
| **Seguridad** | Sandbox, permisos, protección de secretos | ✅ |
| **Memoria** | Recuerda decisiones del proyecto | ✅ |

## El criterio más importante (plan §80)

> **"¿Puede recibir una idea y convertirla de forma confiable en una experiencia web terminada?"**

Sí, dentro de un alcance acotado y **declarado**: sitios estáticos de una página con
secciones derivadas del brief. El resultado se ejecuta, se inspecciona, se corrige y se
entrega con un estado de verificación honesto. Lo que no puede hacer todavía —aplicaciones
con backend, multi-página compleja, frameworks— está en el roadmap, no disfrazado de hecho.
