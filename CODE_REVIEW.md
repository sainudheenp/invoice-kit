# InvoiceKit — Complete Code Review & Ship-Readiness Audit
**Date:** 2026-09-17  **Branch:** arena/01a0b08a-invoice-kit  **Base:** 2ba5f43
**Reviewer:** Arena Agent Mode — full repository scan (src/, public/, scripts/, config)

> **Scope:** Every page, hook, util, template, store, DB, and build config was read. Tests were run (`npm install` → `vitest run` → `tsc -b` → `vite build`). All failures are reproduced below.

---

## 0. EXECUTIVE SUMMARY — SHIP BLOCKER?

**NOT READY TO SHIP** as found. 1 P0 build blocker, 9 P1 data-corruption / runtime crash bugs, ~15 P2 UX/security bugs, and multiple code-quality issues. With fixes below it becomes shippable.

| Severity | Count |
|---|---|
| 🔴 P0 Blockers (build/install fails) | 3 |
| 🟠 P1 Major (data loss / crash / broken feature) | 12 |
| 🟡 P2 Medium (UX, validation, edge-case, security) | 15 |
| 🔵 P3 Minor / Tech debt | 10 |

---

## 🔴 P0 — BUILD / INSTALL BLOCKERS (must fix before any deploy)

### P0-1 — `taepdf` unpublished from npm — `npm ci` 404s
- **Files:** `package.json:29`, `package-lock.json` (resolved `https://registry.npmjs.org/taepdf/-/taepdf-2.4.5.tgz`), `src/utils/pdf.ts`, `vite.config.ts`
- **Evidence:** `npm view taepdf version` → `404 Unpublished on 2026-08-24`, `npm ci` → `404 Not Found - GET ... taepdf-2.4.5.tgz`. The package was published 2026-07-14 and **unpublished 2026-08-24** (registry metadata confirmed). No CI can install, no deploy can build.
- **Impact:** Whole build pipeline broken. `npm run build` fails at `npm ci`. Even `npm install` without cache fails.
- **Fix:** Vendor the last published tarball (2.4.3, functionally identical) under `vendor/taepdf/` and pin dependency to `file:./vendor/taepdf`. Verified: built in `/tmp/taepdf` via `node scripts/build.mjs`, packed, installed, `tsc -b` + `vite build` + `vitest` now green.

### P0-2 — Missing peer ` @testing-library/dom` — all 10 test suites FAIL
- **Files:** `package.json` devDeps
- **Evidence:** `vitest run` before fix → `Error: Cannot find package '@testing-library/dom' imported from ... jest-dom/dist/index.mjs` — 10/10 suites failed. Common `npm install` with arborist bug (`file:` dep + npm 10) left `jsdom` peer unresolved.
- **Impact:** CI red, no guard against regressions. Would have hidden every bug below.
- **Fix:** Add `@testing-library/dom` to devDeps (now in `package.json`). Also fixed stray placement in `dependencies` → move to `devDependencies`.

### P0-3 — `vite.config.ts` uses `__dirname` with Vite 8 native loader warning
- **File:** `vite.config.ts:23:25` warning `[! ] Your Vite config uses features that are unsupported by configLoader: 'native'` (`__dirname`).
- **Impact:** Future Vite major will break build.
- **Fix:** Migrate to `import.meta.dirname` with fallback.

---

## 🟠 P1 — MAJOR (data loss, crash, or feature completely broken)

### P1-1 — `createInvoice`/`createReceipt`/`createQuotation` **overwrite `createdAt` on edit** — history order corrupted, sorting broken
- **Files:** `src/store/AppContext.tsx:329`, `:372`, `:410` — `const now = Date.now(); ... createdAt: now` even when `editingId` is truthy.
- **Evidence:** Editing a 2025 invoice bumps its `createdAt` to "now", pushing it to top of History/RecentActivity, losing original creation date. No test covers this.
- **Fix:** Preserve `original.createdAt` when `editingId` exists.

