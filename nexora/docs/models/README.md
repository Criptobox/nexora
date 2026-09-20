# Modelos y routing

## Capacidades

`TEXT` `CODE` `VISION` `LONG_CONTEXT` `REASONING` `FAST` `CHEAP` `LOCAL` `TOOL_USE` `IMAGE`

## Perfiles de routing

| Perfil | Capacidades | Uso |
|---|---|---|
| `design-concept` | REASONING, TEXT | Dirección visual |
| `discovery` | FAST, TEXT | Preguntas y análisis de brief |
| `code` | CODE, REASONING | Implementación |
| `visual-critique` | VISION | Crítica sobre screenshot |
| `quick-fix` | FAST, CODE | Reparaciones menores |
| `local` | LOCAL | Todo en la máquina |
| `complex` | REASONING, LONG_CONTEXT | Tareas grandes |

```ts
await router.route(
  { messages: [{ role: 'user', content: brief }], purpose: 'design' },
  { profile: 'design-concept', preferLocal: false }
);
```

`pin: 'anthropic'` fuerza un proveedor (modo Expert).

## Failover

```
MODEL A → timeout → retry → MODEL B → success
```

Con circuit breaker (3 fallos abren el circuito 30 s), timeout, cancelación por
`AbortSignal` y contabilidad de tokens y coste. Nunca hay bucles infinitos.

## Añadir un proveedor

Extiende `HttpProvider` (SSE) o implementa `ModelProvider`. Declara `capabilities.supports`
con honestidad: el router confía en esa declaración. Regístralo en `bootstrap.ts`
condicionado a su API key.
