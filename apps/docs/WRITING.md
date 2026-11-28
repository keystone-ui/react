# Writing the Keystone UI docs

This guide sets how pages under `apps/docs/content/docs/` are planned, shaped and written. It combines the [Diátaxis](https://diataxis.fr) framework, which decides what job each page does, with the Vercel [writing guidelines](https://github.com/vercel-labs/writing-guidelines), which decide how each sentence reads. `node scripts/lint-docs-prose.mjs` (part of `pnpm lint:docs`) enforces the mechanical rules; everything else is on the author and the reviewer.

## Pick one job per page

Every page does exactly one of the jobs below and declares it in frontmatter as `contentType`. Readers arrive with one need, and a page that tries to teach, instruct and describe at once serves none of them well. When a page starts doing a second job, split the second job into its own page and link to it.

| `contentType` | Reader need | Lives under | Example |
| --- | --- | --- | --- |
| `Tutorial` | Learn by doing, guided | `/docs/tutorials/` | Build your first screen |
| `How-to` | Finish a task they already understand | `/docs/guides/` | Enable dark mode |
| `Conceptual` | Understand why it works this way | `/docs/concepts/` | Popup layering |
| `Reference` | Look up a fact | `/docs/reference/`, `/docs/components/`, `/docs/blocks/` | Button props |
| `Troubleshooting` | Fix an error they hit | `/docs/guides/` | MCP server does not start |
| `Landing` | Choose where to go | Section index pages | `/docs` |

Use these tests to tell the types apart:

- **Tutorial or how-to**: a tutorial is for someone who has never done this and needs a safe path that always works. A how-to is for someone who knows what they want and needs the steps. If the reader chose the goal, it is a how-to.
- **How-to or reference**: a how-to is ordered by the reader's task. Reference is ordered by the shape of the product (props, tokens, files). If it has numbered steps, it is a how-to.
- **Conceptual or reference**: reference states what is true. A concept page explains why it is true and what follows from it. If you would delete the sentence when the API changed, it is reference.

Component and block pages are `Reference`. They keep their recipes short: a recipe longer than one example belongs in a guide, and the component page links to it. Design rationale belongs in a concept page.

## Plan before you write

Write the plan in the pull request description before writing the page. The plan has 5 parts:

1. **Overview**: what the page covers, in one sentence
2. **Goal**: a testable verb from [Bloom's taxonomy](https://en.wikipedia.org/wiki/Bloom%27s_taxonomy), such as "configure dark mode" or "explain why popups sit above modals"
3. **Audience**: who arrives here and what they already know
4. **Content plan**: the `contentType` and the section outline
5. **Open questions**: what you still need to verify

Title the page around the reader's question, not the feature's name. "Enable dark mode" finds the reader; "Dark mode" describes the product.

## Shape each page type

Each type has a template in `content/docs/`. Files whose names start with `_` are not published.

- **Tutorial** (`_tutorial-template.mdx`): prerequisites, then numbered steps in `<Steps>`, each ending with something the reader can see working. No choices, no alternatives, no explanations beyond one sentence; link to concept pages instead. Every code block in a tutorial is backed by a demo file so CI compiles it.
- **How-to** (`_how-to-template.mdx`): one-sentence summary of the result, prerequisites, steps, and how to check it worked. Start each step with a verb. Cover the common path; link to reference for every option.
- **Conceptual** (`_concept-template.mdx`): open with the idea in one paragraph, then the reasons, the trade-offs, and what it means for the reader's code. Examples and analogies belong here. No step-by-step instructions.
- **Reference** (`components/_template.mdx`, `blocks/_block-template.mdx`): neutral, complete and in a fixed order, so the reader can quote it in an issue. The frontmatter `description` is the summary, because the page body must open with the preview.
- **Troubleshooting**: name the symptom as the reader sees it (the error text), then the cause, then the fix. Be direct, not apologetic.

Tone follows the type: tutorials are warm and predictable, how-tos are terse, reference is neutral, concept pages explain as if the reader will teach it to a colleague tomorrow, and troubleshooting acknowledges the problem and gets to the fix.

## Voice

- Use active voice. Append "by monkeys" to a sentence; if it still parses, it is passive. "The token is read by the Popup" becomes "the Popup reads the token".
- Address the reader as `you`. Never "the user" or "one" when you mean the reader. "The user" is fine for the end user of an app built with Keystone UI.
- Write steps in the imperative: "Add the provider", not "You will need to add the provider".
- Keep sentences under 20 words where you can, and paragraphs to 2 to 4 sentences on one idea.
- Use contractions (`you'll`, `it's`) and the present tense.
- Use "we" only for deliberate project decisions ("we recommend", "we deprecated").
- Ask no rhetorical questions, including in headings.

## Words to avoid

- **`easy`, `simple`, `quick`**: they pressure a reader who is struggling. Say what makes it small instead: "one command", "the default settings".
- **`just`, `very`, `really`, `simply`**: filler. Delete them.
- **Weasel words** (`significantly`, `many`, `often`, `typically`): give the number or the specific case.
- **Marketing words** (`powerful`, `flexible`, `modern`, `beautiful`): show the capability instead.

Watch for patterns that read as machine-written:

- **Recap transitions**: "Now that we've set up…" repeats the previous paragraph. Start with the next point.
- **Spec-sheet voice**: "provides", "is configurable" sound like a datasheet. Say what the reader does.
- **Personified code**: "hands the browser a URL" gives code a body. Say "the browser fetches the URL".
- **Cold-open paragraphs**: a first sentence that could be a heading has no link to what came before. Carry the subject forward.

## Headings and structure

- Use sentence case in every heading: "Change the control density", not "Change the Control Density". Proper nouns, product names and code keep their case.
- The sidebar shows the page `title`, so the title is sentence case too.
- Make subheadings descriptive: "Popups inside a drawer", not "Notes". A reader should guess the section's content from its heading.
- Open every page with a one-paragraph summary, and every major section with a summary sentence.
- Spell out an acronym on first use: "right-to-left (RTL)".
- Link a term to its concept page the first time it appears.
- Use headings for structure, never `---` rules.

## Lists

- Turn three or more parallel items in a sentence into a list, and introduce it with a colon.
- Number ordered steps; bullet everything else.
- End list items with a period only when they are full sentences.
- Write term lists as `- **Term**: description`.

## Code

- Tag every code block with a language. TypeScript (`tsx`) is the default.
- Wrap multi-step flows in `<Steps>` and `<Step>`.
- Keep snippets to 80 columns and 25 lines. Split longer code with prose that says what each part does.
- Explain every code block in the sentence before it. Never leave a block without a sentence of context.
- Highlight the lines that matter with a meta range: ` ```tsx {4-6} `.
- Show the change, not the defaults. Omit props that are already the default.
- Keep code comments minimal; explanation goes in prose.
- Import from subpaths (`@keystoneui/react/button`), as in the component pages.

## Placeholders, numbers and units

- Write text placeholders in descriptive `snake_case`: `your_project_id`. Never `<TOKEN>`, `xxx` or `YOUR_KEY`.
- Use numerals for counts: "8 variants", not "eight variants".
- Put a space and an uppercase unit after sizes and durations: `64 KB`, `200 ms`. Seconds stay bare: `30s`.

## Typography

- Never use an em dash (`—`) or a spaced hyphen as punctuation. Use a colon, a comma, a period, or a new sentence.
- Use the ellipsis character (`…`), not three dots. Loading states end with it: `Loading…`.
- Straight quotes are fine in source. MDX and code samples need them, so the lint does not ask for curly quotes.

## Emphasis and links

- Use **bold** for UI labels and for the one critical fact in a section, never for tone.
- Use `inline code` for paths, file names, props, tokens and anything a reader would type.
- Write link text that names the destination. Never "here", "this link" or a bare URL.

## Accuracy

- Check every claim against `packages/ui/src` and its tests before publishing. Docs are also read by models through `llms.txt` and the MCP server, so a wrong page spreads.
- Run every code sample. Tutorial and guide code lives in demo files so CI type-checks it.
- Keep one source of truth per fact. If two pages explain the control height ladder, one of them links to the other instead.
- When AI drafts a page, the author is still accountable for it. Say so in the pull request, and have a person review the rendered preview.
- Test the page with a prompt: "Given this goal, can a model finish the task using only this page?"

## Review

- The pull request links the plan, says what to review, and links the preview URL.
- Use suggestion comments for small text fixes, and comments on the preview for anything bigger.
- The author decides. Reviewers flag; disagreement gets a one-line reason and a follow-up issue.

## What the lint checks

`scripts/lint-docs-prose.mjs` fails `pnpm lint:docs` when a page gains any of these:

- an em dash or spaced hyphen as punctuation
- three dots instead of `…`
- a banned word
- "the user" or "one can" (use the allowlist for real end-user references)
- a Title Case heading
- a question in a heading or prose
- a size or duration without a space before the unit
- a code block without a language
- a `---` rule outside frontmatter
- "here" or a bare URL as link text
- a missing or unknown `contentType`

Existing pages are recorded in `scripts/docs-prose-baseline.json`. A page can only lower its counts; run `node scripts/lint-docs-prose.mjs --update-baseline` after fixing one. Legitimate exceptions go in `scripts/docs-prose-allowlist.json` with a reason.

## Moving a page

Docs URLs are not redirected. When a page moves, update every link to its old URL in the same change: the docs content, the READMEs, the agent skill and the MCP server source. Then run `pnpm gen:static-paths`, and carry the page's baseline to its new path with `node scripts/lint-docs-prose.mjs --update-baseline --allow-increase`. `apps/docs/tests/docs-links.test.ts` fails on any link to a page that does not exist.

## Credits

The voice, structure, code and typography rules adapt the Vercel writing guidelines, used under the MIT License:

> Copyright (c) 2026 Vercel Labs
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The page types follow [Diátaxis](https://diataxis.fr) by Daniele Procida.
