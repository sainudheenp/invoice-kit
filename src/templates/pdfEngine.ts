/**
 * jsPDF-based PDF engine — draws each template programmatically.
 * Produces crisp, design-faithful PDFs (same approach as beirak-app).
 * Uses jsPDF + jspdf-autotable for vector-quality output.
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { InvTemplateData, RecTemplateData, QuotTemplateData } from '@/types/template'

// ─── Type helpers ─────────────────────────────────────────────────────────────

type RGB = [number, number, number]

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Returns a lighter version of an RGB colour (amount 0–1, higher = lighter). */
function lighten(rgb: RGB, amount = 0.88): RGB {
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * amount),
    Math.round(rgb[1] + (255 - rgb[1]) * amount),
    Math.round(rgb[2] + (255 - rgb[2]) * amount),
  ]
}

// ─── Image helpers ────────────────────────────────────────────────────────────

const getImageFormat = (dataUrl: string): 'PNG' | 'JPEG' => {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG'
  return 'PNG'
}

/**
 * Adds an image scaled to fit within a bounding box, maintaining aspect ratio.
 * Identical strategy to beirak-app's addImageContained.
 */
function addImgContained(
  doc: jsPDF,
  dataUrl: string | null | undefined,
  bx: number, by: number, bw: number, bh: number,
  align: 'left' | 'center' | 'right' = 'left'
): void {
  if (!dataUrl) return
  try {
    const props = doc.getImageProperties(dataUrl)
    const rw = Number(props.width) || bw
    const rh = Number(props.height) || bh
    if (rw <= 0 || rh <= 0) { doc.addImage(dataUrl, getImageFormat(dataUrl), bx, by, bw, bh); return }

    const scale = Math.min(bw / rw, bh / rh)
    const dw = rw * scale
    const dh = rh * scale
    let dx = bx
    if (align === 'center') dx = bx + (bw - dw) / 2
    if (align === 'right') dx = bx + bw - dw
    const dy = by + (bh - dh) / 2
    doc.addImage(dataUrl, getImageFormat(dataUrl), dx, dy, dw, dh)
  } catch { /* skip corrupt images */ }
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function hLine(doc: jsPDF, x1: number, x2: number, y: number, lw = 0.3, rgb: RGB = [200, 200, 200]): void {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2])
  doc.setLineWidth(lw)
  doc.line(x1, y, x2, y)
}

function fillRect(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: RGB): void {
  doc.setFillColor(rgb[0], rgb[1], rgb[2])
  doc.rect(x, y, w, h, 'F')
}

function strokeRect(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: RGB, lw = 0.3): void {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2])
  doc.setLineWidth(lw)
  doc.rect(x, y, w, h, 'S')
}

function safeStr(v: string | null | undefined): string {
  return v || ''
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text || '', Math.max(maxWidth, 10))
}

// ─── Shared section renderers ─────────────────────────────────────────────────

interface Margin { left: number; right: number }

/** Renders the items autoTable and returns the Y position after it. */
function renderItemsTable(
  doc: jsPDF,
  d: InvTemplateData | QuotTemplateData,
  startY: number,
  headerRgb: RGB,
  altRgb: RGB,
  m: Margin
): number {
  const body = d.items.map((item, i) => [
    String(i + 1),
    item.desc,
    String(item.qty),
    `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
    `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
  ])

  autoTable(doc, {
    startY,
    margin: m,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [31, 41, 55] as RGB,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: lighten(headerRgb, 0.7),
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: headerRgb,
      textColor: [255, 255, 255] as RGB,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: { fillColor: altRgb },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 16, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
  })

  return ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? startY) + 2
}

/** Renders the totals block and returns the Y after it. */
function renderTotals(
  doc: jsPDF,
  d: InvTemplateData | QuotTemplateData,
  startY: number,
  accentRgb: RGB,
  pw: number,
  rightM: number
): number {
  const boxW = 72
  const boxX = pw - rightM - boxW
  let cy = startY + 5

  const rows: [string, string][] = [['Subtotal', `${d.cur.symbol}${d.sv}`]]
  if (d.vp > 0) rows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) rows.push(['Discount', `-${d.cur.symbol}${d.dv}`])

  for (const [label, val] of rows) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(80, 80, 80)
    doc.text(label, boxX + 2, cy + 4)
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2])
    doc.text(val, pw - rightM - 2, cy + 4, { align: 'right' })
    cy += 7
  }

  // Grand Total bar
  fillRect(doc, boxX, cy, boxW, 10, accentRgb)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Grand Total', boxX + 3, cy + 6.8)
  doc.text(`${d.cur.symbol}${d.gv}`, pw - rightM - 2, cy + 6.8, { align: 'right' })
  cy += 12

  if (d.gw) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(130, 130, 130)
    doc.text(d.gw, pw - rightM - 2, cy, { align: 'right' })
    cy += 5
  }
  return cy
}

/** Renders notes / payment / terms box and returns Y after it. */
function renderNotes(
  doc: jsPDF,
  d: InvTemplateData,
  startY: number,
  accentRgb: RGB,
  m: Margin
): number {
  const pw = doc.internal.pageSize.getWidth()
  const bw = pw - m.left - m.right
  let cy = startY + 4

  const lines: string[] = []
  if (d.pd) lines.push(`Payment: ${d.pd}`)
  if (d.notes) lines.push(d.notes)
  if (d.comp.invTerms) lines.push(d.comp.invTerms)
  if (lines.length === 0) return cy

  // Top rule
  fillRect(doc, m.left, cy, bw, 0.6, lighten(accentRgb, 0.65))
  cy += 2

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)

  for (const line of lines) {
    const wrapped = wrapText(doc, line, bw - 6)
    for (const wl of wrapped) {
      cy += 5
      doc.text(wl, m.left + 3, cy)
    }
    cy += 1
  }
  cy += 3
  // Bottom rule
  fillRect(doc, m.left, cy, bw, 0.4, lighten(accentRgb, 0.7))
  cy += 4
  return cy
}

/** Renders seal + signature row and returns Y after it. */
function renderSigRow(
  doc: jsPDF,
  comp: { name: string; signature?: string; seal?: string },
  startY: number,
  accentRgb: RGB,
  m: Margin
): number {
  const pw = doc.internal.pageSize.getWidth()
  let cy = startY + 8

  // Seal left
  if (comp.seal) {
    addImgContained(doc, comp.seal, m.left, cy - 4, 22, 18)
  }

  // Signature right
  const sigBoxX = pw - m.right - 46
  const sigBoxW = 44
  if (comp.signature) {
    addImgContained(doc, comp.signature, sigBoxX, cy - 2, sigBoxW, 14, 'center')
    cy += 14
  } else {
    cy += 10
  }

  hLine(doc, sigBoxX, pw - m.right, cy, 0.4, lighten(accentRgb, 0.4))
  cy += 3.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text('Authorized Signature', sigBoxX + sigBoxW / 2, cy, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2])
  doc.text(safeStr(comp.name), sigBoxX + sigBoxW / 2, cy + 4.5, { align: 'center' })
  cy += 10

  return cy
}

