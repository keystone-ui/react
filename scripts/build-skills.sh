#!/bin/bash
# Build skill tar.gz packages for distribution.
# Output: apps/docs/public/skills/{skill-name}.tar.gz
#
# Usage:
#   ./scripts/build-skills.sh
#   pnpm build:skills

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="${REPO_ROOT}/skills"
OUTPUT_DIR="${REPO_ROOT}/apps/docs/public/skills"

mkdir -p "$OUTPUT_DIR"

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")

  if [ ! -f "$skill_dir/SKILL.md" ]; then
    echo "Skipping $skill_name (no SKILL.md found)"
    continue
  fi

  echo "Building ${skill_name}..."

  tar -czf "$OUTPUT_DIR/${skill_name}.tar.gz" \
    -C "$skill_dir" \
    .

  echo "✓ Built ${skill_name}.tar.gz"
done

echo ""
echo "Done! Skill packages written to ${OUTPUT_DIR}"
ls -lh "$OUTPUT_DIR"/*.tar.gz 2>/dev/null || echo "No packages found."
