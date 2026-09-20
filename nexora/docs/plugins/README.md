# Plugins — API declarada (estado: PLANNED)

> **Esto es una especificación, no una implementación.** Nada de lo descrito aquí funciona
> todavía. Se documenta para fijar el contrato antes de construir (plan §52, FASE 18).

## Manifiesto propuesto

```jsonc
{
  "id": "vercel",
  "version": "0.1.0",
  "capabilities": ["deploy"],
  "permissions": ["net:vercel.com", "read:project"],
  "tools": [{ "name": "deploy", "input": "DeployRequest", "output": "DeployResult" }],
  "ui": { "panel": "deployment" },
  "lifecycle": ["install", "activate", "deactivate", "uninstall"]
}
```

## Reglas

1. Todo plugin **declara permisos**; el host los concede explícitamente y los audita.
2. Un plugin no accede al filesystem fuera del proyecto ni a variables de entorno con secretos.
3. Las llamadas de red se limitan a los hosts declarados.
4. Versionado semántico y compatibilidad declarada con la versión de NEXORA.
5. Se puede desinstalar sin dejar estado residual.

## Candidatos futuros

GitHub · GitLab · Figma · Vercel · Supabase · Firebase · Cloudflare · WordPress · Shopify