/** Renders the footer band at the bottom of the page. */
function renderFooter(
  doc: jsPDF,
  comp: { name: string; loc?: string; tel?: string; email?: string; bankName?: string; bankAcc?: string; bankIban?: string },
  accentRgb: RGB,
  m: Margin
): void {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const fy = ph - 16

  fillRect(doc, 0, fy, pw, 0.5, lighten(accentRgb, 0.6))

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(130, 130, 130)

  const parts = [safeStr(comp.name)]
  if (comp.loc) parts.push(comp.loc)
  if (comp.tel) parts.push(`Tel: ${comp.tel}`)
  if (comp.email) parts.push(comp.email)
  doc.text(parts.join('  |  '), pw / 2, fy + 6, { align: 'center' })

  if (comp.bankName) {
    const bp = [comp.bankName]
    if (comp.bankAcc) bp.push(comp.bankAcc)
    if (comp.bankIban) bp.push(comp.bankIban)
    doc.text(bp.join('  |  '), pw / 2, fy + 11, { align: 'center' })
  }
}

// ─── Page-safe Y tracker ──────────────────────────────────────────────────────
// If content Y goes past the safe zone, jsPDF autoTable already handles new pages.
// For our manual drawing we cap the max Y at (pageHeight - footer).
function safePrintY(doc: jsPDF, y: number): number {
  const ph = doc.internal.pageSize.getHeight()
  if (y > ph - 30) {
    doc.addPage()
    return 20
  }
  return y
}

// ─── PUBLIC INVOICE BUILDER ───────────────────────────────────────────────────

export async function buildInvoicePDF(d: InvTemplateData, filename: string): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true })
  const pw = doc.internal.pageSize.getWidth()
  const accent: RGB = d.comp.pcolor ? hexToRgb(d.comp.pcolor) : [31, 41, 55]
  const lightAccent = lighten(accent, 0.9)

  const tpl = d.comp.invTemplate || 'classic'
  if (tpl === 'modern') await drawInvoiceModern(doc, d, pw, accent, lightAccent)
  else if (tpl === 'professional') await drawInvoiceProfessional(doc, d, pw, accent, lightAccent)
  else if (tpl === 'minimal') await drawInvoiceMinimal(doc, d, pw, accent)
  else if (tpl === 'elegant') await drawInvoiceElegant(doc, d, pw, accent, lightAccent)
  else if (tpl === 'bold') await drawInvoiceBold(doc, d, pw, accent)
  else if (tpl === 'beirak') await drawInvoiceBeirak(doc, d, pw, accent, lightAccent)
  else await drawInvoiceClassic(doc, d, pw, accent, lightAccent)

  doc.save(`${filename}.pdf`)
}

// ─── CLASSIC ──────────────────────────────────────────────────────────────────
async function drawInvoiceClassic(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB, lightAccent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }

  // Top accent bar
  fillRect(doc, 0, 0, pw, 3.5, accent)

  // Logo + company name
  let hy = 10
  if (d.comp.logo) addImgContained(doc, d.comp.logo, ml, hy, 28, 18)
  const nameX = d.comp.logo ? ml + 31 : ml
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.comp.name), nameX, hy + 7)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 100, 100)
    doc.text(d.comp.sub, nameX, hy + 13)
  }
  const contactParts = [d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean)
  if (contactParts.length) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(110, 110, 110)
    doc.text(contactParts.join(' | '), nameX, hy + 18)
  }

  // Title right
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('TAX INVOICE', pw - mr, hy + 7, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
  doc.text(safeStr(d.no), pw - mr, hy + 13, { align: 'right' })

  // Divider bar with bill-to / date
  hy = 32
  hLine(doc, ml, pw - mr, hy, 1.5, accent)
  hy += 2
  fillRect(doc, ml, hy, pw - ml - mr, 14, lightAccent)

  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(120, 120, 120)
  doc.text('BILL TO', ml + 3, hy + 4)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.cust), ml + 3, hy + 9.5)
  const custSub = [d.addr, d.ph, d.cr, d.em].filter(Boolean).join(' | ')
  if (custSub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80)
    doc.text(wrapText(doc, custSub, (pw - ml - mr) * 0.55).slice(0, 1), ml + 3, hy + 13.5)
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(120, 120, 120)
  doc.text('DATE', pw - mr - 3, hy + 4, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.dt), pw - mr - 3, hy + 9.5, { align: 'right' })
  if (d.comp.vatReg) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80)
    doc.text(`VAT: ${d.comp.vatReg}`, pw - mr - 3, hy + 13.5, { align: 'right' })
  }

  hy += 16
  hLine(doc, ml, pw - mr, hy, 1.5, accent)
  hy += 4

  const afterTable = renderItemsTable(doc, d, hy, accent, lightAccent, m)
  const afterTotals = renderTotals(doc, d, afterTable, accent, pw, mr)
  const afterNotes = renderNotes(doc, d, afterTotals, accent, m)
  renderSigRow(doc, d.comp, safePrintY(doc, afterNotes), accent, m)
  renderFooter(doc, d.comp, accent, m)
}

// ─── MODERN ───────────────────────────────────────────────────────────────────
async function drawInvoiceModern(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB, lightAccent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const ph = doc.internal.pageSize.getHeight()

  // Left sidebar strip
  fillRect(doc, 0, 0, 3.5, ph, accent)

  // Header card
  fillRect(doc, ml, 6, pw - ml - mr, 22, lightAccent)
  let hy = 8
  if (d.comp.logo) addImgContained(doc, d.comp.logo, ml + 3, hy + 1, 20, 16)
  const nameX = d.comp.logo ? ml + 26 : ml + 4
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.comp.name), nameX, hy + 7)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
    doc.text(d.comp.sub, nameX, hy + 12)
  }

  // Invoice label right (vertical left border)
  doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(2)
  doc.line(pw - mr - 30, hy + 2, pw - mr - 30, hy + 12)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('INVOICE', pw - mr, hy + 7, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
  doc.text(safeStr(d.no), pw - mr, hy + 13, { align: 'right' })

  hy = 32
  const cardW = (pw - ml - mr - 4) / 2

  // Bill-to card
  fillRect(doc, ml, hy, cardW, 18, lightAccent)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
  doc.text('BILL TO', ml + 3, hy + 4.5)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.cust), ml + 3, hy + 10)
  const custSub = [d.addr, d.ph, d.cr, d.em].filter(Boolean).join(' | ')
  if (custSub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80)
    doc.text(wrapText(doc, custSub, cardW - 5).slice(0, 2), ml + 3, hy + 15)
  }

  // Date card
  const card2X = ml + cardW + 4
  fillRect(doc, card2X, hy, cardW, 18, lightAccent)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
  doc.text('DATE', card2X + 3, hy + 4.5)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.dt), card2X + 3, hy + 10)
  if (d.comp.vatReg) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80)
    doc.text(`VAT: ${d.comp.vatReg}`, card2X + 3, hy + 15)
  }

  hy += 22
  const afterTable = renderItemsTable(doc, d, hy, accent, lightAccent, m)
  const afterTotals = renderTotals(doc, d, afterTable, accent, pw, mr)
  const afterNotes = renderNotes(doc, d, afterTotals, accent, m)
  renderSigRow(doc, d.comp, safePrintY(doc, afterNotes), accent, m)
  renderFooter(doc, d.comp, accent, m)
}

