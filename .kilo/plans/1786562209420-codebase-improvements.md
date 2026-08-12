# Codebase Improvements

## Critical Bugs

### 1. `usedFontFaces()` Arabic fallback unreachable (`src/utils/pdf.ts:77`)
The `return` statement is missing before `FONT_FACES.filter(...)`. The Arabic fallback
condition (`f.family === 'Noto Sans Arabic' && hasArabic`) is evaluated but never
returned because the preceding `FONT_FACES.filter(...)` call's return value is used
implicitly.

**Fix:** Add `return` before the `FONT_FACES.filter(...)` call.

### 2. Unicode property escape compatibility (`src/utils/pdf.ts:100`)
`safePdfName()` uses `\p{Cc}` with the `u` flag. While ES2023 supports Unicode property
escapes, some user environments (older Safari, embedded WebViews) may not. Replace
with an explicit control-character range for broader compatibility.

**Fix:** Replace `/\p{Cc}+/gu` with `/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g`.

## Package / Project Metadata

### 3. `package.json` missing fields
No `description` or `repository` field. This affects npm publishability and GitHub
discoverability.

**Fix:** Add:
```json
"description": "Client-side invoice, receipt, and quotation generator",
"repository": {
  "type": "git",
  "url": "https://github.com/sainudheenp/invoice-kit.git"
}
```

## Type Safety

### 4. `any` types in `googleDrive.ts`
- Line 55: `callback: (response: any)` — GIS token response
- Lines 135-140: `listAppDataBackups` maps `f: any`

**Fix:** Define `GoogleTokenResponse` and `DriveFile` interfaces.

### 5. `any` types in `backup.ts`
- Line 131: `catch (e: any)` in `validateBackupFile`

**Fix:** Use `unknown` and narrow with `instanceof Error` or `?.message`.

## Component Architecture

### 6. `Settings.tsx` is monolithic (819+ lines)
All settings sections live in one component with inline handlers, refs, and state.
This makes it hard to test, reuse, or navigate.

**Fix:** Extract sections into the existing `src/components/settings/*` files
(`CompanySection`, `ContactSection`, etc.) and wire them through a thin shell.

### 7. Settings form uses `Record<string, string>` instead of typed form
Every section props interface uses loose `Record<string, string>` and `setForm`
callbacks typed as `any`.

**Fix:** Define a `SettingsForm` interface and use it across all section components.

## Validation

### 8. Settings form ignores existing `validate` utility
`handleSave` uses inline regex for email and `parseInt` without bounds checks.
The app already has `src/utils/validate.ts` with reusable rules.

**Fix:** Use `validators.email()`, `validators.required()`, etc. in Settings.

## Runtime Robustness

### 9. Toast `setTimeout` not cleared on unmount (`src/store/UIContext.tsx:119`)
If a component unmounts before a toast's timeout fires, `dispatchUI` is called on
an unmounted provider, causing a React warning / memory leak.

**Fix:** Track toast timeout IDs in a ref and clear them in a cleanup effect.

### 10. PDF overlay hides before user sees fallback toast (`src/pages/Invoice.tsx:193`)
When `htmlToPDF` throws, `hidePdfOverlay()` runs in `finally` before the toast
animates in. The user sees a flash of the form, not the error.

**Fix:** Delay `hidePdfOverlay()` by 300-500ms when falling back to print, or show
the toast before hiding the overlay.

## Test Coverage

### 11. No tests for critical utilities
- `src/utils/pdf.ts` — `usedFontFaces`, `withPdfFonts`, `safePdfName` (only has
  basic tests, missing edge cases)
- `src/utils/backup.ts` — `validateBackupFile`, `executeRestore`, snapshot CRUD
- `src/utils/googleDrive.ts` — no tests
- `src/templates/index.ts` — `buildInvoiceHTML`, `buildReceiptHTML`,
  `buildQuotationHTML` render output not validated

**Fix:** Add unit tests for `validateBackupFile` (malformed JSON, legacy formats),
`usedFontFaces` (Arabic detection, family mapping), and snapshot lifecycle.

## Accessibility

### 12. Icon-only buttons lack `aria-label`
- `PreviewModal` close button (`✕`) has no accessible name
- Sidebar mobile hamburger has no `aria-label`
- `ExportActions` icon-only buttons rely on visible text, but `Button` component
  may strip it in some variants

**Fix:** Add `aria-label` to all icon-only `<button>` elements.

### 13. Modal focus trap missing
`PreviewModal` and `WelcomeOverlay` do not trap focus or return focus on close.

**Fix:** Implement basic focus trap (first/last focusable element) in modals.

## Service Worker

### 14. `sw.js` cache strategy is stale-while-revalidate without version bump
The shell cache uses a fixed cache name (`invoicekit-v3`). If `index.html` or
assets change, the old shell may persist until activate runs. The activate handler
deletes old caches, but install only precaches the shell — runtime assets (chunks,
fonts) are cache-on-first-use.

**Fix:** Bump cache version on each deploy, or use a hash-based cache name derived
from the build.

---

## Recommended Execution Order

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Fix `usedFontFaces` missing return | Small |
| P0 | Fix `safePdfName` Unicode escape | Small |
| P1 | Add package.json metadata | Small |
| P1 | Fix toast cleanup on unmount | Small |
| P1 | Fix PDF overlay hide timing | Small |
| P2 | Add `any` → proper types (googleDrive, backup) | Medium |
| P2 | Refactor Settings.tsx into sections | Medium |
| P2 | Use `validate` utility in Settings | Small |
| P2 | Add aria-labels and focus traps | Medium |
| P3 | Add backup/pdf/template tests | Medium |
| P3 | Improve service worker versioning | Small |
