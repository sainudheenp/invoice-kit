# InvoiceKit

A fully **client-side** invoice, receipt, and quotation generator. Everything runs
in the browser — there is **no backend, no server, and no external API**. Your data
never leaves the device: it is stored locally in IndexedDB (via Dexie), and PDFs are
generated on-device as real, selectable, vector PDFs.

---

## Features

- **Documents:** create and manage **Invoices**, **Receipts**, and **Quotations**.
- **7 templates each** (Classic, Modern, Professional, Minimal, Elegant, Bold, Beirak).
- **Multi-company** support with per-company branding (logo, seal, signature, colors,
  currency, VAT registration, bank details, watermark).
- **Customers & Products** catalogs for quick line-item entry.
- **Dashboard** with totals and recent activity.
- **History** with search, edit, duplicate, delete, and mark-as-paid.
- **Export options per document:**
  - **Preview** — in-app modal render.
  - **Print** — browser print dialog (A4).
  - **Download PDF** — real vector PDF, generated client-side (see below).
  - **Text** — plain-text export.
- **Backup / Restore** — export and import all data as a JSON file.
- **Dark mode**, keyboard shortcuts, PWA (installable, offline service worker).
- **RTL/Arabic aware** — Arabic glyphs (including the Omani Rial symbol `ع.ع`) render
  correctly in the PDF.

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Local storage | Dexie (IndexedDB), DB name `DocGenDB` |
| Routing | react-router-dom 7 |
| PDF engine | [`taepdf`](https://www.npmjs.com/package/taepdf) (Rust/WASM, vector) |
| Linting | oxlint |

---

## Getting started

```bash
npm install
npm run dev        # start dev server
npm run build      # typecheck + production build (runs fonts:check first)
npm run preview    # preview the production build
npm run lint       # oxlint
```

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server. |
| `npm run build` | `fonts:check` → `tsc -b` → `vite build`. |
| `npm run preview` | Serve the built `dist/`. |
| `npm run lint` | Run oxlint. |
| `npm run fonts:sync` | Copy the required PDF fonts from `@fontsource` into `public/fonts/`. |
| `npm run fonts:check` | Verify all required PDF fonts exist (used by `build` and CI). |

---

## Project structure

```
src/
  components/
    dashboard/ invoice/ receipt/ quotation/   # feature UI blocks
    layout/                                    # Sidebar, PreviewModal, PDFOverlay, ...
    ui/                                        # Button, Card, Input, Modal, Toast
  db/            # Dexie database (IndexedDB) definition
  hooks/         # useClickOutside, useKeyboardShortcuts, useSavedCustomers
  pages/         # Dashboard, Invoice, Receipt, Quotation, Customers, Products, History, Settings
  store/         # AppContext (data), UIContext (UI state: toasts, modals, PDF overlay)
  templates/
    invoice/ receipt/ quotation/              # 7 HTML templates each
    index.ts                                  # buildInvoiceHTML / buildReceiptHTML / buildQuotationHTML
  types/         # TypeScript models
  utils/         # pdf.ts, format, num2words, esc, currency presets, ...
public/
  fonts/         # woff2 fonts embedded into generated PDFs (see PDF section)
scripts/
  sync-fonts.mjs # sync/verify public/fonts/
```

Templates are pure functions that return an HTML string. The same HTML is used for
Preview, Print, and PDF, so all three stay visually identical.

---

## PDF generation (important — read before changing)

The **Download PDF** feature turns a template's HTML into a **real vector PDF**
(selectable text, true vectors — not a screenshot) **entirely in the browser** using
`taepdf`, which compiles to WebAssembly.

Entry point: `src/utils/pdf.ts`

```ts
htmlToPDF(html, filename)   // warms up WASM, injects fonts, downloads the PDF
printHTML(html)             // browser print dialog (also used as PDF fallback)
downloadText(html, name)    // plain-text export
safePdfName(name)           // filename sanitizer (shared by PDF + text)
```

### How it works

1. `pdf.warmup()` initializes the WASM engine once (cached).
2. `withPdfFonts()` injects `@font-face` rules so the engine can embed real fonts.
3. `pdf.download(html, 'A4', name.pdf)` renders and triggers the download.
4. If anything fails, the caller **falls back to the browser Print dialog** and
   shows a toast — the feature can never hard-break for the user.

While a PDF is generating, a full-screen **“Generating PDF…”** overlay is shown
(`src/components/layout/PDFOverlay.tsx`, driven by `UIContext`'s `pdfOverlay` state).

### Three invariants that MUST stay in place

Breaking any of these makes Download PDF fail — sometimes **silently**.

1. **WASM must load.** `vite.config.ts` contains:
   ```ts
   optimizeDeps: { exclude: ['taepdf'] },
   assetsInclude: ['**/*.wasm'],
   ```
   taepdf loads its binary via `new URL('taetype_bg.wasm', import.meta.url)`. If Vite
   pre-bundles taepdf, that URL breaks, the WASM 404s, and `pdf.render` throws
   `Cannot read properties of undefined (reading 'list_registered_fonts')`.
   **Do not remove these settings.**

2. **Fonts must exist in `public/fonts/`.** taepdf can only embed fonts it can fetch.
   Templates use system font names (Helvetica/Arial/Georgia/Courier) plus Arabic
   glyphs. We ship metric-compatible web fonts and map the system names to them via
   `@font-face` in `pdf.ts`. **If a font file is missing, taepdf silently drops that
   text (renders tofu boxes □) with no error.**
   - The font list is the single source of truth in `src/utils/pdf.ts` (`FONT_FACES`).
   - `scripts/sync-fonts.mjs` regenerates/verifies the files.
   - `npm run build` runs `fonts:check` first, so a missing font **fails the build**
     instead of shipping broken PDFs.

3. **Never trust the caller's filename.** `safePdfName()` strips path separators,
   illegal/control characters, and bounds the length.

### Font mapping

| Template font-family | Embedded font (woff2) | Notes |
|----------------------|-----------------------|-------|
| Helvetica / Helvetica Neue / Arial | Arimo | Metric-compatible with Arial |
| Georgia / Times New Roman / Palatino Linotype | Tinos | Metric-compatible with Times |
| Courier / Courier New / Lucida Sans Typewriter | Cousine | Metric-compatible with Courier |
| *(any missing glyph, e.g. Arabic / `ع.ع`)* | Noto Sans Arabic | Automatic glyph fallback |

The source fonts come from `@fontsource/*` (dev dependencies). The actual files
served to the browser live in `public/fonts/`. To change or add fonts:

1. Install the `@fontsource` package (as a dev dependency).
2. Add the file(s) to `REQUIRED` in `scripts/sync-fonts.mjs`.
3. Add matching `@font-face` entries to `FONT_FACES` in `src/utils/pdf.ts`.
4. Run `npm run fonts:sync` and commit `public/fonts/`.

### Dependency pinning

`taepdf` is pinned to an **exact version** in `package.json` (no `^`) so a reinstall
cannot pull a breaking release. Upgrade deliberately and re-test Download PDF
(including Arabic text) before bumping.

---

## Data & privacy

- All documents, companies, customers, and products are stored **locally** in
  IndexedDB (`DocGenDB`). Nothing is uploaded anywhere.
- Use **Settings → Backup** to export a JSON snapshot and **Restore** to import it.
- Clearing browser site data will erase everything — back up first.

---

## Testing the PDF path

`taepdf` requires a real browser (WASM + DOM), so it cannot run under Node/vite-node.
To verify manually:

1. `npm run build && npm run preview`.
2. Open a document, click **Download PDF**.
3. Confirm the file downloads, matches the Preview, and the text is **selectable**
   (and that Arabic/currency symbols are not tofu boxes).

CI-friendly guardrail: `npm run fonts:check` fails fast if any embedded font is missing.