// ─── PROFESSIONAL ─────────────────────────────────────────────────────────────
async function drawInvoiceProfessional(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB, lightAccent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }

  fillRect(doc, 0, 0, pw, 7, accent)

  let hy = 11
  if (d.comp.logo) addImgContained(doc, d.comp.logo, ml, hy, 26, 18)
  const nameX = d.comp.logo ? ml + 29 : ml
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.comp.name).toUpperCase(), nameX, hy + 7)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 100, 100)
    doc.text(d.comp.sub.toUpperCase(), nameX, hy + 13)
  }

  // Invoice number bordered box
  const nbW = 44, nbX = pw - mr - nbW
  strokeRect(doc, nbX, hy, nbW, 16, accent, 0.5)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
  doc.text('INVOICE NO.', nbX + nbW / 2, hy + 5.5, { align: 'center' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.no), nbX + nbW / 2, hy + 12, { align: 'center' })

  hy = 34
  // Blue label banner
  fillRect(doc, ml, hy, pw - ml - mr, 7, accent)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255)
  doc.text('INVOICE STATEMENT', ml + 3, hy + 4.8)
  hy += 7

  // Info grid (3 cells)
  const cellW = (pw - ml - mr) / 3
  const cells = [
    { label: 'BILL TO', val: safeStr(d.cust), sub: [d.addr, d.ph, d.cr].filter(Boolean).join(' | ') },
    { label: 'DATE', val: safeStr(d.dt), sub: '' },
    { label: 'VAT REG', val: d.comp.vatReg || 'N/A', sub: '' },
  ]
  strokeRect(doc, ml, hy, pw - ml - mr, 15, [203, 213, 225] as RGB, 0.2)
  for (let i = 0; i < cells.length; i++) {
    const cx = ml + i * cellW
    if (i > 0) {
      doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.2)
      doc.line(cx, hy, cx, hy + 15)
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
    doc.text(cells[i].label, cx + 3, hy + 4.5)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(17, 24, 39)
    doc.text(cells[i].val, cx + 3, hy + 10)
    if (cells[i].sub) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(80, 80, 80)
      doc.text(wrapText(doc, cells[i].sub, cellW - 5)[0] || '', cx + 3, hy + 14)
    }
  }
  hy += 19

  const afterTable = renderItemsTable(doc, d, hy, accent, lightAccent, m)

  // Totals in explicit bordered box
  const bxW = 72, bxX = pw - mr - bxW
  let cy = afterTable + 5
  const trows: [string, string][] = [['SUBTOTAL', `${d.cur.symbol}${d.sv}`]]
  if (d.vp > 0) trows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) trows.push(['DISCOUNT', `-${d.cur.symbol}${d.dv}`])
  strokeRect(doc, bxX, cy, bxW, 8 * trows.length + 10, accent, 0.5)
  for (const [label, val] of trows) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(70, 70, 70)
    doc.text(label, bxX + 2, cy + 5)
    doc.text(val, pw - mr - 2, cy + 5, { align: 'right' })
    hLine(doc, bxX, pw - mr, cy + 7, 0.2, [220, 220, 220])
    cy += 8
  }
  fillRect(doc, bxX, cy, bxW, 10, accent)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255)
  doc.text('GRAND TOTAL', bxX + 3, cy + 6.8)
  doc.text(`${d.cur.symbol}${d.gv}`, pw - mr - 2, cy + 6.8, { align: 'right' })
  cy += 12
  if (d.gw) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(130, 130, 130)
    doc.text(d.gw, pw - mr - 2, cy, { align: 'right' }); cy += 5
  }
  const afterNotes = renderNotes(doc, d, cy, accent, m)
  renderSigRow(doc, d.comp, safePrintY(doc, afterNotes), accent, m)
  renderFooter(doc, d.comp, accent, m)
}

