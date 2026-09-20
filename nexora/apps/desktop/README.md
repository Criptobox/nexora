# @nexora/desktop — PLANNED

**Estado: PLANNED (CAP-090). No hay implementación.**

El plan (FASE 17) es explícito: *"No comenzar por desktop"*. El shell de escritorio se
construye cuando la versión web/local sea estable y el loop central esté `VERIFIED`.

## Alcance previsto

- Shell (Electron o alternativa equivalente **si las pruebas justifican su uso**).
- Acceso a filesystem real sin el confinamiento del navegador.
- Terminal integrada, dentro de la misma política de sandbox.
- Navegador embebido para Visual QA sin instalación aparte.
- Automatización y captura de pantalla nativas.

## Requisitos previos

1. Loop central `VERIFIED` con navegador real en CI.
2. UI web estable.
3. Política de sandbox validada en los tres sistemas operativos.

Este README existe para que el paquete no parezca implementado. Es una declaración de
intención, no un producto.
