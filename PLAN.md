# Keystone UI: plan (where things stand)

Written by the team lead, 26 Nov 2026 22:25, on the owner's order to stop. Source of truth is git, GitHub and the board (`card ls --board keystone-ui`); this is a summary.

## State now
- **Stopped and holding.** No worker, reviewer, shell or run of this project is live. Nothing uncommitted was in flight: the last work was merged at 15:36 today and the project has held since 15:44.
- `origin/main` = `de480ba1` (PR #148). Its CI, Deploy Docs, Deploy Storybook and Release runs all succeeded on the first attempt, so the docs site and Storybook are deployed from that commit.
- npm: `@keystoneui/react` latest = `1.0.0-beta.10`, beta = `1.0.0-beta.16`. No release was cut today. The next one is the open "Version Packages (beta)" PR #123, which is the owner's to merge.
- Open pull requests: #123 (Version Packages), #80 (a dependency bot's bump of the Chromatic action). No other branch of ours is on GitHub waiting.

## What was done (merged to main, 23 to 26 Nov)
- 26 Nov: #148 every component page has its import under `## Usage`; the old `## Import` section is gone from 58 pages, the linter refuses it, the scaffold and guides follow. One size guard for the Button page was raised from 160 KB to 168 KB on the owner's word.
- 25 Nov: #140 to #147: the scaffold no longer overwrites existing files (#144); a pagination link with `href` renders as a link (#142); Storybook test fixes and the Reel retry probe in CI (#140, #141, #143, #146); contributor guides corrected (#145, #147).
- 24 Nov: #135 to #139: outline Button text colour, RTL submenu chevron, the RTL guide, changelog scripts, a docs smoke check.
- 23 Nov: #127 to #134: StringsProvider (#131), the bottom-nav-01 block (#132), RollingNumber and Countdown digit steadiness (#130), accessible names for Combobox controls and loading Buttons (#129), RTL submenu side (#128), FileUpload gap (#127), changelog header and RTL docs.
- Earlier work (Reel, Tabs on Reel, RollingNumber, Countdown, FileUpload, data table, Figma library build) is in the board's 277 done cards and in `MEMORY-archive-*.md`.

## Built but NOT merged (local only, nothing lost)
- **Scaffold registry reads** (`fix/scaffold-registry-read` at `fcaf0e11`, worktree `~/dev/react-wt-scaffold-reg`, clean). Parked by decision after three Codex returns; 8 findings open. Card `c-2e0d3f`.
- About 28 older worktrees `~/dev/react-wt-*` remain on disk. Most belong to branches already merged by squash; I have NOT checked each one. Three preview worktrees (`react-wt-pill-preview`, `react-wt-rn-preview`, `react-wt-tabs-preview`) each hold one uncommitted file; I did not touch them. Sorting these is on the todo list.

## Known gaps in what is merged
- #148 was merged on the owner's word although Codex had returned it: 7 findings about the codemod and linter on page shapes that do not exist in the repo today, and 2 minor ones. Not reproduced, not fixed. Card `c-7f6052`.
- On five pages (code-block, command, copy-button, pagination, textarea) a lead-in sentence now sits after the import instead of before the preview.
- The live site was checked only by the deploy runs and one page answering 200.

## Where the records are
- State: `~/data/keystone-ui-lead/MEMORY.md` (top block). Decisions: `DECISIONS.md` (latest D266, D267). Reports: `reports/`. Board: slug `keystone-ui`.