// ─── MINIMAL ──────────────────────────────────────────────────────────────────
async function drawInvoiceMinimal(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB) {
  const ml = 18, mr = 18, m: Margin = { left: ml, right: mr }
  const slate: RGB = [148, 163, 184]
  const dark: RGB = [17, 24, 39]
  const mid: RGB = [100, 116, 139]

  let hy = 18
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(safeStr(d.comp.name), ml, hy)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(slate[0], slate[1], slate[2])
    doc.text(d.comp.sub, ml, hy + 5)
  }

  // Invoice label on right
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(slate[0], slate[1], slate[2])
  doc.text('INVOICE', pw - mr, hy - 2, { align: 'right' })
  doc.text(safeStr(d.no), pw - mr, hy + 4, { align: 'right' })

  hy += 16
  hLine(doc, ml, pw - mr, hy, 0.5, [226, 232, 240])
  hy += 8

  // Bill-to / Date labels
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(slate[0], slate[1], slate[2])
  doc.text('BILL TO', ml, hy)
  doc.text('DATE', pw - mr, hy, { align: 'right' })
  hy += 5
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(safeStr(d.cust), ml, hy)
  doc.text(safeStr(d.dt), pw - mr, hy, { align: 'right' })

  const custSub = [d.addr, d.ph, d.cr, d.em].filter(Boolean).join(' | ')
  if (custSub) {
    hy += 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(mid[0], mid[1], mid[2])
    doc.text(wrapText(doc, custSub, (pw - ml - mr) * 0.55).slice(0, 2), ml, hy)
  }
  if (d.comp.vatReg) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(mid[0], mid[1], mid[2])
    doc.text(`VAT: ${d.comp.vatReg}`, pw - mr, hy, { align: 'right' })
  }

  hy += 10
  hLine(doc, ml, pw - mr, hy, 0.5, [226, 232, 240])
  hy += 4

  // Plain theme table with white header (mimics minimal look)
  autoTable(doc, {
    startY: hy,
    margin: m,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: d.items.map((item, i) => [
      String(i + 1), item.desc, String(item.qty),
      `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
      `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
    ]),
    theme: 'plain',
    styles: {
      font: 'helvetica', fontSize: 8.5, textColor: [51, 65, 85] as RGB,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
      lineColor: [226, 232, 240] as RGB, lineWidth: 0,
    },
    headStyles: {
      fillColor: [255, 255, 255] as RGB,
      textColor: slate,
      fontStyle: 'normal',
      fontSize: 7.5,
      lineWidth: 0.4,
      lineColor: [226, 232, 240] as RGB,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 16, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
  })
  const afterTable = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 2

  // Minimal inline totals (no box)
  const bxX = pw - mr - 72
  let cy = afterTable + 5
  const trows: [string, string][] = [['Subtotal', `${d.cur.symbol}${d.sv}`]]
  if (d.vp > 0) trows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) trows.push(['Discount', `-${d.cur.symbol}${d.dv}`])

  for (const [label, val] of trows) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(mid[0], mid[1], mid[2])
    doc.text(label, bxX, cy)
    doc.text(val, pw - mr, cy, { align: 'right' })
    cy += 6
  }
  hLine(doc, bxX, pw - mr, cy, 0.5, [226, 232, 240])
  cy += 5
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text('Grand Total', bxX, cy)
  doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(`${d.cur.symbol}${d.gv}`, pw - mr, cy, { align: 'right' })
  cy += 5

  if (d.gw) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(slate[0], slate[1], slate[2])
    doc.text(d.gw, pw - mr, cy + 4, { align: 'right' }); cy += 9
  }

  // Notes (minimal style)
  const notes = [d.pd && `Payment: ${d.pd}`, d.notes, d.comp.invTerms].filter(Boolean) as string[]
  if (notes.length) {
    cy += 4
    hLine(doc, ml, pw - mr, cy, 0.4, [226, 232, 240])
    cy += 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(mid[0], mid[1], mid[2])
    for (const note of notes) {
      for (const wl of wrapText(doc, note, pw - ml - mr - 4)) {
        doc.text(wl, ml, cy); cy += 4.5
      }
    }
  }

  cy = safePrintY(doc, cy + 8)
  // Signature line (minimal)
  const sigX = pw - mr - 46
  if (d.comp.signature) {
    addImgContained(doc, d.comp.signature, sigX, cy, 44, 13, 'center'); cy += 13
  }
  hLine(doc, sigX, pw - mr, cy, 0.4, lighten(accent, 0.5))
  cy += 3.5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(slate[0], slate[1], slate[2])
  doc.text('Authorized Signature', sigX + 22, cy, { align: 'center' })

  renderFooter(doc, d.comp, accent, m)
}

