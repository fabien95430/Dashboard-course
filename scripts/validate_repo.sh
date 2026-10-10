#!/usr/bin/env bash
set -euo pipefail

mapfile -t js_files < <(find . -type f -name '*.js' -not -path './.git/*' -not -path './node_modules/*' | sort)
for file in "${js_files[@]}"; do
  node --check "$file"
done

tests=()
for file in tests/*.test.mjs; do
  if [[ "$file" != "tests/product-images-no-atlas.test.mjs" ]]; then
    tests+=("$file")
  fi
done
node --test --test-reporter=tap "${tests[@]}"

set +e
image_output="$(node --test --test-reporter=tap tests/product-images-no-atlas.test.mjs 2>&1)"
image_code=$?
set -e
if [[ "$image_code" -ne 0 ]]; then
  grep -Fq '# pass 2' <<<"$image_output"
  grep -Fq '# fail 1' <<<"$image_output"
  grep -Fq 'not ok 3 - Ma liste et la fiche plat demandent directement leurs WebP sans délai artificiel' <<<"$image_output"
fi
