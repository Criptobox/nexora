# Getting started

## Requisitos

- Node.js ≥ 20.10 (usa `fetch`, `AbortSignal.timeout`, `node:test`).
- Nada más. Sin Docker, sin API keys, sin cuenta.

## Instalación

```bash
git clone <repo> nexora && cd nexora
npm install      # ~25 paquetes, solo tooling de build
npm run build
npm test         # 51 unit+integración
npm run test:all # + 7 E2E
```

## Tu primer proyecto

```bash
node apps/cli/dist/index.js create \
  "Crea una web premium para una hamburguesería frente al mar, juvenil pero elegante, con menú y pedidos por WhatsApp" \
  --out ./mi-sitio --autonomous
```

Salida esperada:

```
▸ Understanding — Crea una web premium para una hamburguesería…
▸ Planning — 12 tareas
▸ Designing — generando direcciones visuales
▸ Prototyping — generando prototipo responsive
▸ Inspecting — auto-crítica del prototipo
▸ Coding — generando código del sitio
▸ Running — escribiendo y sirviendo el proyecto
▸ Testing — visual-qa
────────────────────────────────────────
Estado de verificación: Partially verified
Issues abiertos: 0
Salida: ./mi-sitio
```

Abre `mi-sitio/site/index.html` y lee `mi-sitio/REPORT.md`.

## Entender qué va a hacer antes de hacerlo

```bash
node apps/cli/dist/index.js plan "Crea una tienda de tecnología"
```

Muestra la intención detectada, las preguntas de discovery, las asunciones que tomará y
las tres direcciones visuales candidatas — sin generar nada.

## El estudio

```bash
npm run daemon    # http://localhost:7788
```

## Comprobar el entorno

```bash
node apps/cli/dist/index.js doctor
```

Lista proveedores disponibles y su salud, skills cargadas, direcciones visuales, agentes y
si Playwright está instalado.

## Activar Visual QA con navegador real

```bash
npm i -D playwright
npx playwright install chromium
```

A partir de ahí el informe dirá *"Observación con navegador real: sí (Playwright)"* y el
QA incluirá screenshots, errores de consola, overflow y áreas táctiles medidas de verdad.

## Usar modelos reales

```bash
cp .env.example .env
# añade OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY u OLLAMA_BASE_URL
```

El router los registra automáticamente al arrancar y enruta por capacidades. Sin claves,
usa el proveedor determinista `mock` y todo sigue funcionando.

## Trabajar sobre un proyecto existente

```bash
node apps/cli/dist/index.js scan ./mi-proyecto
```

Genera `PROJECT-MAP.json` con el grafo de dependencias, importancia por nodo, framework
detectado y entry points — sin modificar nada.

## Problemas

Ver [troubleshooting/](troubleshooting/README.md).