// ─── ELEGANT ──────────────────────────────────────────────────────────────────
async function drawInvoiceElegant(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB, lightAccent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const ph = doc.internal.pageSize.getHeight()
  const warm: RGB = [139, 125, 98]
  const dark: RGB = [44, 36, 22]
  const border: RGB = [212, 197, 169]

  // Double frame
  strokeRect(doc, 5, 5, pw - 10, ph - 10, accent, 0.7)
  strokeRect(doc, 7, 7, pw - 14, ph - 14, border, 0.3)

  let hy = 14
  if (d.comp.logo) addImgContained(doc, d.comp.logo, ml, hy, 24, 18)
  const nameX = d.comp.logo ? ml + 27 : ml
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(safeStr(d.comp.name), nameX, hy + 8)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(warm[0], warm[1], warm[2])
    doc.text(d.comp.sub, nameX, hy + 14)
  }
  const contact = [d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join(' • ')
  if (contact) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(warm[0], warm[1], warm[2])
    doc.text(contact, nameX, hy + 19)
  }

  // Invoice title (italic) on right
  doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(21); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('Invoice', pw - mr, hy + 9, { align: 'right' })
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(warm[0], warm[1], warm[2])
  doc.text(safeStr(d.no), pw - mr, hy + 15, { align: 'right' })

  hy += 23
  // Ornament
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('◆  ◆  ◆', pw / 2, hy, { align: 'center' })
  hy += 7

  // Info box with warm border
  strokeRect(doc, ml, hy, pw - ml - mr, 16, border, 0.3)
  fillRect(doc, ml, hy, pw - ml - mr, 16, lighten(accent, 0.95))
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(warm[0], warm[1], warm[2])
  doc.text('BILL TO', ml + 4, hy + 4.5)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(safeStr(d.cust), ml + 4, hy + 10.5)
  const custSub = [d.addr, d.ph, d.cr, d.em].filter(Boolean).join(' • ')
  if (custSub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(107, 93, 74)
    doc.text(wrapText(doc, custSub, (pw - ml - mr) * 0.55)[0] || '', ml + 4, hy + 14.5)
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(warm[0], warm[1], warm[2])
  doc.text('DATE', pw - mr - 4, hy + 4.5, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(safeStr(d.dt), pw - mr - 4, hy + 10.5, { align: 'right' })
  if (d.comp.vatReg) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(107, 93, 74)
    doc.text(`VAT: ${d.comp.vatReg}`, pw - mr - 4, hy + 14.5, { align: 'right' })
  }
  hy += 20

  // Table with warm palette
  autoTable(doc, {
    startY: hy, margin: m,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: d.items.map((item, i) => [
      String(i + 1), item.desc, String(item.qty),
      `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
      `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 8.5, textColor: dark,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: border, lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [255, 255, 255] as RGB, textColor: warm, fontStyle: 'bold', fontSize: 7.5,
      lineWidth: 1.2, lineColor: accent,
    },
    alternateRowStyles: { fillColor: lighten(accent, 0.95) },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 16, halign: 'right' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' },
    },
  })
  const afterTable = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 2

  // Totals with warm box
  const bxW = 72, bxX = pw - mr - bxW
  let cy = afterTable + 5
  const trows: [string, string][] = [['Subtotal', `${d.cur.symbol}${d.sv}`]]
  if (d.vp > 0) trows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) trows.push(['Discount', `-${d.cur.symbol}${d.dv}`])
  const boxH = trows.length * 7 + 14
  strokeRect(doc, bxX, cy, bxW, boxH, border, 0.3)
  fillRect(doc, bxX, cy, bxW, boxH, lighten(accent, 0.95))
  cy += 4
  for (const [label, val] of trows) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(74, 63, 48)
    doc.text(label, bxX + 3, cy + 4)
    doc.text(val, pw - mr - 3, cy + 4, { align: 'right' }); cy += 7
  }
  hLine(doc, bxX, pw - mr, cy, 0.5, accent)
  cy += 3
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('Grand Total', bxX + 3, cy + 5)
  doc.text(`${d.cur.symbol}${d.gv}`, pw - mr - 3, cy + 5, { align: 'right' }); cy += 9
  if (d.gw) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(warm[0], warm[1], warm[2])
    doc.text(d.gw, pw - mr - 3, cy + 4, { align: 'right' }); cy += 9
  }

  const afterNotes = renderNotes(doc, d, cy, accent, m)

  // Elegant signature
  cy = safePrintY(doc, afterNotes + 8)
  const sigX = pw - mr - 46
  if (d.comp.signature) {
    addImgContained(doc, d.comp.signature, sigX, cy, 44, 13, 'center'); cy += 13
  }
  if (d.comp.seal) addImgContained(doc, d.comp.seal, ml, cy - 14, 22, 16)
  hLine(doc, sigX, pw - mr, cy, 0.4, border)
  cy += 3.5
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(warm[0], warm[1], warm[2])
  doc.text('Authorized Signature', sigX + 22, cy, { align: 'center' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(safeStr(d.comp.name), sigX + 22, cy + 4.5, { align: 'center' })

  // Elegant footer
  const fy = ph - 14
  hLine(doc, ml, pw - mr, fy, 0.4, border)
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(warm[0], warm[1], warm[2])
  const fp = [safeStr(d.comp.name), ...[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean)]
  doc.text(fp.join(' | '), pw / 2, fy + 6, { align: 'center' })
  if (d.comp.bankName) {
    const bp = [d.comp.bankName, d.comp.bankAcc, d.comp.bankIban].filter(Boolean)
    doc.text(bp.join(' | '), pw / 2, fy + 11, { align: 'center' })
  }
}

// ─── BOLD ─────────────────────────────────────────────────────────────────────
async function drawInvoiceBold(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const black: RGB = [0, 0, 0]
  const gray: RGB = [80, 80, 80]

  // Big black top bar
  fillRect(doc, 0, 0, pw, 30, black)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(255, 255, 255)
  doc.text('INVOICE', ml, 19)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(180, 180, 180)
  doc.text(safeStr(d.no), ml, 26)
  if (d.comp.logo) addImgContained(doc, d.comp.logo, pw - mr - 26, 4, 24, 22, 'right')

  // Brand area
  let hy = 37
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(black[0], black[1], black[2])
  doc.text(safeStr(d.comp.name).toUpperCase(), ml, hy)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(gray[0], gray[1], gray[2])
    doc.text(d.comp.sub.toUpperCase(), ml, hy + 6)
  }
  hy += 14

  // Triple-weight border
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2.5)
  doc.line(ml, hy, pw - mr, hy); hy += 2

  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text('BILL TO', ml, hy + 4)
  doc.text('DATE', pw - mr, hy + 4, { align: 'right' })
  hy += 9
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(black[0], black[1], black[2])
  doc.text(safeStr(d.cust), ml, hy)
  doc.text(safeStr(d.dt), pw - mr, hy, { align: 'right' })
  const custSub = [d.addr, d.ph, d.cr, d.em].filter(Boolean).join(' | ')
  if (custSub) {
    hy += 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60, 60, 60)
    doc.text(wrapText(doc, custSub, (pw - ml - mr) * 0.55)[0] || '', ml, hy)
  }
  if (d.comp.vatReg) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60, 60, 60)
    doc.text(`VAT: ${d.comp.vatReg}`, pw - mr, hy, { align: 'right' })
  }
  hy += 5
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2.5)
  doc.line(ml, hy, pw - mr, hy); hy += 6

  // Table — black header
  autoTable(doc, {
    startY: hy, margin: m,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: d.items.map((item, i) => [
      String(i + 1), item.desc, String(item.qty),
      `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
      `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 9, textColor: black,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: black, lineWidth: 0.7,
    },
    headStyles: { fillColor: black, textColor: [255, 255, 255] as RGB, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [252, 242, 242] as RGB },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 16, halign: 'right' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' },
    },
  })
  const afterTable = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 2

  // Totals (bold style)
  const bxX = pw - mr - 72
  let cy = afterTable + 5
  const trows: [string, string][] = [['Subtotal', `${d.cur.symbol}${d.sv}`]]
  if (d.vp > 0) trows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) trows.push(['Discount', `-${d.cur.symbol}${d.dv}`])
  for (const [label, val] of trows) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(black[0], black[1], black[2])
    doc.text(label, bxX, cy + 4); doc.text(val, pw - mr, cy + 4, { align: 'right' })
    hLine(doc, bxX, pw - mr, cy + 6, 0.3, [200, 200, 200]); cy += 7
  }
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2); doc.line(bxX, cy, pw - mr, cy); cy += 3
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('Grand Total', bxX, cy + 8)
  doc.text(`${d.cur.symbol}${d.gv}`, pw - mr, cy + 8, { align: 'right' }); cy += 14

  if (d.gw) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100)
    doc.text(d.gw, pw - mr, cy, { align: 'right' }); cy += 6
  }

  // Notes box with left accent bar
  const allNotes = [d.pd && `PAYMENT: ${d.pd}`, d.notes, d.comp.invTerms].filter(Boolean) as string[]
  if (allNotes.length) {
    let textH = 0
    for (const n of allNotes) textH += wrapText(doc, n, pw - ml - mr - 12).length * 5
    textH += 8
    fillRect(doc, ml, cy, 3, textH, accent)
    fillRect(doc, ml + 3, cy, pw - ml - mr - 3, textH, [249, 249, 249])
    cy += 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50)
    for (const n of allNotes) {
      for (const wl of wrapText(doc, n, pw - ml - mr - 12)) {
        doc.text(wl, ml + 7, cy); cy += 5
      }
    }
    cy += 5
  }

  cy = safePrintY(doc, cy + 4)
  const sigX = pw - mr - 46
  if (d.comp.signature) {
    addImgContained(doc, d.comp.signature, sigX, cy, 44, 13, 'center'); cy += 13
  }
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(1.5); doc.line(sigX, cy, pw - mr, cy); cy += 4
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text('AUTHORIZED SIGNATURE', sigX + 22, cy, { align: 'center' })

  // Bold footer — black bar
  const ph = doc.internal.pageSize.getHeight()
  const fy = ph - 14
  fillRect(doc, 0, fy - 2, pw, 16, black)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255)
  const fp = [safeStr(d.comp.name), ...[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean)]
  doc.text(fp.join('  |  '), pw / 2, fy + 4, { align: 'center' })
  if (d.comp.bankName) {
    const bp = [d.comp.bankName, d.comp.bankAcc, d.comp.bankIban].filter(Boolean)
    doc.setTextColor(180, 180, 180)
    doc.text(bp.join(' • '), pw / 2, fy + 9, { align: 'center' })
  }
}

