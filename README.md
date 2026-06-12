# invoicekit

A fully offline, single-page webapp for generating bilingual (EN/AR) invoices and receipt vouchers. No frameworks, no CDN, no server required — just open `index.html` in any modern browser.

## Features

- **Multi-company profiles** — manage unlimited companies with full contact, branding, and bank details
- **Currency presets** — OMR, USD, EUR, GBP, SAR, AED, KWD, QAR, BHD, EGP + custom currency
- **Number-to-words** — auto-converts amounts to words for any supported currency
- **IndexedDB persistence** — all data stored locally, survives page reloads
- **Print-to-PDF** — A4 portrait invoices, A5 portrait receipt vouchers
- **Upload logos, seals, signatures** — PNG/JPG via file picker or paste SVG
- **Bilingual output** — English and Arabic on every document
- **Export/Import** — full company data as JSON

## Usage

1. Open `index.html` in a browser (Chrome, Firefox, Edge — any modern browser)
2. On first run, fill in your company name and currency
3. Use the sidebar to navigate between Dashboard, Invoice, Receipt, and Settings
4. In Settings, add company details, logo, bank info, VAT, numbering
5. Create invoices and receipts — click Print to save as PDF

## Project Structure

```
index.html       — entry point with all pages and print areas
css/style.css    — complete stylesheet
js/
  db.js          — IndexedDB wrapper with auto-recovery
  data.js        — company model, currency presets, number-to-words
  settings.js    — company CRUD, file uploads, export/import
  invoice.js     — invoice form, calculation, print builder
  receipt.js     — receipt voucher form, print builder
  main.js        — page routing, dashboard, init flow
```

## Requirements

None. Zero dependencies. Just a modern web browser.

## License

MIT