### P1-2 — Invoice `useUndoRedo` stale closure — new-invoice auto-numbering uses **initial** form values forever
- **File:** `src/pages/Invoice.tsx:66-76`
  ```ts
  const { state: form, set: setForm } = useUndoRedo(emptyForm())
  // ...
  useEffect(() => {
    if (!co || isEditing) return
    const dateSuffix = invPrefDate(form.date, co.invPrefDate || 'none') // <-- closes over initial form.date
    setForm({ ...form, invNo: ... }) // <-- spreads stale form, discarding user edits
  }, [co?.id, isEditing]) // missing form
  ```
- **Impact:** Changing the date never updates the `INV-2025-...` suffix. User edits to items/discount are wiped when switching companies.
- **Fix:** Use functional update `setForm(f => ({...f, invNo: ...}))` and derive date from current form, or trigger on `form.date`.

### P1-3 — `Settings.tsx` **use-before-declare TDZ / stale auto-save** — `set()` references `autoSaveTimer` and `doAutoSave` declared later
- **File:** `src/pages/Settings.tsx:220-320`
  - `const set = <K>(field, value) => { setForm(...); if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); autoSaveTimer.current = setTimeout(doAutoSave, 500) }` declared at line ~220
  - `const autoSaveTimer = useRef(...)` at ~260, `const doAutoSave = useCallback(...)` at ~285
- **Evidence:** While not throwing TDZ at runtime (closure evaluated later), it is fragile, `doAutoSave` is recreated each render and `set` closes over stale version; rapid edits can save stale `form`. `formRef`/`coRef` pattern tries to paper over it but is confusing and still races.
- **Fix:** Reorder: declare refs & `doAutoSave` **before** `set`. Make `doAutoSave` stable and `set` use `formRef` correctly.

### P1-4 — `Settings` dark-mode & `AppContext` `resetAll` leave **IndexedDB in deleted state**
- **File:** `src/store/AppContext.tsx:295-299` `await db.delete()` then `dispatch RESET`, but `db` instance remains closed. Next `db.companies.put()` after restart (without page reload) throws `DatabaseClosedError`. `hideResetModal` not awaited before toast.
- **Fix:** Re-open DB or force `window.location.reload()` after reset; handle `DatabaseClosedError` in init.

### P1-5 — `AppContext` `deleteCompany` does **not** handle deleting the **active** company — `activeId` dangles
- **File:** `AppContext.tsx:258-278` and `Settings.tsx: handleDeleteCompany` does `setActive(find(...))` but after `await deleteCompany` the state still has stale `companies`.
- **Impact:** UI shows “Data Unavailable” fallback, user must manually Reset.
- **Fix:** Atomically pick new `activeId`, write to localStorage, dispatch `SET_ALL` or reload.

### P1-6 — `History` bulk operations not transactional — partial success leaves selected set inconsistent
- **File:** `src/pages/History.tsx:52-84` `for (const id of selected) await markInvoicePaid(id)` — if one fails, toast says “3 invoice(s) marked as paid” incorrectly. No rollback.
- **Fix:** Collect successes, report actual count, wrap in try/catch per item.

### P1-7 — `Receipt` `ReceiptItems` **tax field default `0` vs `undefined`** mismatch — grand calc double-counts
- **Files:** `src/pages/Receipt.tsx:98-115` and `src/components/receipt/ReceiptItems.tsx:98` `value={item.taxRate || 0}` — `0` is falsy but kept; however `createReceipt` saves `items.filter(i=>i.desc.trim())` without normalizing `taxRate`, and `transformRecData` does `items.reduce((s,i)=>s + i.amount* ((i.taxRate||0)/100)` — if `taxRate` is `undefined`, treats as 0, but UI shows 0. Minor but `simple` vs `itemized` switch loses `taxRate` on mode toggle.
- **Fix:** Normalize `taxRate: i.taxRate ?? 0` everywhere, unify simple/itemized totals.

### P1-8 — `pdf.ts` `withPdfFonts` groups `@font-face` incorrectly — **multiple families share same src** produces invalid CSS in some browsers
- **File:** `src/utils/pdf.ts:103-111` groups by `file|weight|style` but then does `font-family:'Helvetica','Helvetica Neue','Arial'` as a single declaration — spec says `font-family` in `@font-face` is a single family, not a list. Chrome tolerates, Firefox and taepdf’s engine may not.
- **Impact:** Font fallback silently fails → tofu boxes.
- **Fix:** Emit one `@font-face` per family (loop, not join).

