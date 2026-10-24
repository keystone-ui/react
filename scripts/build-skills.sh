#!/bin/bash
# Build skill tar.gz packages for distribution.
# Output: apps/docs/public/skills/{skill-name}.tar.gz
#
# Usage:
#   ./scripts/build-skills.sh
#   pnpm build:skills
#
# SKILLS_DIR and OUTPUT_DIR can be overridden through the environment; the
# test suite (apps/docs/tests/build-skills.test.ts) points them at temp dirs.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="${SKILLS_DIR:-${REPO_ROOT}/skills}"
OUTPUT_DIR="${OUTPUT_DIR:-${REPO_ROOT}/apps/docs/public/skills}"

mkdir -p "$OUTPUT_DIR"

built=0

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")

  if [ ! -f "$skill_dir/SKILL.md" ]; then
    echo "Skipping $skill_name (no SKILL.md found)"
    continue
  fi

  echo "Building ${skill_name}..."

  archive="$OUTPUT_DIR/${skill_name}.tar.gz"

  tar -czf "$archive" \
    -C "$skill_dir" \
    .

  # The /skills/[skill] route prerenders from this archive, so a broken one
  # would only surface as a 404 after deploy. Listing a named member exits
  # non-zero when it is missing.
  if ! tar -tzf "$archive" ./SKILL.md > /dev/null; then
    echo "error: ${skill_name}.tar.gz does not contain SKILL.md" >&2
    exit 1
  fi

  echo "✓ Built ${skill_name}.tar.gz"
  built=$((built + 1))
done

if [ "$built" -eq 0 ]; then
  echo "error: no skill packages were built from ${SKILLS_DIR}" >&2
  exit 1
fi

echo ""
echo "Done! ${built} skill package(s) written to ${OUTPUT_DIR}"
ls -lh "$OUTPUT_DIR"/*.tar.gz
