# Review: chore/deps-format-orderform (2026-11-19)

Scope: `git diff main...HEAD`, commits 914eb79 (deps), 77549bb (OrderForm split), d2527db (Prettier).
Node: v22.17.0 via `nvm use` (.nvmrc).

## Verdict: Ready

No Critical or Important findings. Five Minor items below; none blocks the merge.

## Critical

None.

## Important

None.

## Minor

1. **lib/order-submit.ts:146-150: `OrderFormData` is looser than the state type on main.**
   The mapped type makes `product` and `canvasSize` plain `string`. On main, `product` was inferred as
   `'canvas' | 'digital'`. Runtime behaviour does not change (the server validates with Zod), but a typo such as
   `product === 'canvass'` would no longer be a type error.
   Fix: type `product` as `FormatChoice['product']` (or `'canvas' | 'digital'`) and `canvasSize` as the canvas size
   id type in `OrderFormData`.

2. **lib/order-submit.test.ts:87-96: the payload test does not pin the exact shape.**
   `toMatchObject` passes if a field is dropped from `buildOrderPayload` (for example `childName`,
   `weeksInWomb`, `deliverToOther`, `shippingRecipient`, `specialRequests`) or if an extra one is added. This is the
   contract with `/api/orders`, so a full `toEqual` on one canvas payload is worth having.
   Fix: assert the whole object with `toEqual` for the canvas case.

3. **package-lock.json: `libc` fields were restored by hand.**
   I checked this: all 80 `libc` entries match main, no kept package lost or changed a field, apart from the
   expected `dev`/`optional`/`peer` flags (`@babel/runtime`, `@noble/hashes`, `@types/react`, `csstype`,
   `source-map`). 137 entries were removed and none added. Root deps match package.json, every dependency
   resolves, nothing is unreachable, and `npm ls` shows no missing or invalid entries. (The `extraneous` wasm
   packages it lists are the same on main.) The risk is that the next `npm install` with this npm version drops the
   fields again.
   Fix: add a line to docs/REMAINING.md (or DECISIONS) that `libc` lines must be checked after each lockfile
   change, or pin the npm version that keeps them.

4. **knip.json:3: knip prints a configuration hint:** `.css  Compiled extension excluded by project (imports not followed)`.
   Because CSS is not followed, `tailwindcss` has to sit in `ignoreDependencies`.
   Fix: either accept this (the hint is harmless) or add `css` to `project` and see whether the `tailwindcss`
   ignore can go.

5. **Commit hygiene: d2527db also carries the docs for commits 1 and 2.**
   docs/DECISIONS.md and docs/REMAINING.md changed only in the `style:` commit. CLAUDE.md asks for one commit per
   step, with the docs updated as part of that step. Reverting the style commit alone would also remove the docs
   for the deps and split changes.
   Fix: none needed now. In future, put each step's docs in that step's commit.
   Related doc accuracy: DECISIONS says "the shadcn leftovers are removed", but the shadcn tokens are still in
   app/globals.css (`:root` and `.dark` variables, `--chart-*`, `--sidebar-*`, `@custom-variant dark`, lines 1-3
   and about 100-170). Some are still used (`--radius` drives `rounded-*`; `border-border`, `bg-background` and
   `outline-ring` in `@layer base`), and removing color values needs owner approval. Fix: reword the entry to
   say "packages and files" and list the unused CSS tokens as an open item.

## Verified (behaviour of the OrderForm split, compared line by line with main)

- Validation: `findMissingFields` keeps main's rules and messages. Required: name and email; for canvas also
  street, city and postal code; recipient when `deliverToOther` is on. It also keeps the `@` check on email,
  the postal code check only for canvas with a valid country and a non-empty code, `ultrasound`, and
  `consentProcessing` / `consentRights` with `consentRequired`.
- Payload: same keys in the same order (`...meta` spreads website, requestCode, locale, ultrasoundPath and
  referencePath in main's order). The two required consents are hard-coded to `true` and the version is
  `CONSENT_VERSION`. Shipping fields and `canvasSize` are sent only for canvas.
- ids: `aria-invalid` / `aria-describedby="{key}-error"` come from `invalidProps`. `FieldError` ids match.
  The format select still uses `formatErrorKey` (canvasSize or product) for both the aria link and the
  message. The ultrasound upload still uses the `ultrasound` key, and UploadArea renders `errorNode` as is, so a
  `FieldError` that returns null behaves like main's null.
- Honeypot (`website`, off-screen, `tabIndex=-1`, read from `form.elements`), noValidate, rate/5xx/4xx handling,
  `readReply`, success flow and reset are all unchanged. File checks keep the order size then type, with the
  same messages.
- Markup: only `deliverToOther` and `consentShowcase` gained a wrapper div. `mt-6` moved from the label to the
  div, and `min-h-11 py-2` stayed on the label, so the layout is the same.
- Removed packages: nothing in app/, components/, lib/, scripts/ or CSS imports them. No `tw-animate-css`
  or shadcn variant classes are used (the only match, `cursor-zoom-in`, is core Tailwind). `dotenv` is used only
  by scripts/init-db.js, so a dev dependency is right. It was already locked at 17.4.2 as dev.
- Prettier commit: I compared the TypeScript syntax tree (kinds, identifiers, literals, JSX text) before and after
  for all 37 code and config files. Every file is identical apart from added parentheses in JsonLd.tsx and
  Header.test.tsx. JSON data (messages, vercel.json, lighthouserc.json) is identical once parsed. Comments are
  unchanged. The only `eslint-disable-next-line` (components/Header.test.tsx:10) sits directly above `<img`.
  globals.css is identical once whitespace and quotes are normalised.
- Checks run on Node 22: type-check pass, lint pass (0 warnings), `npm test -- run` 52 files / 282 tests
  pass, knip clean (exit 0, one hint), `prettier --check .` pass.
- Not re-run by me: build, Playwright, and the built-CSS comparison for removing the `shadcn/tailwind.css` and
  `tw-animate-css` imports. These are taken from the builder's report.

## Client TODO list

No new items from this branch. The existing `TODO(client)` at components/OrderForm.tsx:521 (trust text and
consent wording) is unchanged.
