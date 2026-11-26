@AGENTS.md

# Project standards (Portraits 4 Life)

Read `docs/DECISIONS.md` before changing design, colors, navigation or page structure. Do not undo a recorded decision unless the owner asks.

## Workflow
- One step at a time. After each step: screenshots at 375x667 and 1440x900 for every page touched, plus a list of changed files. Then stop and wait.
- Owner replies "ok" = commit and push that step. "revert" = discard that step only.
- The owner may ask for several steps in one pull request. Each step is still its own commit.
- One branch per task, from an up-to-date `main`: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `style/`, `refactor/`. Conventional Commits with scopes, for example `feat(hero): ...`. One commit per step.
- The owner sometimes opens the pull request from the pushed branch. Check `gh pr list --head <branch>` before creating one.
- Run every npm command on Node 22 (`nvm use`). Node 20 fails the tests with `ERR_REQUIRE_ESM`.
- Stop a running `next start` (find its pid with `ss -ltnp | grep :3000`) before `npm run build`. Never `pkill -f`.
- Before coding a step, state in 3 to 5 lines which files will change.
- Screenshots are the proof a step is done. A verbal summary is not.

## Hard constraints
- Keep all current colors and font families. Do not add, remove or change color values. Hardcoded values move into tokens with the same value, and each replacement is reported.
- Do not change image sizes, crops or aspect ratios unless a step says so.
- Do not change anything not listed in the current step. Note other findings and report them at the end of the step.
- Prose (all visible text) lives in `messages/de.json` and `messages/en.json` (next-intl). Data that is not prose (products, prices, routes, links, image paths) lives in `content/`. Components only take props. Never hardcode text in components. Every change exists in German and English. German uses "du", lowercase in UI labels.
- No emojis in the UI.

## Code
- TypeScript strict. No `any` without a comment explaining why.
- Server Components by default. Client Components only for real interactivity.
- Small components with typed props. No duplicated code or styles.
- Colors and fonts only from tokens. Use the palette names in `app/globals.css` (`text-ink`, `bg-canvas`, `border-line`, `text-brand`, ...). Never use raw Tailwind colors such as `gray-600` or `pink-400` in components. Product data only from the product data file (Step 2).
- ESLint and Prettier pass with zero warnings (Prettier skips Markdown). knip reports nothing. Remove unused files, exports and dependencies, with the owner's approval. Every new dependency needs a reason and an exact version at least two weeks old.
- After `npm install` or `npm uninstall`, check the lockfile diff for removed `libc` lines and restore them.
- Long legal texts live in `content/legal/<page>.<locale>.md`, not in the message files.
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
- Test essential functionality only. Vitest + React Testing Library for components, run before each commit. Playwright (Chromium only, one spec file, viewports 375x667 and 1440x900, as set in `playwright.config.ts`) runs once at the end of a task.
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

## Agents
All agents are in `.claude/agents/`, read only, and write one report to `docs/reviews/`.
- reviewer: before every pull request, and for full audits.
- visual-checker: after layout or styling changes, before showing a step to the owner.
- mobile-view: after layout, navigation or styling changes.
- performance: after images or anything external change, and before launch.
- datenschutz: before launch, after adding any service, dependency, cookie or form field, after changing legal texts, and once a month. Any change that adds a service or form field is not done until the Datenschutz text covers it.
- Command `/client-list`: a German message for the client with every open TODO(client).

## Handover
- Start every session by reading `docs/local/NEXT_SESSION.md` (local, git-ignored): where we left off and what to do first, across projects. Update it at the end of every session. Never commit it.
- `docs/REMAINING.md` starts with the next steps. Update it at the end of every task.
