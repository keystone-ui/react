#!/bin/bash
# Keystone UI Skill Installer
# Usage: curl -sSL https://keystoneui.io/install | bash -s [skill-name]
# Default: keystoneui-react
# https://keystoneui.io

set -e

SKILL_NAME="${1:-keystoneui-react}"

# The name is interpolated into install paths below, so it must not be able to
# escape them. `..` or a slash here would let `curl … | bash -s ../../..` point
# the extraction -- and the clean-first step -- anywhere under $HOME.
case "$SKILL_NAME" in
  *[!a-zA-Z0-9._-]* | "" | .* )
    echo "✗ Invalid skill name: '$SKILL_NAME'" >&2
    echo "  Expected letters, digits, dot, underscore or hyphen." >&2
    exit 1
    ;;
esac

# Extract into a clean directory.
#
# tar over an existing install leaves behind anything the skill has since
# dropped -- the bundled .mjs scripts and evals/evals.json both went away, and
# a stale copy of a deleted script is worse than no copy, because the skill no
# longer documents it but an agent can still find and run it.
#
# Only removes a directory that actually looks like an installed skill, so a
# wrong argument cannot delete something else.
install_skill() {
  target="$1"
  if [ -f "$target/SKILL.md" ]; then
    rm -rf "$target"
  fi
  mkdir -p "$target"
  tar xzf "$TMP_TARBALL" -C "$target"
}

BASE_URL="${BASE_URL:-{{BASE_URL}}}"
SKILL_URL="${BASE_URL}/skills/${SKILL_NAME}.tar.gz"

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"

INSTALLED=0

echo "Installing Keystone UI skill: ${SKILL_NAME}..."
echo ""

# Download once, verify, then fan out to every detected target.
# Without -f, curl prints the error body but exits 0, and a 404/HTML page
# would silently feed `tar` garbage producing "Unrecognized archive format".
TMP_TARBALL=$(mktemp -t keystoneui-skill.XXXXXX.tar.gz)
trap 'rm -f "$TMP_TARBALL"' EXIT

if ! curl -fsSL -o "$TMP_TARBALL" "$SKILL_URL"; then
  echo "✗ Failed to download ${SKILL_URL}" >&2
  echo "  The skill may not be published yet, or there's a network issue." >&2
  exit 1
fi

# gzip magic bytes are 0x1f 0x8b — anything else (HTML, JSON, plain text)
# would fail tar with the same opaque "Unrecognized archive format" message.
# tr -d ' ' normalizes BSD-style od output (which uses padded spaces) into
# the same form as GNU od for the comparison.
MAGIC=$(head -c 2 "$TMP_TARBALL" | od -An -tx1 | tr -d ' \n')
if [ "$MAGIC" != "1f8b" ]; then
  echo "✗ Downloaded file is not a valid gzip archive (got $(file -b "$TMP_TARBALL"))." >&2
  echo "  Server response saved to $TMP_TARBALL — first 200 bytes:" >&2
  head -c 200 "$TMP_TARBALL" >&2
  echo "" >&2
  exit 1
fi

# Claude Code
if [ -d "$HOME/.claude" ]; then
  install_skill "$HOME/.claude/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Claude Code"
  INSTALLED=$((INSTALLED + 1))
fi

# Cursor
if [ -d "$HOME/.cursor" ]; then
  install_skill "$HOME/.cursor/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Cursor"
  INSTALLED=$((INSTALLED + 1))
fi

# OpenCode
if command -v opencode &> /dev/null || [ -d "$HOME/.config/opencode" ]; then
  install_skill "$HOME/.config/opencode/skill/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for OpenCode"
  INSTALLED=$((INSTALLED + 1))
fi

# Codex CLI
if command -v codex &> /dev/null || [ -d "$CODEX_HOME" ]; then
  install_skill "$CODEX_HOME/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Codex"
  INSTALLED=$((INSTALLED + 1))
fi

# Antigravity (Gemini CLI)
if [ -d "$HOME/.gemini" ]; then
  install_skill "$HOME/.gemini/antigravity/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Antigravity"
  INSTALLED=$((INSTALLED + 1))
fi

echo ""

if [ $INSTALLED -eq 0 ]; then
  echo "No supported tools detected."
  echo ""
  echo "Install one of these first:"
  echo "  • Claude Code: https://claude.ai/code"
  echo "  • Cursor: https://cursor.com"
  echo "  • OpenCode: https://opencode.ai"
  echo "  • Codex: https://openai.com/codex"
  echo "  • Antigravity: https://antigravity.google"
  exit 1
fi

echo ""
echo "Done! The ${SKILL_NAME} skill is now available."
echo ""
echo "Your AI agent will use it automatically when relevant."
