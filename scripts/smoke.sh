#!/usr/bin/env bash
set -euo pipefail

make build
mkdir -p tmp
npm run preview >tmp/pages-preview.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 60); do
  if curl -fsS http://127.0.0.1:4273/cheminformatics-workbench/ >/dev/null; then
    break
  fi
  sleep 1
done

curl -fsS http://127.0.0.1:4273/cheminformatics-workbench/ >/dev/null
npx playwright test --config playwright.config.ts
