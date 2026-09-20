import { describe, it, expect } from 'vitest'
import { preparePagedDocument, safePdfName } from '@/utils/pdf'
import { generateQrDataURL } from '@/utils/qr'

describe('paged document preparation', () => {
  it('moves normal-flow headers and fixed footers into page-safe chrome', () => {
    const html = `<!DOCTYPE html><html><head><style>
      body { padding:40px 50px 100px; }
      .footer { position:fixed; left:50px; right:50px; bottom:0; }
    </style></head><body>
      <div class="top-border">Top</div>
      <div class="header">Header</div>
      <table><thead><tr><th>Item</th></tr></thead><tbody><tr><td>Content</td></tr></tbody></table>
      <div class="footer">Footer</div>
    </body></html>`

    const prepared = preparePagedDocument(html)
    expect(prepared.html).not.toContain('class="header"')
    expect(prepared.html).not.toContain('class="footer"')
    expect(prepared.html).toContain('padding-top:0 !important')
    expect(prepared.header).toContain('class="header"')
    expect(prepared.footer).toContain('position:static !important')
    expect(prepared.printHtml).toContain('data-pdf-print-header')
    expect(prepared.printHtml).toContain('data-pdf-print-footer')
    expect(prepared.printHtml).toContain('padding-top: 40px')
    expect(prepared.printHtml).toContain('padding-left: 50px')
  })

  it('clones body page padding onto every printed page so fixed bands never hide content', () => {
    const html = `<!DOCTYPE html><html><head><style>
      body { padding:40px 50px 100px; }
      .header { background:#f8fafc; }
      .footer { position:fixed; bottom:0; }
    </style></head><body>
      <div class="header">Header</div>
      <p>Content</p>
      <div class="footer">Footer</div>
    </body></html>`

    const prepared = preparePagedDocument(html)
    // Only the browser print path needs the clone rule — the vector PDF
    // engine (taepdf) renders its own per-page bands.
    expect(prepared.printHtml).toContain('box-decoration-break: clone')
    expect(prepared.printHtml).toContain('-webkit-box-decoration-break: clone')
    expect(prepared.html).not.toContain('box-decoration-break')
  })
})

describe('QR export format', () => {
  it('uses SVG instead of qrcode-generator GIF output', () => {
    const html = generateQrDataURL('Invoice QR test')
    expect(html).toContain('data:image/svg+xml')
    expect(html).not.toContain('data:image/gif')
  })
})

describe('safePdfName', () => {
  it('returns cleaned name', () => {
    expect(safePdfName('INV-001')).toBe('INV-001')
  })

  it('strips path separators', () => {
    expect(safePdfName('../etc/passwd')).toBe('-etc-passwd')
  })

  it('strips illegal characters', () => {
    expect(safePdfName('file<>:"|?*name')).toBe('filename')
  })

  it('truncates to 120 chars', () => {
    const long = 'a'.repeat(200)
    expect(safePdfName(long).length).toBe(120)
  })

  it('returns fallback for empty/null', () => {
    expect(safePdfName(null)).toBe('document')
    expect(safePdfName('')).toBe('document')
  })

  it('trims whitespace', () => {
    expect(safePdfName('  hello  ')).toBe('hello')
  })
})
