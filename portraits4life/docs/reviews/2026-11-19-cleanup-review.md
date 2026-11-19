# Review: chore/cleanup-batch (2026-11-19)

Scope: `git diff main...HEAD` (commits bfeab9d, 5387490): middleware.ts to proxy.ts, photo-check error split in `app/api/orders/route.ts`, `docs/REMAINING.md`.
Node: v22.17.0 via `nvm use` (.nvmrc). The builder committed 5387490 while this review was running; the review covers the final branch state.

## Verdict: Ready (no Critical findings; one Important finding that does not block the merge)

## Critical
None.

## Important
1. **A storage outage still does not quickly give a 500 with the request code.** `app/api/orders/route.ts:122`
   - What is wrong: `head()` in @vercel/blob 2.8.2 retries `unknown_error`, `service_unavailable`, `internal_server_error` and network errors with async-retry (10 retries, exponential backoff starting at 1 s; `dist/chunk-XKVPKJPO.js` `requestApi`). In a real outage the new `throw lookupError` only runs after minutes. Before that, the function hits its Vercel time limit.
   - Why it matters: the visitor sees a spinner for minutes. The function is killed before the outer catch runs, so the `[order xxxx] photo-check failed` log line is never written. The form still shows the server error with the code, because a 504 is >= 500 and `readReply` handles a body that is not JSON. But no server log line carries that code. This happened before the branch too; the branch fixes the classification but not the delay.
   - Suggested fix: `head(photo.pathname, { abortSignal: AbortSignal.timeout(8000) })`. An abort raises `BlobRequestAbortedError`, which the new code passes on as a 500 with the code. Add one test for it.

## Minor
2. **Commit bfeab9d does not build on its own.** That commit renames the file but keeps `export function middleware` in `proxy.ts`. The proxy docs (`proxy.md:60`) say a proxy file must export `proxy` or a default function. Its message also describes route changes that only arrive in 5387490. The branch is already pushed (no rebase), so squash-merge the PR to keep `main` buildable at every commit.
3. **The start of `docs/REMAINING.md` is out of date.**
   - Line 3: the status date still says 2026-11-15.
   - Line 21: the knip line lists `components/ui/button.tsx`, `components/ui/tabs.tsx` and `lib/db.ts`, which no longer exist. The same stale list is in the audit section (about line 56).
   - Today knip reports: unused file `lib/utils.ts`; unused deps `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tw-animate-css`; unused devDeps `prettier`, `shadcn`, `tailwindcss` (the last 3 are probably false positives from CLI/CSS use); unlisted `dotenv`.
4. **knip.json has config hints.** `knip.json:2` lists `vitest.config.ts`, which matches nothing (the file is `vitest.config.mts`). knip also flags `proxy.ts`, `i18n.ts`, `next.config.ts`, `vitest.setup.ts` and `playwright.config.ts` as redundant entries, and the `.next/**` and `node_modules/**` ignores as unneeded. Fix this in the same knip clean-up.
5. **No DECISIONS.md entry for the rename.** `docs/DECISIONS.md:240-245, 493` still say "middleware". These are historical entries, so a one-line dated note ("middleware renamed to proxy, Node.js runtime, behaviour unchanged") is enough. The Definition of done asks for DECISIONS to be updated.
6. **Stray untracked file.** `test.wav` (529 KB) sits in the project root. Do not commit it; delete it or add it to .gitignore.

## Verified and passed
- `BlobNotFoundError` is exported by the installed @vercel/blob 2.8.2 (`dist/index.d.ts:45`, export list line 575). The ESM and CJS entries share one chunk with `head`, so `instanceof` works.
- `head()` maps API code `not_found` to `new BlobNotFoundError()` and calls `bail()`, so a missing blob is not retried and fails at once.
- Route flow: `step = 'photo-check'` is set before the loop. Errors other than not-found are rethrown, and the outer catch logs them under `photo-check` and returns `{ code: requestId }` with status 500. Only `BlobNotFoundError` gives a 400 with field `issues`. After the loop, only the config check (which returns) runs before `step = 'save'`, so no later failure is logged under the wrong step.
- Test mock: `importOriginal` spread keeps the real error classes and replaces only `head`. The missing-photo test throws a real `BlobNotFoundError`. The outage test checks the 500 response, the code format, that `issues` is missing, the log line and that `sql` is not called.
- Form: for a 500 without `issues`, `OrderForm.tsx:329` throws `OrderStageError('server', requestCode)`, so the visitor sees the localized `serverError` plus "(Fehlercode/Error code: …)". The code matches the server's because the browser sends `requestCode` (route.ts:89-93). Covered by `OrderForm.test.tsx:232`.
- Proxy: exports `proxy`, has no `runtime` export (that would throw in a proxy file), and keeps the same matcher. `next-intl/middleware` and `process.env.COMING_SOON` work on the Node.js runtime. No other file imported `middleware.ts`, no edge runtime is set anywhere, and vercel.json and next.config.ts do not mention it. The comments in `app/page.tsx` and `coming-soon/page.tsx` are updated. `lib/site-mode.ts` needs no change.
- Focused tests on Node 22: route, site-mode and OrderForm tests, 59/59 passed. Spot check: no hardcoded visible text in components (only the brand name as the logo alt).
