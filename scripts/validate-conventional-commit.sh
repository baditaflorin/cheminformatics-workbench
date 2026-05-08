#!/usr/bin/env bash
set -euo pipefail

file="${1:-.git/COMMIT_EDITMSG}"
message="$(head -n 1 "$file")"

if [[ "$message" =~ ^(feat|fix|docs|chore|refactor|test|ops|data)(\([a-zA-Z0-9_-]+\))?!?:\ .+ ]]; then
  exit 0
fi

echo "Commit message must use Conventional Commits, for example: feat: add molecule viewer"
exit 1
