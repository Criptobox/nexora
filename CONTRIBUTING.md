# CONTRIBUTING.md

## Ciclo obligatorio por feature

```
SPEC → DESIGN → IMPLEMENT → UNIT TEST → INTEGRATION TEST → E2E
     → VISUAL CHECK → SECURITY CHECK → DOCUMENT → VERIFY
```

Nunca `IDEA → CODE → DONE`.

## Definition of Done

Una tarea solo pasa a `DONE` si:

- [ ] está implementada;
- [ ] está integrada con el resto del sistema;
- [ ] tiene tests apropiados;
- [ ] no rompe funcionalidades existentes (`npm run test:all`);
- [ ] está documentada;
- [ ] pasó las validaciones correspondientes;
- [ ] se comprobó visualmente si afecta a la UI;
- [ ] se revisaron errores de consola si aplica;
- [ ] se revisó seguridad si aplica;
- [ ] existe evidencia;
- [ ] **el estado real coincide con lo declarado** en `docs/spec/CAPABILITIES.md`.

## Entorno

```bash
npm install
npm run build
npm run test:all
npm run lint
```

Node ≥ 20.10. No añadas dependencias de runtime sin un ADR que lo justifique (ADR-008).

## Convenciones

- TypeScript estricto; nada de `any` sin comentario que lo justifique.
- Un paquete = una responsabilidad; las dependencias entre paquetes forman un DAG.
- Los comentarios explican **por qué**, no **qué**.
- Mensajes de commit: `tipo(ámbito): descripción` — `feat(qa): añadir detección de CLS`.
- Todo issue que genere el sistema debe llevar evidencia.

## Añadir una skill

1. `skills/<categoría>/<id>/SKILL.md` con frontmatter (`id`, `version`, `name`, `category`, `purpose`, `when_to_use`).
2. Secciones `## Rules`, `## Anti-patterns`, `## Validation` como mínimo.
3. `npm test` — `tests/unit/skills.test.js` valida todas las skills del repo automáticamente.

## Añadir un proveedor de modelo

1. Extiende `HttpProvider` o implementa `ModelProvider` en `packages/models/src/providers/`.
2. Declara `capabilities.supports` con honestidad: el router enruta por ellas.
3. Regístralo condicionado a su API key en `packages/orchestrator/src/bootstrap.ts`.
4. Test de failover con un proveedor que falla.

## Release Gate

No se publica si: falla el build, fallan los tests, hay un issue de seguridad crítico,
hay regresión visual crítica o un golden project está roto. Ejecuta `npm run release-check`.
