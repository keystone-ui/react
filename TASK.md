# Keystone UI: todo (what still needs doing)

Written by the team lead, 26 Nov 2026 22:25; updated 27 Nov after a session with the owner (done items removed, see PLAN.md). Card ids are on the board (`card show <id> --board keystone-ui`).

## Only the owner can do these
- `o-figma`: Review and publish the Figma library; give a token and open the Blocks file
- `o-chromatic`: Renew or raise the Chromatic plan so UI Tests run again
- Delete the remote branches of the 14 merged PRs #93 to #110 (an agent's delete was refused).
- Bring the board in line (needs the lead role): see PLAN.md → Board.
- Any push, merge, release or publish: each needs the owner's word.

## Next
1. `c-2e0d3f`: scaffold registry work. The JSON-registry part (branch `fix/scaffold-registry-read`, rebased, 8 findings) is in a PR; the TypeScript-array part (`w-scaffold-reg-ts`, rows 4-8) and lookup errors (`w-scaffold-lookup-errors`, row 9) are still to do.
2. `c-f62364`: the JAWS check of the loading Button was meant to precede the next npm release; beta.17 is out, so do it before beta.18.
3. Before any push that changes docs pages: run `pnpm --filter @keystoneui/docs test:built` after a forced build.

## Todo cards on the board (not ordered beyond the list above)
- `w-base-ui-bump-modal-tab`: Base UI: bump the pin when the release with the modal Tab fix is out; six saved stories as the acceptance test
- `c-f62364`: Test a loading Button (aria-busy) with JAWS before the next npm release
- `w-filter-chips-mount-focus`: FilterChips follow-up: a chip focused from code while the row mounts leaves the Tab stop on the entry chip (known limit, D81)
- `w-figma-reconcile`: Figma: reconcile Drawer, Stepper, Tag, Toast, Checkbox and Radio pages with the code
- `w-pill-width-and-search`: Filter pills: cap a pill's value width (with a title) and add search to the single-select pill
- `w-users-01-adoption`: users-01: let an app adopt it without forking (swappable detail, switches for Export and selection, install folder, formatting)
- `w-mcp-table-code-cell-backslash`: MCP: a pipe after an odd backslash run inside an inline-code table cell loses one backslash (known limit, D85)
- `w-admin-restore-tests-through-page`: Data table: the admin shell's URL-restore tests should exercise the page, not a copy of its callback
- `w-initial-filters-bare-url`: Data table: make initialFilters survive a bare URL in a URL-synced view (a design first)
- `w-registry-example-imports`: Decide how registry example items import the components they depend on
- `w-popup-logical-side-slide`: Popups: no slide for logical sides inline-start/inline-end
- `w-popup-keyboard-instant`: Keyboard-opened submenu, Select and Combobox still animate (no data-instant)
- `w-reduced-motion-fade`: Reduced motion: keep a short opacity fade instead of zeroing every duration
- `w-hover-pointer-fine`: Hover gating: also require (pointer: fine)?
- `w-ci-linux-parity`: A way to run the browser suites on Linux before pushing (three Linux-only test failures on 19 Nov: fonts, touch)
- `w-wish-timeline-item`: Timeline item component (asked by herdr-lead for a local page; owner decides)
- `w-wish-freshness-indicator`: Freshness indicator (data age / last updated; asked by herdr-lead; owner decides)
- `w-wish-app-sidebar-shell`: App sidebar shell: does sidebar + admin-01 cover it? (asked by herdr-lead; owner decides)
- `w-strings-slice1-later`: Strings slice 1: non-blocking findings collected (Codex r1 3, 9, 10; blind reader's nine suggestions)
- `w-bottom-nav-later`: bottom-nav-01: later items from review r5
- `c-ffa46c`: ToggleGroup press stories: a delayed shrink on a selected vertical item under hover passes (also on main's story)
- `c-db5a3f`: ToggleGroup press stories: a vertical-only active:delay-(--duration-fast) passes (also on main's story)
- `c-035735`: ToggleGroup press stories: transition-none in place of Toggle's transition passes (also on main's story)
- `w-popup-rtl-pass-direction`: Popups: pass direction to the nine portaled parts (one RTL region in an LTR page)
- `c-eb00d6`: Dropdown submenu chevron: a consumer class that sets direction on the SubTrigger's children moves the chevron beside the label (Codex r1 finding 1, D205)
- `c-4192f2`: Button: no variant styles the Base UI disabled state (data-disabled / aria-disabled: focusableWhenDisabled, a disabled link)
- `w-component-pages-direction-sentence`: Component pages: correct the repeated DirectionProvider sentence (54 pages)
- `c-smoke-docs-later`: Smoke-docs comment and test: two later notes from the review of c-c720e4
- `c-428aef`: packages/ui: tsc6 --noEmit over the test files reports 25 type errors on main (6be9f300); not part of CI's typecheck
- `c-button-variants-rsc`: buttonVariants cannot be called from a consumer's Server Component (button.tsx is a client module)
- `c-storybook-timeout-reload`: Measure a page reload after a timed-out Storybook play
- `c-pagination-link-later`: Pagination and Button-as-link leftovers found in review
- `c-27aa48`: Docs housekeeping, later: Tabs page order and demo counts, add:component should run gen:static-paths, stale test header
- `c-a94115`: Scaffold: later findings from Codex c-77071c (entry spellings, unreadable folder, indented registry close)
- `w-scaffold-reg-ts`: Scaffold 2/3: read and edit the two TypeScript arrays as literals (rows 4-8, 10)
- `w-scaffold-lookup-errors`: Scaffold 3/3: a lookup error other than ENOENT stops the preflight (rows 9, 10)

## Triage (looked at, not planned)
- `c-d694ea`: Popup-origin scan: known gaps (element access, re-exports, let reassignment, loop bindings)
- `c-4cee0d`: UI test files fail tsc6 --noEmit -p packages/ui/tsconfig.json (ten files); CI does not typecheck them
- `c-89bcc8`: Combobox: three observations of the second review (later)
- `c-9550c9`: ComboboxChip: one-shot iterator children blank on a second render
- `c-207db7`: Storybook tests: add a WebKit project (accessible names)
- `c-224b2c`: a11y names: the blind reader's notes for later
- `c-3096b1`: ci-local changes tracked registry files for seconds while reviewers read the same worktree
- `c-79d870`: Docs: should API tables show the className state callback? (72 rows say string, 3 give the callback; Codex asked for it on DropdownMenuSubContent; D166)
- `c-3dae17`: Submenu RTL: later items from blind r2 (rtl.mdx wrapper snippet leaves portaled rows LTR; three suggestions)
- `c-4e91d0`: Badge soft contrast test: read every TableRow class string and group variants (Codex r2 Later notes); badge.mdx:81 old palette steps
- `w-scaffold-reg-json`: Scaffold 1/3: read and edit the JSON registries by their fields (rows 1-3, 10)