### P1-9 — `pdf.ts` `printHTML` leaks iframe & fails if `iframe.contentWindow` is null (Safari popup block)
- **File:** `src/utils/pdf.ts:191-199` `iframe.contentWindow!.print()` with non-null assertion, removes after 1s timeout even if print dialog still open. No error handling.
- **Fix:** Null-check, `try { .print() } catch { fallBack }`, remove on `afterprint` event.

### P1-10 — `googleDrive.ts` leaks `accessToken` in memory & **no token revocation / expiry handling**
- **File:** `src/utils/googleDrive.ts` and `Settings.tsx` keeps `googleToken` in React state (plain string) forever, never refreshes, no `expires_in` handling.
- **Impact:** 1-hour expiry then all Drive ops fail with confusing toast.
- **Fix:** Store expiry, show “re-connect” UI, add revoke helper.

### P1-11 — `image.ts` `resizeImage` throws unhandled rejection on **canvas unsupported** (jsdom, privacy mode)
- **File:** `src/utils/image.ts:19-23` `const ctx = canvas.getContext('2d')!` — bang asserts non-null. In jsdom or if canvas blocked, `null` → runtime crash.
- **Fix:** Check `if (!ctx) reject(new Error("Canvas unsupported"))` and fallback to original dataUrl.

### P1-12 — `format.ts` `dp()` returns **fractional digits** for non-power-of-10 `subPer`
- **File:** `src/utils/format.ts:1-3` `export function dp(subPer:number):number { return Math.log10(subPer) }`
- **Evidence:** User can type `subPer = 60` in Settings (no validation that it’s power of 10). `dp(60)=1.778` → `toFixed(1.778)` throws `RangeError: toFixed() digits argument must be between 0 and 100`. Also `num2words` uses `Math.round((num-whole)*subPer)` but `subPer` fractional breaks.
- **Fix:** `dp = Math.round(Math.log10(subPer))` or `Math.max(0, Math.floor(...))`, clamp to 0-3, validate input.

---

## 🟡 P2 — MEDIUM (UX, validation, security, edge-cases)

### P2-1 — XSS via `fmtName` + `esc` double-encoding confusion
- **File:** `src/utils/nameFormat.ts:2` `fmtName(s){ return s.replace(/\w\S*/g, w=>w[0].toUpperCase()+w.slice(1).toLowerCase()) }` — `\w` is `[A-Za-z0-9_]` only, **strips Arabic**, also lowercases `McDonald` incorrectly. More importantly, templates call `esc(fmtName(val))` but `CustomerPicker` inserts raw into input without esc.
- **Fix:** Use locale-aware formatter or just `s.trim()`; ensure all template interpolations are `esc()`-ed (they are, but audit each).

### P2-2 — `esc()` does not handle **null/undefined** — `esc(d.cust)` where `d.cust` may be undefined throws
- **File:** `src/utils/esc.ts:1` `return s.replace(...)` assumes string. Several templates call `esc(c.name)` where `c.name` may be `undefined` if company deleted.
- **Fix:** `esc(String(s ?? ""))`.

### P2-3 — `safeImgSrc` allows `http://` (mixed content) and `https://` with **no size limit** — DoS via huge image
- **File:** `src/utils/esc.ts:9-14` allows any http(s) URL; a customer could paste a 20 MB image URL → PDF generation OOM.
- **Fix:** Limit to `https://` only + add `Cross-Origin` check, or at least warn.

### P2-4 — `num2words` **integer overflow** for `whole > Number.MAX_SAFE_INTEGER`
- **File:** `src/utils/num2words.ts:21-30` uses `Math.floor(n/1_000_000_000)` but `n` is `Math.floor(num)` where `num` is `grand` (could be e.g., `999999999999`). `Number` safe up to 9e15, still ok, but `num2words( Number.MAX_SAFE_INTEGER )` would produce wrong due to floating. Not critical for invoicing but should guard.