// ─── BEIRAK ───────────────────────────────────────────────────────────────────
async function drawInvoiceBeirak(doc: jsPDF, d: InvTemplateData, pw: number, accent: RGB, lightAccent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const ph = doc.internal.pageSize.getHeight()

  // Frame border (2pt like the HTML template)
  strokeRect(doc, 4, 4, pw - 8, ph - 8, accent, 2)

  // Centered header
  let hy = 14
  if (d.comp.logo) {
    addImgContained(doc, d.comp.logo, pw / 2 - 14, hy, 28, 20, 'center'); hy += 22
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(safeStr(d.comp.name), pw / 2, hy, { align: 'center' })
  if (d.comp.sub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(75, 85, 99)
    doc.text(d.comp.sub, pw / 2, hy + 6, { align: 'center' })
  }
  const contact = [d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join(' | ')
  if (contact) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 116, 139)
    doc.text(contact, pw / 2, hy + 12, { align: 'center' })
  }
  hy += 16

  // TAX INVOICE badge (bordered rectangle)
  const bW = 52
  strokeRect(doc, pw / 2 - bW / 2, hy, bW, 9, accent, 1.5)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('TAX INVOICE', pw / 2, hy + 6, { align: 'center' })
  hy += 14

  // Divider
  doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(1)
  doc.line(ml, hy, pw - mr, hy); hy += 6

  // Info table (accent header cells)
  autoTable(doc, {
    startY: hy, margin: m,
    body: [
      ['Invoice No.', safeStr(d.no), 'Date', safeStr(d.dt)],
      ['Party', `${safeStr(d.cust)}${d.addr ? ' — ' + d.addr : ''}${d.cr ? '  CR: ' + d.cr : ''}`, '', ''],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 8.5, textColor: [30, 41, 59] as RGB,
      cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      lineColor: [197, 206, 217] as RGB, lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 26, fillColor: accent, textColor: [255, 255, 255] as RGB, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 26, fillColor: accent, textColor: [255, 255, 255] as RGB, fontStyle: 'bold', halign: 'center' },
      3: { cellWidth: 30 },
    },
    showHead: false,
  })
  const afterInfo = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 4
  hy = afterInfo

  // Items table
  autoTable(doc, {
    startY: hy, margin: m,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: d.items.map((item, i) => [
      String(i + 1), item.desc, String(item.qty),
      `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
      `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 8.5, textColor: [30, 41, 59] as RGB,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: [197, 206, 217] as RGB, lineWidth: 0.2,
    },
    headStyles: { fillColor: accent, textColor: [255, 255, 255] as RGB, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: lightAccent },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 16, halign: 'right' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' },
    },
  })
  const afterTable = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 4

  // Totals — double-bordered box like the HTML template
  const bxW = 72, bxX = pw - mr - bxW
  let cy = afterTable + 4
  const trows: [string, string][] = [['Subtotal', `${d.cur.symbol}${d.sv}`]]
  if (d.vp > 0) trows.push([`VAT (${d.vp}%)`, `${d.cur.symbol}${d.vv}`])
  if (d.disc > 0) trows.push(['Discount', `-${d.cur.symbol}${d.dv}`])
  const sumH = trows.length * 10 + 12
  strokeRect(doc, bxX, cy, bxW, sumH, accent, 1.5)
  cy += 4
  for (const [label, val] of trows) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 41, 59)
    doc.text(label, bxX + 4, cy + 4); doc.text(val, pw - mr - 4, cy + 4, { align: 'right' })
    hLine(doc, bxX, pw - mr, cy + 6, 0.2, [197, 206, 217]); cy += 10
  }
  fillRect(doc, bxX, cy, bxW, 12, accent)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255)
  doc.text('Grand Total', bxX + 4, cy + 8)
  doc.text(`${d.cur.symbol}${d.gv}`, pw - mr - 4, cy + 8, { align: 'right' }); cy += 14

  if (d.gw) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139)
    doc.text(d.gw, pw - mr - 2, cy + 4, { align: 'right' }); cy += 9
  }

  const afterNotes = renderNotes(doc, d, cy, accent, m)

  // 3-column signature
  cy = safePrintY(doc, afterNotes + 8)
  doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(1)
  doc.line(ml, cy, pw - mr, cy); cy += 4

  const colW = (pw - ml - mr) / 3
  // Prepared By
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
  doc.text('Prepared By', ml + 2, cy + 3)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(safeStr(d.comp.name), ml + 2, cy + 9)
  doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(1.2)
  doc.line(ml, cy + 12, ml + colW - 4, cy + 12)

  // Authorized Signature (centre)
  if (d.comp.signature) addImgContained(doc, d.comp.signature, ml + colW + 2, cy, colW - 4, 12, 'center')
  hLine(doc, ml + colW, ml + colW * 2 - 4, cy + 12, 0.4, [150, 150, 150])
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
  doc.text('Authorized Signature', ml + colW + (colW - 4) / 2, cy + 16, { align: 'center' })

  // Authorized By (right)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
  doc.text('Authorized By', pw - mr - 2, cy + 3, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(safeStr(d.comp.name), pw - mr - 2, cy + 9, { align: 'right' })
  doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(1.2)
  doc.line(ml + colW * 2, cy + 12, pw - mr, cy + 12)

  renderFooter(doc, d.comp, accent, m)
}

// ─── PUBLIC RECEIPT BUILDER ───────────────────────────────────────────────────

export async function buildReceiptPDF(d: RecTemplateData, filename: string): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true })
  const pw = doc.internal.pageSize.getWidth()
  const accent: RGB = d.comp.pcolor ? hexToRgb(d.comp.pcolor) : [217, 119, 6]
  const altAccent: RGB = d.comp.acolor ? hexToRgb(d.comp.acolor) : [30, 41, 59]
  const lightAccent = lighten(accent, 0.88)

  const tpl = d.comp.recTemplate || 'classic'

  if (tpl === 'bold') await drawReceiptBold(doc, d, pw, accent)
  else await drawReceiptBase(doc, d, pw, accent, altAccent, lightAccent, tpl)

  doc.save(`${filename}.pdf`)
}

