#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --experimental-test-coverage \
  --test-coverage-include='assets/js/ielts-vn-core.js' \
  --test-coverage-lines=100 \
  --test-coverage-functions=100 \
  --test-coverage-branches=100 \
  --test scripts/test_ielts_vn_core.cjs
