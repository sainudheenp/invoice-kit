# Plan: Align Print and PDF Visual Output

## Context
- Commit `c58246c` already unified `LAYOUT_CSS` / `PRINT_CSS` so both paths share `break-inside:avoid` and `print-color-adjust:exact` rules.
- Remaining visual gap: **font stack**. Downloaded PDF uses metric-compatible web fonts (Arimo→Helvetica, Tinos→Georgia, Cousine→Courier) injected via `@font-face`. Print uses the browser's native system fonts. Different font metrics cause text reflow, spacing shifts, and page-break differences.

## Goal
Make `window.print` output visually match downloaded PDF output by ensuring both paths render with the same font stack and layout rules.

## Constraints
- 100% client-side, no backend.
- Must preserve `taepdf` safety requirements (WASM config, font file list, filename sanitization).
- Templates already declare `font-family: 'Helvetica','Arial',sans-serif` etc. — no template changes required.

## Proposed Changes

### 1. `src/utils/pdf.ts`
- Export `withPdfFonts` (rename to `prepareDocumentHtml` or keep name but export it).
- In `printHTML`, apply `withPdfFonts(html)` before setting `iframe.srcdoc`.
- Remove redundant `LAYOUT_CSS` injection from `printHTML` (the shared constant is already injected by `withPdfFonts`). Keep only the `html, body { margin:0; background:#fff; }` reset if desired, or drop it since templates already set `background:#fff` and `* { margin:0; }`.

### 2. Callers (`Invoice.tsx`, `Receipt.tsx`, `Quotation.tsx`, `History.tsx`)
- No changes needed. They already call `printHTML(html)` and `htmlToPDF(html, filename)`. The font alignment happens inside `printHTML`.

## Validation
- Run full Vitest suite (`npx vitest run`). Existing `pdf.test.ts` covers `safePdfName` only; no new tests required for this CSS/font change.
- Manual verification: print a document and compare to downloaded PDF. Text should wrap identically and page breaks should align.

## Risks
- **Font loading in iframe**: The hidden iframe loads HTML via `srcdoc`. Injected `@font-face` URLs (`/fonts/...woff2`) must resolve. Since the iframe is same-origin, this should work identically to the main document.
- **Performance**: `withPdfFonts` parses HTML with a regex — negligible cost for A4-sized template strings.
- **taepdf safety**: Unchanged. `htmlToPDF` still calls `withPdfFonts` exactly as before.

## Out of Scope
- Switching PDF engine (e.g., to `@react-pdf/renderer` or `puppeteer`) — too large, requires backend or heavy client-side bundle changes.
- Eliminating all font differences by using system fonts in PDF — breaks the safety contract with `taepdf` (missing fonts silently drop text).

## Implementation Order
1. Export `withPdfFonts` from `src/utils/pdf.ts`.
2. Update `printHTML` to call `withPdfFonts(html)` before `iframe.srcdoc = ...`.
3. Simplify print style injection to avoid duplicate `LAYOUT_CSS`.
4. Run tests and lint.