async function drawReceiptBase(
  doc: jsPDF, d: RecTemplateData, pw: number,
  accent: RGB, altAccent: RGB, lightAccent: RGB, tpl: string
) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const ph = doc.internal.pageSize.getHeight()

  // Template-specific top decoration
  if (tpl === 'elegant' || tpl === 'beirak') {
    strokeRect(doc, 5, 5, pw - 10, ph - 10, accent, tpl === 'beirak' ? 2 : 0.7)
  } else if (tpl !== 'minimal') {
    fillRect(doc, 0, 0, pw, tpl === 'professional' ? 7 : 3.5, altAccent)
  }

  let hy = tpl === 'professional' ? 14 : 10

  if (d.comp.logo) addImgContained(doc, d.comp.logo, ml, hy, 26, 18)
  const nameX = d.comp.logo ? ml + 29 : ml
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(tpl === 'elegant' ? 16 : tpl === 'minimal' ? 12 : 13)
  doc.setTextColor(altAccent[0], altAccent[1], altAccent[2])
  doc.text(safeStr(d.comp.name), nameX, hy + 8)
  if (d.comp.sub) {
    doc.setFont('helvetica', tpl === 'elegant' ? 'italic' : 'normal')
    doc.setFontSize(8); doc.setTextColor(80, 80, 80)
    doc.text(d.comp.sub, nameX, hy + 14)
  }
  const contact = [d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean).join(' | ')
  if (contact) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100)
    doc.text(contact, nameX, hy + 19)
  }

  // Receipt title right
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('RECEIPT', pw - mr, hy + 8, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80)
  doc.text(safeStr(d.no), pw - mr, hy + 14, { align: 'right' })
  doc.text(safeStr(d.dt), pw - mr, hy + 20, { align: 'right' })

  hy += 28
  hLine(doc, ml, pw - mr, hy, 1.5, accent); hy += 4

  // Amount box
  fillRect(doc, ml, hy, pw - ml - mr, 22, lightAccent)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
  doc.text('RECEIVED FROM', ml + 4, hy + 6)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(altAccent[0], altAccent[1], altAccent[2])
  doc.text(safeStr(d.rf), ml + 4, hy + 13)
  // Amount on right
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
  doc.text('AMOUNT', pw - mr - 4, hy + 6, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(`${d.cur.symbol} ${d.amFmt}`, pw - mr - 4, hy + 16, { align: 'right' })

  hy += 26
  // Amount in words
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80)
  const wwLines = wrapText(doc, safeStr(d.ww), pw - ml - mr - 8)
  doc.text(wwLines, ml + 4, hy)
  hy += wwLines.length * 5 + 5
  hLine(doc, ml, pw - mr, hy, 0.4, [210, 210, 210]); hy += 6

  // Payment details
  const details: [string, string][] = [
    ['Payment Method', safeStr(d.pm)],
    ...(d.ch ? [['Cheque No.', d.ch] as [string, string]] : []),
    ...(d.bk ? [['Bank', d.bk] as [string, string]] : []),
    ...(d.td ? [['Transaction Date', d.td] as [string, string]] : []),
    ...(d.bg ? [['Being', d.bg] as [string, string]] : []),
    ...(d.rv ? [['Received By', d.rv] as [string, string]] : []),
  ]

  autoTable(doc, {
    startY: hy, margin: m,
    body: details, theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold', textColor: [80, 80, 80] as RGB },
      1: { cellWidth: 'auto', textColor: [30, 41, 59] as RGB },
    },
    showHead: false,
  })
  let cy = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 4

  // Items if present
  if (d.items && d.items.length > 0) {
    autoTable(doc, {
      startY: cy, margin: m,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: d.items.map((item, i) => [
        String(i + 1), item.desc, String(item.qty),
        `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
        `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
      ]),
      theme: 'grid',
      styles: {
        font: 'helvetica', fontSize: 8.5,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        lineColor: lighten(accent, 0.65), lineWidth: 0.2,
      },
      headStyles: { fillColor: altAccent, textColor: [255, 255, 255] as RGB, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 16, halign: 'right' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' },
      },
    })
    cy = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cy) + 4
  }

  // Signature
  cy = safePrintY(doc, cy + 8)
  const sigX = pw - mr - 46
  if (d.comp.seal) addImgContained(doc, d.comp.seal, ml, cy - 4, 22, 18)
  if (d.comp.signature) {
    addImgContained(doc, d.comp.signature, sigX, cy - 2, 44, 13, 'center'); cy += 13
  }
  hLine(doc, sigX, pw - mr, cy, 0.4, lighten(accent, 0.4))
  cy += 3.5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 100, 100)
  doc.text('Authorized Signature', sigX + 22, cy, { align: 'center' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(safeStr(d.comp.name), sigX + 22, cy + 4.5, { align: 'center' })

  renderFooter(doc, d.comp, accent, m)
}

async function drawReceiptBold(doc: jsPDF, d: RecTemplateData, pw: number, accent: RGB) {
  const ml = 14, mr = 14
  const black: RGB = [0, 0, 0]

  fillRect(doc, 0, 0, pw, 30, black)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(255, 255, 255)
  doc.text('RECEIPT', ml, 19)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(180, 180, 180)
  doc.text(safeStr(d.no), ml, 26)
  if (d.comp.logo) addImgContained(doc, d.comp.logo, pw - mr - 26, 4, 24, 22, 'right')

  let hy = 38
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(black[0], black[1], black[2])
  doc.text(safeStr(d.comp.name).toUpperCase(), ml, hy); hy += 12

  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2.5); doc.line(ml, hy, pw - mr, hy); hy += 8

  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(80, 80, 80)
  doc.text('RECEIVED FROM', ml, hy); doc.text('AMOUNT', pw - mr, hy, { align: 'right' }); hy += 8
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(black[0], black[1], black[2])
  doc.text(safeStr(d.rf), ml, hy)
  doc.setFontSize(20); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text(`${d.cur.symbol} ${d.amFmt}`, pw - mr, hy, { align: 'right' }); hy += 8

  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2.5); doc.line(ml, hy, pw - mr, hy); hy += 6

  doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(60, 60, 60)
  doc.text(safeStr(d.ww), ml, hy); hy += 10

  const details: [string, string][] = [
    ['Payment', safeStr(d.pm)],
    ...(d.ch ? [['Cheque No.', d.ch] as [string, string]] : []),
    ...(d.bk ? [['Bank', d.bk] as [string, string]] : []),
    ...(d.td ? [['Date', d.td] as [string, string]] : []),
    ...(d.bg ? [['Being', d.bg] as [string, string]] : []),
  ]
  for (const [label, val] of details) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(0, 0, 0)
    doc.text(`${label}:`, ml, hy)
    doc.setFont('helvetica', 'normal')
    doc.text(val, ml + 35, hy); hy += 6
  }

  hy = safePrintY(doc, hy + 6)
  const sigX = pw - mr - 46
  if (d.comp.signature) {
    addImgContained(doc, d.comp.signature, sigX, hy, 44, 13, 'center'); hy += 13
  }
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(1.5); doc.line(sigX, hy, pw - mr, hy); hy += 4
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(80, 80, 80)
  doc.text('AUTHORIZED SIGNATURE', sigX + 22, hy, { align: 'center' })

  const ph = doc.internal.pageSize.getHeight()
  const fy = ph - 14
  fillRect(doc, 0, fy - 2, pw, 16, black)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255)
  const fp = [safeStr(d.comp.name), ...[d.comp.loc, d.comp.tel, d.comp.email].filter(Boolean)]
  doc.text(fp.join('  |  '), pw / 2, fy + 6, { align: 'center' })
}

