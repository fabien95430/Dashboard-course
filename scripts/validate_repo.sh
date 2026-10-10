#!/usr/bin/env bash
set -euo pipefail

mapfile -t js_files < <(find . -type f -name '*.js' -not -path './.git/*' -not -path './node_modules/*' | sort)
for file in "${js_files[@]}"; do
  node --check "$file"
done

node --test --test-reporter=tap tests/*.test.mjs
