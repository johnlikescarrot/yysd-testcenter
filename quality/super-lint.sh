#!/usr/bin/env bash
# Run the same official image locally or on the GitHub-hosted runner.
set -euo pipefail
cd "$(dirname "$0")/.."
docker run --rm \
  -e RUN_LOCAL=true -e USE_FIND_ALGORITHM=true -e VALIDATE_ALL_CODEBASE=true \
  -e STRIP_DEFAULT_WORKSPACE_FOR_REGEX=true \
  -e 'FILTER_REGEX_INCLUDE=^(ielts-vi/|quality/|\.github/workflows/ielts-vi\.yml$)' \
  -e 'FILTER_REGEX_EXCLUDE=(^|/)(node_modules|coverage|reports|dist)(/|$)' \
  -e VALIDATE_GITHUB_ACTIONS=true -e VALIDATE_HTML=true -e VALIDATE_CSS=true \
  -e VALIDATE_JAVASCRIPT_ES=true -e VALIDATE_JSON=true -e VALIDATE_BASH=true \
  -v "$PWD:/tmp/lint:ro" ghcr.io/super-linter/super-linter:slim-v9.0.0