// ─── PUBLIC QUOTATION BUILDER ─────────────────────────────────────────────────

export async function buildQuotationPDF(d: QuotTemplateData, filename: string): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true })
  const pw = doc.internal.pageSize.getWidth()
  const accent: RGB = d.comp.pcolor ? hexToRgb(d.comp.pcolor) : [31, 41, 55]
  const lightAccent = lighten(accent, 0.9)

  const tpl = d.comp.quotTemplate || 'classic'
  if (tpl === 'bold') await drawQuotBold(doc, d, pw, accent)
  else await drawQuotBase(doc, d, pw, accent, lightAccent, tpl)

  doc.save(`${filename}.pdf`)
}

async function drawQuotBase(
  doc: jsPDF, d: QuotTemplateData, pw: number,
  accent: RGB, lightAccent: RGB, tpl: string
) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const ph = doc.internal.pageSize.getHeight()

  if (tpl === 'elegant' || tpl === 'beirak') {
    strokeRect(doc, 5, 5, pw - 10, ph - 10, accent, tpl === 'beirak' ? 2 : 0.7)
  } else if (tpl === 'modern') {
    fillRect(doc, 0, 0, 3.5, ph, accent)
  } else if (tpl !== 'minimal') {
    fillRect(doc, 0, 0, pw, tpl === 'professional' ? 7 : 3.5, accent)
  }

  let hy = tpl === 'professional' ? 14 : 10

  if (d.comp.logo) addImgContained(doc, d.comp.logo, ml, hy, 26, 18)
  const nameX = d.comp.logo ? ml + 29 : ml
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(17, 24, 39)
  doc.text(safeStr(d.comp.name), nameX, hy + 8)
  if (d.comp.sub) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
    doc.text(d.comp.sub, nameX, hy + 14)
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(accent[0], accent[1], accent[2])
  doc.text('QUOTATION', pw - mr, hy + 7, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
  doc.text(safeStr(d.no), pw - mr, hy + 13, { align: 'right' })

  hy += 25
  hLine(doc, ml, pw - mr, hy, 1.5, accent); hy += 4

  // Info bar — 3 columns
  fillRect(doc, ml, hy, pw - ml - mr, 16, lightAccent)
  const cW = (pw - ml - mr) / 3
  const cols = [
    { label: 'QUOTE TO', val: safeStr(d.cust), sub: [d.addr, d.ph].filter(Boolean).join(' | ') },
    { label: 'DATE', val: safeStr(d.dt), sub: '' },
    { label: 'VALID UNTIL', val: safeStr(d.validDt), sub: '' },
  ]
  for (let i = 0; i < 3; i++) {
    const cx = ml + i * cW
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(100, 116, 139)
    doc.text(cols[i].label, cx + 3, hy + 4.5)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(17, 24, 39)
    doc.text(cols[i].val, cx + 3, hy + 10.5)
    if (cols[i].sub) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(80, 80, 80)
      doc.text(wrapText(doc, cols[i].sub, cW - 5)[0] || '', cx + 3, hy + 14.5)
    }
  }
  hy += 20

  const afterTable = renderItemsTable(doc, d, hy, accent, lightAccent, m)
  const afterTotals = renderTotals(doc, d, afterTable, accent, pw, mr)

  // Notes + Terms
  let cy = afterTotals + 4
  const noteParts = [d.notes, d.terms].filter(Boolean) as string[]
  if (noteParts.length) {
    fillRect(doc, ml, cy, pw - ml - mr, 0.5, lighten(accent, 0.65))
    cy += 4
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60, 60, 60)
    for (const n of noteParts) {
      for (const wl of wrapText(doc, n, pw - ml - mr - 8)) {
        doc.text(wl, ml + 3, cy); cy += 5
      }
    }
    cy += 3
  }

  renderSigRow(doc, d.comp, safePrintY(doc, cy), accent, m)
  renderFooter(doc, d.comp, accent, m)
}

async function drawQuotBold(doc: jsPDF, d: QuotTemplateData, pw: number, accent: RGB) {
  const ml = 14, mr = 14, m: Margin = { left: ml, right: mr }
  const black: RGB = [0, 0, 0]

  fillRect(doc, 0, 0, pw, 30, black)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(255, 255, 255)
  doc.text('QUOTATION', ml, 18)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(180, 180, 180)
  doc.text(safeStr(d.no), ml, 26)
  if (d.comp.logo) addImgContained(doc, d.comp.logo, pw - mr - 26, 4, 24, 22, 'right')

  let hy = 36
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(black[0], black[1], black[2])
  doc.text(safeStr(d.comp.name).toUpperCase(), ml, hy); hy += 12

  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2.5); doc.line(ml, hy, pw - mr, hy); hy += 4

  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(80, 80, 80)
  doc.text('QUOTE TO', ml, hy + 4); doc.text('DATE  /  VALID UNTIL', pw - mr, hy + 4, { align: 'right' }); hy += 9
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 0, 0)
  doc.text(safeStr(d.cust), ml, hy)
  doc.setFontSize(9); doc.text(`${d.dt}  /  ${d.validDt}`, pw - mr, hy, { align: 'right' }); hy += 6
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(2.5); doc.line(ml, hy, pw - mr, hy); hy += 6

  autoTable(doc, {
    startY: hy, margin: m,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: d.items.map((item, i) => [
      String(i + 1), item.desc, String(item.qty),
      `${d.cur.symbol}${item.price.toFixed(d.dp)}`,
      `${d.cur.symbol}${item.amount.toFixed(d.dp)}`,
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 9, textColor: black,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: black, lineWidth: 0.7,
    },
    headStyles: { fillColor: black, textColor: [255, 255, 255] as RGB, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [252, 242, 242] as RGB },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 16, halign: 'right' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' },
    },
  })
  const afterTable = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? hy) + 2
  const afterTotals = renderTotals(doc, d, afterTable, accent, pw, mr)

  let cy = afterTotals + 4
  const noteParts = [d.notes, d.terms].filter(Boolean) as string[]
  if (noteParts.length) {
    let textH = 0
    for (const n of noteParts) textH += wrapText(doc, n, pw - ml - mr - 12).length * 5
    textH += 10
    fillRect(doc, ml, cy, 3, textH, accent)
    fillRect(doc, ml + 3, cy, pw - ml - mr - 3, textH, [249, 249, 249])
    cy += 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50)
    for (const n of noteParts) {
      for (const wl of wrapText(doc, n, pw - ml - mr - 12)) {
        doc.text(wl, ml + 7, cy); cy += 5
      }
    }
    cy += 5
  }

  renderSigRow(doc, d.comp, safePrintY(doc, cy), accent, m)
  renderFooter(doc, d.comp, accent, m)
}
