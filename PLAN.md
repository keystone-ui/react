# Keystone UI: plan (where things stand)

Updated 27 Nov 2026 from a session with the owner. Source of truth is git, GitHub, npm and the board (`card ls --board keystone-ui`); this is a summary. The board itself was not updated: card changes need the lead role, and the lead is stopped (see "Board" below).

## State now
- `origin/main` = `912508de` (PR #152). Its CI, Deploy Docs, Deploy Storybook and Release runs all succeeded, so the docs site and Storybook are deployed from that commit.
- npm: `@keystoneui/react` latest = beta = `1.0.0-beta.17` (published by Release from #123; `latest` moved by the owner on 27 Nov).
- Open pull requests: #80 (a dependency bot's bump of the Chromatic action), and the scaffold registry PR from `fix/scaffold-registry-read` (item 4 below) once it is opened.
- Worktrees: only `~/dev/react-wt-scaffold-reg` (scaffold work) and `~/dev/react-wt-plan-task` (this change) remain.

## What was done
- 27 Nov:
  - #149 new pixel keystone app icon everywhere: favicon (`favicon.ico`, `icon.svg`), apple-touch and web-manifest icons, nav logos, social card, Storybook favicon and sidebar logo, and the macOS `.icns` set. Sources and generator in `brand/` (`python3 -B brand/build.py`).
  - #123 Version Packages: `@keystoneui/react@1.0.0-beta.17` published.
  - #150 contributing skill and consumer category tables corrected (shadcn reference URL, `dashboard` mirrors shadcn, tables match `registry.json`). Closes `c-9c9666` items 2 to 4.
  - #151 Reel retry probe checks each story's raw export name and maps exit statuses outside 1..255 to 1. Closes `c-27bb16`.
  - #152 usage-import codemod and `## Import` lint hardened against all six Codex findings and the two later ones; Command, Code Block and Copy Button lead-ins reworded. Closes `c-7f6052`.
  - 27 old worktrees removed; local branches of 14 merged PRs deleted.
- 26 Nov: #148 every component page has its import under `## Usage`.
- 25 Nov: #140 to #147: scaffold no longer overwrites files (#144); pagination link renders as a link (#142); Storybook test fixes and the Reel retry probe in CI (#140, #141, #143, #146); contributor guides (#145, #147).
- 24 Nov: #135 to #139. 23 Nov: #127 to #134.
- Earlier work is in the board's done cards and in `MEMORY-archive-*.md`.

## Decided
- `o-npm-name-keystoneui`: not needed. npm refuses the bare name `keystoneui` for every account ("too similar to existing package keystone-ui"), so nobody can publish it and `npx keystoneui` fails with not found. The docs were fixed by #86. Close the card.

## Known gaps
- `c-f62364` asked for a JAWS check of the loading Button (aria-busy) before the next npm release; beta.17 went out without it.
- Chromatic "UI Tests" stays pending on every PR until `o-chromatic` is done.
- The remote branches of 14 merged PRs (#93 to #110) are still on GitHub; deleting them needs the owner.

## Board
Card changes (`card accept`, `drop`, `note`) are refused unless run as the lead. To bring the board in line: accept `c-27bb16`, `c-9c9666`, `c-7f6052`, `o-npm-latest`; drop `o-npm-name-keystoneui` (reason above); note `c-2e0d3f` with its PR.

## Where the records are
- State: `~/data/keystone-ui-lead/MEMORY.md` (top block). Decisions: `DECISIONS.md`. Reports: `reports/`. Board: slug `keystone-ui`.