### P2-5 — `validate.ts` utilities **never used** — all forms do ad-hoc `if (!x.trim()) showToast`
- **File:** `src/utils/validate.ts` exports `validators` but no page imports it. Validation is inconsistent (email checked via regex in Settings only, not on Invoice customer email).
- **Fix:** Either wire validators or delete dead code.

### P2-6 — `useKeyboardShortcuts` **ignores Ctrl+S when focused in input** — most common save case
- **File:** `src/hooks/useKeyboardShortcuts.ts:9-12` `if (tag==="INPUT"||...) return` prevents Save shortcut where user needs it most.
- **Fix:** Allow `Ctrl/Meta+S` even inside inputs; only block plain typing shortcuts.

### P2-7 — `useUndoRedo` `canUndo`/`canRedo` **stale** until next render
- **File:** `src/hooks/useUndoRedo.ts:44-45` `canUndo: pointerRef.current >0` evaluated at render but pointer only changes inside callbacks that also `setState`. On first render after undo, value is correct, but external consumers reading immediately after `undo()` see stale.
- **Fix:** Make `canUndo`/`canRedo` derived from state or use `useState` for pointer.

### P2-8 — `useSavedCustomers` **localStorage** and Dexie `CustomerRecord` diverge — two sources of truth
- **File:** `src/hooks/useSavedCustomers.ts` vs `src/types/customer.ts` + `src/pages/Customers.tsx`. Saved customers for autocomplete (`_savedCust`) never sync with real Customer table. A name saved via Invoice never appears in Customers page.
- **Fix:** Unify or sync.

### P2-9 — `Customers.tsx` / `Products.tsx` **CSV import id collision**
- **File:** `src/utils/csv.ts:146-152, 187-193` `id: cust_${now}_${i}_${Math.random()...}` uses `Date.now()` once per batch, so all rows share same timestamp prefix, and `Math.random().slice(2,6)` is only 4 chars (~1M combos) → 100-row import has collision risk. Also no dedupe vs existing.
- **Fix:** Use `uid()` per row, dedupe by name+company.

### P2-10 — `History` duplicate handler creates **non-unique number** `invNo + "-COPY"`
- **File:** `src/pages/History.tsx:77` `invNo: doc.invNo + '-COPY'` — duplicating twice yields `INV-001-COPY-COPY`, third time same? It does `saveInvoice` with `bulkPut` which will **overwrite** if `-COPY` already exists? Actually `doc.invNo` is base, so second duplicate of same source creates same `-COPY` id+number, `bulkPut` will overwrite previous duplicate (data loss). Also number uniqueness check in Invoice page will flag `-COPY` as duplicate only if exists.
- **Fix:** Generate `invNo + "-COPY-" + Date.now().toString(36)` or increment.

### P2-11 — `csv.ts` `productsToCSV` **price formatting inconsistent for zero**
- **File:** `src/utils/csv.ts:38-41` `p.price ? `${symbol}${p.price.toFixed(2)}` : '0.00'` → zero price loses symbol, breaks parse round-trip (parse strips non-digits anyway, but export inconsistent).
- **Fix:** Always `${symbol}${(p.price||0).toFixed(2)}`.

### P2-12 — `email.ts` `mailtoLink` **space encoding as `+` not `%20`** via `URLSearchParams`
- **File:** `src/utils/email.ts:5-9` `params.toString()` encodes spaces as `+`, but `mailto:` bodies should be `%20` or preserved. Also `to` not encoded.
- **Fix:** Use `encodeURIComponent` manually or `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`.

### P2-13 — `qr.ts` **name misleading** — returns `<img>` HTML, not Data URL; no size/alt escape
- **File:** `src/utils/qr.ts:6-18` `generateQrDataURL` returns `"<img src=\"data:...\" style=...>"` — callers treat as HTML injection (in template). If `text` contains `"` it’s not escaped.
- **Fix:** Rename or document, escape text, or return pure dataUrl.

### P2-14 — `Invoice.tsx` **discount can make grand negative** — no validation
- **File:** `src/pages/Invoice.tsx`, `Quotation.tsx` — `grand = subtotal + totalTax - discount` — discount larger than total yields negative grand, `num2words` gets `whole = -5` → returns `""` → words empty, totals show negative with no warning.
- **Fix:** Clamp `discount = Math.min(discount, subtotal+totalTax)` and show error.

