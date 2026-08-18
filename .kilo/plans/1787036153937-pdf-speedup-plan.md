# PDF Download Speed Plan

## Current State
The repo is at the original pre-optimization state. All source files are unmodified (no pending diff).

## Root Causes (from current code)

1. **No WASM pre-warm**
   - `pdf.warmup()` only runs on first click. The ~1MB `taetype_bg.wasm` binary is fetched and initialized at download time, adding ~500-1500ms on first use.

2. **No font prefetching**
   - `withPdfFonts()` emits `@font-face` for all 24 FONT_FACES entries (10 unique files, ~190KB total).
   - taepdf fetches every registered font on every render, even if the HTML uses only Helvetica.
   - These are fresh HTTP requests unless the browser happened to cache them.

3. **Font CSS duplication**
   - `withPdfFonts()` generates one `@font-face` rule per FONT_FACES entry. Multiple entries map to the same file (e.g., Helvetica, Helvetica Neue, Arial all use `arimo-latin-400-normal.woff2`).
   - This bloats the injected CSS and can cause redundant font loading.

4. **Main-thread blocking with no progress**
   - `pdf.download()` runs the full Rust/WASM render synchronously on the main thread.
   - The overlay timer is purely cosmetic (320ms/step) and has no connection to actual render progress.

5. **No click guard**
   - Double-clicking the PDF button queues overlapping `htmlToPDF` calls, each triggering its own overlay and WASM work.

6. **No idle-time preparation**
   - Nothing is preloaded when the app is idle. The user always pays the full cost on first click.

## Proposed Fixes

### 1. Pre-warm engine and prefetch fonts on idle (`src/App.tsx`)
- After app loads, call `requestIdleCallback` (fallback `setTimeout`) to:
  - `pdf.warmup()` once
  - `fetch()` all 10 font woff2 files with `mode: 'no-cors'` to populate HTTP cache

### 2. Deduplicate font CSS in `withPdfFonts` (`src/utils/pdf.ts`)
- Group FONT_FACES by `file|weight|style` and emit one `@font-face` per group with comma-separated `font-family` values.
- Reduces injected CSS from 24 rules to ~10.

### 3. Prefetch document-specific fonts before render (`src/utils/pdf.ts`)
- In `htmlToPDF`, after `withPdfFonts(html)`, extract the actually-used font files from `usedFontFaces(html)` and `fetch()` them in parallel before calling `pdf.download()`.

### 4. Add progress phase tracking (`src/utils/pdf.ts`, `src/store/UIContext.tsx`, `src/components/layout/PDFOverlay.tsx`)
- Add `PdfPhase` type and `setPdfPhase` to UIContext.
- Replace the fake timer overlay with a phase-driven overlay:
  - `preparing` → `fonts` → `engine` → `rendering` → `downloading` → `done`
- Progress bar reflects actual phase, not arbitrary time.

### 5. Add click debounce on page handlers
- Add `downloadingRef` to Invoice, Quotation, Receipt, History pages.
- Guard `handleDownloadPDF` to ignore clicks while a download is in flight.

### 6. Keep backward compatibility
- Retain `htmlToPDF` as the default export.
- Add `htmlToPDFWithProgress` as the new progress-aware variant.
- Page handlers switch to the new variant; print/fallback path unchanged.

## Files to modify
- `src/utils/pdf.ts`
- `src/store/UIContext.tsx`
- `src/components/layout/PDFOverlay.tsx`
- `src/pages/Invoice.tsx`
- `src/pages/Quotation.tsx`
- `src/pages/Receipt.tsx`
- `src/pages/History.tsx`
- `src/App.tsx`

## Validation
- `npm run build` must pass
- `npm test` must pass (95 tests)
- `tsc --noEmit` must pass
