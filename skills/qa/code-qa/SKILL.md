---
id: code-qa
version: 0.1.0
name: Code QA
category: qa
purpose: Verificación estática de código y seguridad.
when_to_use:
  - antes de entregar
  - después de generar código
inputs:
  - archivos generados
outputs:
  - issues de código y seguridad
permissions:
  - read:project
---

## Purpose
Evitar que salga a entrega código roto, inseguro o con secretos.

## Rules
- Ningún secreto embebido en el código entregado.
- Sin eval ni innerHTML con datos dinámicos.
- Todo recurso externo por https.
- target="_blank" siempre con rel="noopener noreferrer".
- Etiquetas balanceadas y doctype presente.

## Anti-patterns
- Silenciar errores con try/catch vacío.
- Dependencias añadidas sin justificación.

## Validation
- 0 issues de severidad critical en la categoría Security.
