#!/usr/bin/env bash
# Release Gate (plan §72). No se publica si algo de esto falla.
set -uo pipefail
cd "$(dirname "$0")/.."

FAILED=0
step() {
  printf '\n\033[1m▸ %s\033[0m\n' "$1"
  shift
  if "$@"; then printf '  ✅ ok\n'; else printf '  ❌ FALLO\n'; FAILED=1; fi
}

printf '\033[1mNEXORA — Release Check\033[0m\n'

step "Build"            npm run build
step "Lint"             npm run lint
step "Tests (unit + integración)" node --test tests/unit tests/integration
step "Tests E2E"        node --test tests/e2e
step "Golden projects"  node scripts/golden.mjs
step "Auditoría de dependencias" npm audit --omit=dev --audit-level=high

printf '\n──────────────────────────────────────\n'
if [ "$FAILED" -eq 0 ]; then
  printf '\033[32mRELEASE GATE: PASS\033[0m — se puede publicar.\n'
else
  printf '\033[31mRELEASE GATE: FAIL\033[0m — NO publicar.\n'
fi
exit "$FAILED"