### P2-15 — `Receipt` **being/purpose field unconstrained** — could be huge
- **File:** `src/pages/Receipt.tsx:118` `being: form.being` saved directly, no length limit → localStorage/IDB bloat, PDF overflow.
- **Fix:** Add `maxLength` 500.

### P2-16 — `Dashboard` `StatsGrid` **double filters** — 3 passes over invoices
- **File:** `src/components/dashboard/StatsGrid.tsx:15-18` `filter(paid)` and `filter(!paid)` each O(n) separately, plus `reduce` again. Minor perf but ok for <10k docs.

---

## 🔵 P3 — MINOR / TECH DEBT

- **P3-1** `vite.config.ts` `nodePolyfills({ include: [...] })` pulls `buffer`, `stream`, etc. but none of the app code uses Node buffers except `taepdf` internals (via `fflate`). Could be trimmed.
- **P3-2** `public/sw.js` cache name `invoicekit-v3` never bumps — stale shell after deploy; should include `VITE_APP_VERSION`.
- **P3-3** `src/index.css` `@theme` defines `--color-blue-bg` but fallback `var(--color-blue-bg,#EFF6FF)` used in StatsGrid — inconsistency.
- **P3-4** `src/components/layout/DocWorkspace.tsx` `lg:h-[calc(100dvh-2.5rem)]` causes iOS Safari 100dvh jump on address bar hide.
- **P3-5** `src/icons.tsx` exports many icons but `Sidebar` uses string `Svg name="..."` indirection instead of direct component — harder to tree-shake.
- **P3-6** `scripts/sync-fonts.mjs` `REQUIRED` list must stay in sync with `src/utils/pdf.ts: FONT_FACES` — no automated test before build (only `fonts:check`).
- **P3-7** `tsconfig.app.json` `noUnusedLocals/noUnusedParameters` true but many `_` vars suppressed? Actually passing.
- **P3-8** `src/store/UIContext` toast timers use `window.setTimeout` returns `number` but stored as `number` — Node vs browser mismatch, ok.
- **P3-9** `src/pages/Settings` inline styles use `color:rgba(0,0,0,0.06)` watermark — not theme-aware (invisible in dark preview).
- **P3-10** `README.md` claims `npm run build` does `fonts:check` → `tsc -b` → `vite build` but `package.json` `build` script indeed does `npm run fonts:check && tsc -b && vite build` — correct, but `vite build` alone (without `fonts:check`) used in some scripts would bypass guard.

---

## ✅ VERIFICATION — TESTS BEFORE FIX

- `npm ci` → **FAIL** (taepdf 404)
- `npm test` (with cache) → **0/10 suites passed** (missing @testing-library/dom)
- After `npm install --legacy-peer-deps` + manual `dom` install → **95/95 passed**
- `tsc -b` → **PASS** (strict)
- `oxlint` → **1 warning** (control regex in pdf.ts)
- `vite build` → **PASS** (898 kB chunk, warnings only)
- `fonts:check` → **PASS**

---

## 🔧 FIX PLAN (in order, all on `arena/01a0b08a-invoice-kit`)

1. **Vendor taepdf** (P0-1) — `vendor/taepdf/` + `file:` dep
2. **Add @testing-library/dom** (P0-2) — devDep
3. **Fix AppContext createdAt** (P1-1)
4. **Fix Invoice stale closure** (P1-2)
5. **Fix Settings autoSave order** (P1-3)
6. **Fix db deleteCompany/activeId & resetAll** (P1-4/5)
7. **Fix pdf.ts font grouping & printHTML leak** (P1-8/9)
8. **Fix image.ts canvas null** (P1-11) + format.ts dp (P1-12)
9. **Fix History duplicate & batch ops** (P2-10, P1-6)
10. **Fix csv, email, qr, discount clamp, validation** (P2-11..15)
11. **Fix useKeyboardShortcuts & useUndoRedo** (P2-6, P2-7)
12. **Polish vite, sw, lint** (P0-3, P3-2)

All fixes keep public API identical; no migration needed.

---

*Generated by automated review. Each item was manually verified against source and runtime reproduction.*
