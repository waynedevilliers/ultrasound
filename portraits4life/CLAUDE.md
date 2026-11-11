@AGENTS.md

# Project standards (Portraits 4 Life)

Read `docs/DECISIONS.md` before changing design, colors, navigation or page structure. Do not undo a recorded decision unless the owner asks.

## Workflow
- One step at a time. After each step: screenshots at 390x844 and 1440x900 for every page touched, plus a list of changed files. Then stop and wait.
- Owner replies "ok" = commit and push that step. "revert" = discard that step only.
- Branch `feat/salon77-patterns`. Conventional Commits with scopes, for example `feat(hero): ...`. One commit per step.
- Before coding a step, state in 3 to 5 lines which files will change.
- Screenshots are the proof a step is done. A verbal summary is not.

## Hard constraints
- Keep all current colors and font families. Do not add, remove or change color values. Hardcoded values move into tokens with the same value, and each replacement is reported.
- Do not change image sizes, crops or aspect ratios unless a step says so.
- Do not change anything not listed in the current step. Note other findings and report them at the end of the step.
- All visible text lives in `content/` (Salon77 rule). Never hardcode text in components. Every change exists in German and English. German uses "du", lowercase in UI labels.
- No emojis in the UI.

## Code
- TypeScript strict. No `any` without a comment explaining why.
- Server Components by default. Client Components only for real interactivity.
- Small components with typed props. No duplicated code or styles.
- Colors and fonts only from tokens. Product data only from the product data file (Step 2).
- ESLint and Prettier pass with zero warnings. Remove unused files, exports and dependencies. Every new dependency needs a reason.
- Reuse existing components, hooks, utilities and tokens. Do not rewrite working code.

## Performance
- Mobile targets: LCP under 2.5s, INP under 200ms, CLS under 0.1.
- Static generation for all pages unless there is a real reason not to.
- All images via next/image. Fonts via next/font, self-hosted at build time, `display: swap`. No runtime requests to Google.

## Accessibility and usability
- One h1 per page, logical headings, alt texts in both languages, visible focus, contrast at least 4.5:1, tap targets at least 44px with 8px spacing.
- Any important information reachable in 2 clicks from the home page.
- Hover styles only inside `@media (hover: hover)`.

## Testing (lean)
- Test essential functionality only. Vitest + React Testing Library for components, run before each commit. Playwright (Chromium only, one spec file, viewports 390x844 and 1440x900) runs once at the end of a task.
- No snapshot tests, no visual regression, no Lighthouse unless the owner asks.
- If a test fails twice for the same reason, stop and report the error and a best guess. Do not loop. Never delete or skip a failing test.

## Git
- Feature branches only, never commit to `main` directly. Pull `main` before starting and before opening a PR. Merge `main` into the branch, do not rebase a pushed branch.

## Definition of done
- Lint, type check, tests and build pass.
- Screenshots for every visual change.
- Colors, fonts and image sizes unchanged unless the owner asked.
- `docs/DECISIONS.md` updated. Client TODOs listed.

## Review
- Before opening a pull request, run the reviewer subagent on the branch changes. Fix Critical and Important findings first.
- The reviewer never changes code. The builder never skips the review.
- Never run a second Claude Code session that writes to this folder while the builder is working. The reviewer runs as a subagent.
