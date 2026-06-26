import { jsPDF } from 'jspdf'
import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import { num2words, dp as getDp } from '@/utils'
import { esc } from '@/utils/esc'

const MARGIN = 14
const W = 210 - MARGIN * 2
const TOP = 15

function fmt(n: number, dp: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function addPageIfNeeded(pdf: jsPDF, y: number): number {
  if (y > 265) { pdf.addPage(); return TOP }
  return y
}

// ─── IMAGE HELPERS ───────────────────────────────────────────────────────────

type LoadedImages = { logo?: string; seal?: string; signature?: string }

async function loadImages(co: Company): Promise<LoadedImages> {
  const result: LoadedImages = {}
  if (co.logo) result.logo = await imgToDataUrl(co.logo).catch(() => undefined)
  if (co.seal) result.seal = await imgToDataUrl(co.seal).catch(() => undefined)
  if (co.signature) result.signature = await imgToDataUrl(co.signature).catch(() => undefined)
  return result
}

function imgToDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function renderFooter(pdf: jsPDF, co: Company, y: number): void {
  pdf.setDrawColor('#ddd')
  pdf.setLineWidth(0.3)
  pdf.line(MARGIN, y, MARGIN + W, y)
  pdf.setFontSize(7)
  pdf.setTextColor('#999')
  pdf.text(`${co.name}${co.tel ? ` | ${co.tel}` : ''}${co.email ? ` | ${co.email}` : ''}`, MARGIN, y + 3.5)
  if (co.bankName) {
    pdf.text([co.bankName, co.bankAcc, co.bankIban].filter(Boolean).join(' | '), MARGIN, y + 6.5)
  }
}

function renderTableHeader(pdf: jsPDF, y: number, cols: { label: string; x: number; align: 'left' | 'right' }[], color: string): number {
  pdf.setFontSize(7.5)
  pdf.setTextColor(color)
  pdf.setFont('helvetica', 'bold')
  for (const c of cols) {
    c.align === 'right' ? pdf.text(c.label, c.x, y, { align: 'right' }) : pdf.text(c.label, c.x, y)
  }
  pdf.setFont('helvetica', 'normal')
  pdf.setDrawColor(color)
  pdf.setLineWidth(0.4)
  const ly = y + 1.5
  pdf.line(MARGIN, ly, MARGIN + W, ly)
  return ly + 3
}

function renderTableRow(pdf: jsPDF, y: number, cols: { text: string; x: number; align: 'left' | 'right' }[], alt?: boolean): number {
  if (alt) { pdf.setFillColor('#fafafa'); pdf.rect(MARGIN, y - 2.5, W, 7, 'F') }
  pdf.setFontSize(8.5)
  pdf.setTextColor('#333')
  for (const c of cols) {
    c.align === 'right' ? pdf.text(c.text, c.x, y, { align: 'right' }) : pdf.text(c.text, c.x, y)
  }
  pdf.setDrawColor('#eee')
  pdf.setLineWidth(0.2)
  const ly = y + 1.5
  pdf.line(MARGIN, ly, MARGIN + W, ly)
  return ly + 3
}

// ─── RECEIPT PDF ─────────────────────────────────────────────────────────────

async function renderReceiptGeneric(pdf: jsPDF, rec: Receipt, co: Company, imgs: LoadedImages, tplName: string) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP

  const amount = rec.amount || rec.items.reduce((s, i) => s + i.amount, 0)
  const words = rec.amountWords || (amount > 0 ? num2words(amount, cur) + ' only' : '')

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN, y, 12, 12) } catch {}
    pdf.text(co.name, MARGIN + 16, y + 5)
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 16, y + 9.5); pdf.setFontSize(10); pdf.setTextColor('#333') }
  } else {
    pdf.setFontSize(16)
    pdf.setTextColor(pc)
    pdf.text(co.name, MARGIN, y + 5)
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN, y + 10); pdf.setFontSize(10); pdf.setTextColor('#333') }
  }

  const contact = [co.loc, co.tel, co.email].filter(Boolean).join(' | ')
  if (contact) {
    pdf.setFontSize(7.5)
    pdf.setTextColor('#999')
    pdf.text(contact, MARGIN + (imgs.logo ? 16 : 0), y + (co.sub ? 14 : 10))
  }

  y = Math.max(y + 20, y + (imgs.logo ? 14 : 14) + 4)
  pdf.setDrawColor(pc); pdf.setLineWidth(0.5); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 6

  pdf.setFontSize(11)
  pdf.setTextColor(pc)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${cap(tplName)} Receipt`, MARGIN, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text(`${rec.recNo} | ${rec.date}`, MARGIN, y + 4)
  y += 10

  pdf.setFontSize(7.5)
  pdf.setTextColor('#999')
  pdf.text('RECEIVED FROM', MARGIN, y)
  pdf.setFontSize(10)
  pdf.setTextColor('#333')
  pdf.setFont('helvetica', 'bold')
  pdf.text(rec.receivedFrom, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  y += 10

  const c1 = MARGIN, c2 = MARGIN + 8, c3 = MARGIN + W - 60, c4 = MARGIN + W - 30, c5 = MARGIN + W

  if (rec.items.length > 0) {
    y = addPageIfNeeded(pdf, y + 18)
    y = renderTableHeader(pdf, y, [
      { label: '#', x: c1, align: 'left' }, { label: 'Description', x: c2, align: 'left' },
      { label: 'Qty', x: c3, align: 'right' }, { label: 'Price', x: c4, align: 'right' }, { label: 'Amount', x: c5, align: 'right' },
    ], pc)

    rec.items.forEach((item, i) => {
      y = addPageIfNeeded(pdf, y + 7)
      y = renderTableRow(pdf, y, [
        { text: String(i + 1), x: c1, align: 'left' }, { text: item.desc, x: c2, align: 'left' },
        { text: String(item.qty), x: c3, align: 'right' }, { text: fmt(item.price, dp), x: c4, align: 'right' },
        { text: fmt(item.amount, dp), x: c5, align: 'right' },
      ], i % 2 === 1)
    })
    y += 2
  }

  y = addPageIfNeeded(pdf, y + 16)
  pdf.setFillColor('#f9fafb'); pdf.setDrawColor('#eee'); pdf.rect(MARGIN, y, W, 11, 'FD')
  pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text('AMOUNT', MARGIN + 2, y + 3)
  if (words) { pdf.setFontSize(7); pdf.setTextColor('#999'); pdf.text(words, MARGIN + 2, y + 6); pdf.setTextColor('#333') }
  pdf.setFontSize(15); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text(`${cur.symbol}${fmt(amount, dp)}`, MARGIN + W - 2, y + 7, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  y += 15

  y = addPageIfNeeded(pdf, y + 10)
  const dets: string[] = [`Payment: ${rec.payMethod}`]
  if (rec.chequeNo) dets.push(`Cheque: ${rec.chequeNo}`)
  if (rec.bankName) dets.push(`Bank: ${rec.bankName}`)
  if (rec.transDate) dets.push(`Date: ${rec.transDate}`)
  if (rec.being) dets.push(`Purpose: ${rec.being}`)
  pdf.setFontSize(8); pdf.setTextColor('#333')
  dets.forEach((d, i) => { pdf.text(d, MARGIN + (i % 2) * 90, y + Math.floor(i / 2) * 4) })
  y += Math.ceil(dets.length / 2) * 4 + 6

  if (rec.receiver || rec.signatory) {
    y = addPageIfNeeded(pdf, y + 14)
    pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y)
    y += 4
    if (rec.receiver) {
      pdf.setDrawColor('#999'); pdf.line(MARGIN, y + 2, MARGIN + 40, y + 2)
      pdf.setFontSize(7); pdf.setTextColor('#666'); pdf.text('Receiver', MARGIN, y + 6)
      pdf.setFontSize(9); pdf.setTextColor('#333'); pdf.text(rec.receiver, MARGIN, y)
    }
    if (rec.signatory) {
      const sx = MARGIN + 60
      pdf.setDrawColor('#999'); pdf.line(sx, y + 2, sx + 40, y + 2)
      pdf.setFontSize(7); pdf.setTextColor('#666'); pdf.text('Signatory', sx, y + 6)
      pdf.setFontSize(9); pdf.setTextColor('#333'); pdf.text(rec.signatory, sx, y)
    }
  }

  renderFooter(pdf, co, 280)
}

async function renderReceiptClassic(pdf: jsPDF, rec: Receipt, co: Company, imgs: LoadedImages) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP - 4

  const amount = rec.amount || rec.items.reduce((s, i) => s + i.amount, 0)
  const words = rec.amountWords || (amount > 0 ? num2words(amount, cur) + ' only' : '')

  pdf.setFillColor(pc); pdf.rect(0, y, 210, 4, 'F')
  y += 8

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN, y, 12, 12) } catch {}
    pdf.setFontSize(15); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN + 16, y + 5)
    pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 16, y + 9.5) }
  } else {
    pdf.setFontSize(15); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN, y + 5)
    pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN, y + 10) }
  }

  const contact = [co.loc, co.tel, co.mob, co.email].filter(Boolean).join(' | ')
  if (contact) { pdf.setFontSize(7.5); pdf.setTextColor('#666'); pdf.text(contact, MARGIN, y + (co.sub ? 14 : 10)) }

  y = Math.max(y + 18, y + (imgs.logo ? 14 : 14) + 6)
  pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 5

  pdf.setFontSize(13); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('RECEIPT VOUCHER', MARGIN, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8); pdf.setTextColor('#999')
  pdf.text(`No.: ${rec.recNo} | Date: ${rec.date}`, MARGIN, y + 4)
  y += 10

  pdf.setDrawColor('#eee'); pdf.setLineWidth(0.2); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 4

  const labelW = 50
  const label = (l: string, v: string, rowY: number) => {
    pdf.setFontSize(8); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(l, MARGIN, rowY)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5); pdf.setTextColor('#555')
    pdf.text(v, MARGIN + labelW, rowY)
  }

  label('Received from:', rec.receivedFrom, y); y += 5
  label('Amount:', `${cur.symbol}${fmt(amount, dp)}`, y);
  if (words) { pdf.setFontSize(7); pdf.setTextColor('#999'); pdf.text(`(${words})`, MARGIN + labelW, y + 3.5); pdf.setTextColor('#333') }
  y += 6
  label('Payment:', rec.payMethod + (rec.chequeNo ? ` - ${rec.chequeNo}` : ''), y); y += 5
  if (rec.bankName || rec.transDate) {
    label('Bank / Date:', [rec.bankName, rec.transDate].filter(Boolean).join(' - '), y); y += 5
  }
  label('Purpose:', rec.being, y); y += 8

  pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 4

  if (imgs.seal && imgs.seal !== imgs.logo) {
    try { pdf.addImage(imgs.seal, 'PNG', MARGIN, y, 16, 16) } catch {}
  }
  if (rec.receiver) {
    pdf.setDrawColor('#999'); pdf.line(MARGIN + 30, y + 12, MARGIN + 70, y + 12)
    pdf.setFontSize(7); pdf.setTextColor('#666'); pdf.text('Receiver', MARGIN + 30, y + 16)
    pdf.setFontSize(8.5); pdf.setTextColor('#333'); pdf.text(rec.receiver, MARGIN + 30, y + 10)
  }
  if (rec.signatory) {
    const sx = MARGIN + 90
    pdf.setDrawColor('#999'); pdf.line(sx, y + 12, sx + 40, y + 12)
    pdf.setFontSize(7); pdf.setTextColor('#666'); pdf.text('Signatory', sx, y + 16)
    pdf.setFontSize(8.5); pdf.setTextColor('#333'); pdf.text(rec.signatory, sx, y + 10)
  }

  renderFooter(pdf, co, 280)
}

export async function createReceiptPDF(rec: Receipt, co: Company): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgs = await loadImages(co)
  const tpl = co.recTemplate || 'classic'

  if (tpl === 'classic') {
    await renderReceiptClassic(pdf, rec, co, imgs)
  } else {
    await renderReceiptGeneric(pdf, rec, co, imgs, tpl)
  }

  pdf.save(`${rec.recNo || 'receipt'}.pdf`)
}

// ─── INVOICE PDF ─────────────────────────────────────────────────────────────

async function renderInvoiceGeneric(pdf: jsPDF, inv: Invoice, co: Company, imgs: LoadedImages, tplName: string) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP
  const words = inv.grand > 0 ? num2words(inv.grand, cur) + ' only' : ''

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN, y, 12, 12) } catch {}
    pdf.text(co.name, MARGIN + 16, y + 5)
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 16, y + 9.5); pdf.setFontSize(10); pdf.setTextColor('#333') }
  } else {
    pdf.setFontSize(16); pdf.setTextColor(pc); pdf.text(co.name, MARGIN, y + 5)
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN, y + 10); pdf.setFontSize(10); pdf.setTextColor('#333') }
  }

  const contact = [co.loc, co.tel, co.email].filter(Boolean).join(' | ')
  if (contact) { pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text(contact, MARGIN + (imgs.logo ? 16 : 0), y + (co.sub ? 14 : 10)) }

  y = Math.max(y + 20, y + (imgs.logo ? 14 : 14) + 4)
  pdf.setDrawColor(pc); pdf.setLineWidth(0.5); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 6

  pdf.setFontSize(11); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text(`${cap(tplName)} Invoice`, MARGIN, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8); pdf.setTextColor('#999')
  pdf.text(`${inv.invNo} | ${inv.date}${inv.dueDate ? ` | Due: ${inv.dueDate}` : ''}`, MARGIN, y + 4)
  y += 10

  pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text('BILL TO', MARGIN, y)
  pdf.setFontSize(10); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
  pdf.text(inv.customer.name, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  const cust = [inv.customer.address, inv.customer.phone, inv.customer.email, inv.customer.cr ? `CR: ${inv.customer.cr}` : ''].filter(Boolean).join(' | ')
  if (cust) { pdf.setFontSize(8); pdf.setTextColor('#666'); pdf.text(cust, MARGIN, y + 9, { maxWidth: W }) }
  y += 15

  const c1 = MARGIN, c2 = MARGIN + 8, c3 = MARGIN + W - 65, c4 = MARGIN + W - 35, c5 = MARGIN + W

  y = addPageIfNeeded(pdf, y + 18)
  y = renderTableHeader(pdf, y, [
    { label: '#', x: c1, align: 'left' }, { label: 'Description', x: c2, align: 'left' },
    { label: 'Qty', x: c3, align: 'right' }, { label: 'Price', x: c4, align: 'right' }, { label: 'Amount', x: c5, align: 'right' },
  ], pc)

  inv.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    y = renderTableRow(pdf, y, [
      { text: String(i + 1), x: c1, align: 'left' }, { text: item.desc, x: c2, align: 'left' },
      { text: String(item.qty), x: c3, align: 'right' }, { text: fmt(item.price, dp), x: c4, align: 'right' },
      { text: fmt(item.amount, dp), x: c5, align: 'right' },
    ], i % 2 === 1)
  })

  y += 3; y = addPageIfNeeded(pdf, y + 30)
  const sx = MARGIN + W - 55
  pdf.setFontSize(8.5); pdf.setTextColor('#333')
  pdf.text('Subtotal', sx, y); pdf.text(fmt(inv.subtotal, dp), MARGIN + W, y, { align: 'right' }); y += 5
  if (inv.vatPct > 0) { pdf.text(`VAT (${inv.vatPct}%)`, sx, y); pdf.text(fmt(inv.vatAmt, dp), MARGIN + W, y, { align: 'right' }); y += 5 }
  if (inv.discount > 0) { pdf.text('Discount', sx, y); pdf.text(`-${fmt(inv.discount, dp)}`, MARGIN + W, y, { align: 'right' }); y += 5 }
  pdf.setDrawColor(pc); pdf.setLineWidth(0.5); pdf.line(sx, y, MARGIN + W, y); y += 3
  pdf.setFontSize(11); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('Total:', sx, y); pdf.text(`${cur.symbol}${fmt(inv.grand, dp)}`, MARGIN + W, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal'); y += 4
  if (words) { pdf.setFontSize(7); pdf.setTextColor('#999'); pdf.text(words, sx, y, { maxWidth: 55 }) }

  y += 8
  if (inv.notes) { y = addPageIfNeeded(pdf, y + 8); pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y); y += 3; pdf.setFontSize(8); pdf.setTextColor('#999'); pdf.text('Notes:', MARGIN, y); pdf.setTextColor('#666'); pdf.text(inv.notes, MARGIN, y + 4, { maxWidth: W }) }
  if (inv.payMethod) { pdf.setFontSize(8); pdf.setTextColor('#666'); pdf.text(`Payment: ${[inv.payMethod, inv.payDetails, inv.bankName].filter(Boolean).join(' | ')}`, MARGIN, y + 8, { maxWidth: W }) }

  renderFooter(pdf, co, 280)
}

async function renderInvoiceClassic(pdf: jsPDF, inv: Invoice, co: Company, imgs: LoadedImages) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP - 4
  const words = inv.grand > 0 ? num2words(inv.grand, cur) + ' only' : ''

  pdf.setFillColor(pc); pdf.rect(0, y, 210, 4, 'F')
  y += 8

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN, y, 12, 12) } catch {}
    pdf.setFontSize(15); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN + 16, y + 5); pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 16, y + 9.5) }
  } else {
    pdf.setFontSize(15); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN, y + 5); pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN, y + 10) }
  }

  const contact = [co.loc, co.tel, co.mob, co.email].filter(Boolean).join(' | ')
  if (contact) { pdf.setFontSize(7.5); pdf.setTextColor('#666'); pdf.text(contact, MARGIN, y + (co.sub ? 14 : 10)) }

  y = Math.max(y + 18, y + (imgs.logo ? 14 : 14) + 6)
  pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 5

  pdf.setFontSize(13); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('TAX INVOICE', MARGIN, y)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor('#999')
  pdf.text(`Invoice No.: ${inv.invNo} | Date: ${inv.date} | Due: ${inv.dueDate}${co.vatReg ? ` | VAT: ${co.vatReg}` : ''}`, MARGIN, y + 4)
  y += 10

  pdf.setDrawColor('#eee'); pdf.setLineWidth(0.2); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 4

  pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text('Bill To', MARGIN, y)
  pdf.setFontSize(10); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
  pdf.text(inv.customer.name, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  const cust = [inv.customer.address, inv.customer.phone, inv.customer.cr, inv.customer.email].filter(Boolean).join(' | ')
  if (cust) { pdf.setFontSize(8); pdf.setTextColor('#555'); pdf.text(cust, MARGIN, y + 9, { maxWidth: W }) }
  y += 16

  const c1 = MARGIN, c2 = MARGIN + 8, c3 = MARGIN + W - 65, c4 = MARGIN + W - 35, c5 = MARGIN + W

  y = addPageIfNeeded(pdf, y + 18)
  pdf.setFillColor(pc)
  pdf.rect(MARGIN, y - 3, W, 6, 'F')
  pdf.setFontSize(7.5); pdf.setTextColor('#fff'); pdf.setFont('helvetica', 'bold')
  pdf.text('#', c1, y); pdf.text('Description', c2, y); pdf.text('Qty', c3, y, { align: 'right' }); pdf.text('Price', c4, y, { align: 'right' }); pdf.text('Amount', c5, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  y += 5

  inv.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    y = renderTableRow(pdf, y, [
      { text: String(i + 1), x: c1, align: 'left' }, { text: item.desc, x: c2, align: 'left' },
      { text: String(item.qty), x: c3, align: 'right' }, { text: fmt(item.price, dp), x: c4, align: 'right' },
      { text: fmt(item.amount, dp), x: c5, align: 'right' },
    ], i % 2 === 1)
  })

  y += 3; y = addPageIfNeeded(pdf, y + 30)
  const sx = MARGIN + W - 55
  pdf.setFontSize(8.5); pdf.setTextColor('#333')
  pdf.text('Subtotal:', sx, y); pdf.text(fmt(inv.subtotal, dp), MARGIN + W, y, { align: 'right' }); y += 5
  if (inv.vatPct > 0) { pdf.text(`VAT (${inv.vatPct}%):`, sx, y); pdf.text(fmt(inv.vatAmt, dp), MARGIN + W, y, { align: 'right' }); y += 5 }
  if (inv.discount > 0) { pdf.text('Discount:', sx, y); pdf.text(`-${fmt(inv.discount, dp)}`, MARGIN + W, y, { align: 'right' }); y += 5 }
  pdf.setDrawColor('#333'); pdf.setLineWidth(0.5); pdf.line(sx, y, MARGIN + W, y); y += 3
  pdf.setFontSize(11); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('Total Due:', sx, y); pdf.text(`${cur.symbol}${fmt(inv.grand, dp)}`, MARGIN + W, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal'); y += 4
  if (words) { pdf.setFontSize(7); pdf.setTextColor('#666'); pdf.text(words, sx, y, { maxWidth: 55 }) }

  y += 8
  const details = [`Payment: ${[inv.payMethod, inv.payDetails].filter(Boolean).join(' - ')}`, inv.notes, co.invTerms].filter(Boolean).join('\n')
  if (details) { pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y); y += 3; pdf.setFontSize(8); pdf.setTextColor('#555'); pdf.text(details, MARGIN, y, { maxWidth: W }) }

  renderFooter(pdf, co, 280)
}

async function renderInvoiceModern(pdf: jsPDF, inv: Invoice, co: Company, imgs: LoadedImages) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP
  const words = inv.grand > 0 ? num2words(inv.grand, cur) + ' only' : ''

  pdf.setFillColor(pc); pdf.rect(MARGIN - 2, y, 3, 270, 'F')

  pdf.setFillColor('#f9fafb')
  pdf.roundedRect(MARGIN + 3, y, W - 3, 18, 2, 2, 'F')

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN + 6, y + 3, 12, 12) } catch {}
    pdf.setFontSize(14); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN + 21, y + 8); pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(8); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 21, y + 13) }
  } else {
    pdf.setFontSize(14); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN + 6, y + 8); pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(8); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 6, y + 13) }
  }

  pdf.setDrawColor(pc); pdf.setLineWidth(1.5)
  pdf.line(MARGIN + W - 45, y + 2, MARGIN + W - 2, y + 2)
  pdf.setFontSize(8); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('INVOICE', MARGIN + W - 2, y + 6, { align: 'right' })
  pdf.setFontSize(12); pdf.setTextColor('#333')
  pdf.text(inv.invNo, MARGIN + W - 2, y + 12, { align: 'right' })
  pdf.setFont('helvetica', 'normal')

  y += 22

  pdf.setFillColor('#f9fafb')
  pdf.roundedRect(MARGIN + 3, y, (W - 3) * 0.6, 14, 2, 2, 'F')
  pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text('Bill To', MARGIN + 8, y + 2.5)
  pdf.setFontSize(9.5); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
  pdf.text(inv.customer.name, MARGIN + 8, y + 7.5); pdf.setFont('helvetica', 'normal')
  const cust = [inv.customer.address, inv.customer.phone, inv.customer.email].filter(Boolean).join(' | ')
  if (cust) { pdf.setFontSize(7.5); pdf.setTextColor('#555'); pdf.text(cust, MARGIN + 8, y + 12, { maxWidth: (W - 3) * 0.6 - 10 }) }

  pdf.setFontSize(7.5); pdf.setTextColor('#666'); pdf.text(`Date: ${inv.date}`, MARGIN + W - 45, y + 2.5, { align: 'right' })
  if (inv.dueDate) pdf.text(`Due: ${inv.dueDate}`, MARGIN + W - 45, y + 6.5, { align: 'right' })
  if (co.vatReg) pdf.text(`VAT: ${co.vatReg}`, MARGIN + W - 45, y + 10.5, { align: 'right' })

  y += 18

  const c1 = MARGIN + 3, c2 = MARGIN + 12, c3 = MARGIN + W - 62, c4 = MARGIN + W - 32, c5 = MARGIN + W - 2

  y = addPageIfNeeded(pdf, y + 18)
  pdf.setFillColor(pc)
  pdf.roundedRect(c1, y - 3, W - 5, 6, 1.5, 1.5, 'F')
  pdf.setFontSize(7.5); pdf.setTextColor('#fff'); pdf.setFont('helvetica', 'bold')
  pdf.text('#', c1 + 2, y); pdf.text('Description', c2, y); pdf.text('Qty', c3, y, { align: 'right' }); pdf.text('Price', c4, y, { align: 'right' }); pdf.text('Amount', c5, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  y += 5

  inv.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    if (i % 2 === 1) { pdf.setFillColor('#f9fafb'); pdf.roundedRect(c1, y - 2.5, W - 5, 7, 1, 1, 'F') }
    pdf.setFontSize(8.5); pdf.setTextColor('#333')
    pdf.text(String(i + 1), c1 + 2, y); pdf.text(item.desc, c2, y)
    pdf.text(String(item.qty), c3, y, { align: 'right' }); pdf.text(fmt(item.price, dp), c4, y, { align: 'right' })
    pdf.text(fmt(item.amount, dp), c5, y, { align: 'right' })
    y += 5
  })

  y += 2; y = addPageIfNeeded(pdf, y + 28)
  pdf.setFillColor('#f9fafb'); pdf.setDrawColor('#eee')
  pdf.roundedRect(c3 - 10, y, W - c3 + 10, 16, 2, 2, 'FD')

  const my = y + 3
  pdf.setFontSize(8); pdf.setTextColor('#333')
  pdf.text('Subtotal', c3 - 5, my); pdf.text(fmt(inv.subtotal, dp), c5, my, { align: 'right' })
  if (inv.vatPct > 0) { pdf.text(`VAT (${inv.vatPct}%)`, c3 - 5, my + 4); pdf.text(fmt(inv.vatAmt, dp), c5, my + 4, { align: 'right' }) }
  if (inv.discount > 0) { pdf.text('Discount', c3 - 5, my + (inv.vatPct > 0 ? 8 : 4)); pdf.text(`-${fmt(inv.discount, dp)}`, c5, my + (inv.vatPct > 0 ? 8 : 4), { align: 'right' }) }
  const lineOff = 1 + (inv.vatPct > 0 ? 4 : 0) + (inv.discount > 0 ? 4 : 0)
  pdf.setDrawColor('#ccc'); pdf.setLineWidth(0.3); pdf.line(c3 - 5, my + lineOff, c5, my + lineOff)
  pdf.setFontSize(10); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('Total Due', c3 - 5, my + lineOff + 4); pdf.text(`${cur.symbol}${fmt(inv.grand, dp)}`, c5, my + lineOff + 4, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  if (words) { pdf.setFontSize(6.5); pdf.setTextColor('#666'); pdf.text(words, c3 - 5, my + lineOff + 8, { maxWidth: W - c3 + 10 }) }

  y += 18
  if (inv.notes || co.invTerms) {
    y = addPageIfNeeded(pdf, y + 8)
    pdf.setDrawColor('#eee'); pdf.setLineWidth(0.3); pdf.line(MARGIN + 3, y, MARGIN + W - 2, y); y += 3
    pdf.setFontSize(7.5); pdf.setTextColor('#555')
    if (inv.notes) pdf.text(inv.notes, MARGIN + 3, y, { maxWidth: W - 5 })
    if (co.invTerms) pdf.text(co.invTerms, MARGIN + 3, y + 4, { maxWidth: W - 5 })
  }

  pdf.setDrawColor('#eee'); pdf.setLineWidth(0.3)
  pdf.line(MARGIN + 3, 280, MARGIN + W - 2, 280)
  pdf.setFontSize(7); pdf.setTextColor('#666')
  pdf.text(`${co.name}${co.loc ? ` - ${co.loc}` : ''}`, MARGIN + 3, 284)
  pdf.text(`Tel: ${co.tel}${co.email ? ` | ${co.email}` : ''}`, MARGIN + W - 2, 284, { align: 'right' })
}

async function buildInvoicePDF(inv: Invoice, co: Company): Promise<jsPDF> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgs = await loadImages(co)
  const tpl = co.invTemplate || 'classic'

  if (tpl === 'classic') {
    await renderInvoiceClassic(pdf, inv, co, imgs)
  } else if (tpl === 'modern') {
    await renderInvoiceModern(pdf, inv, co, imgs)
  } else {
    await renderInvoiceGeneric(pdf, inv, co, imgs, tpl)
  }

  return pdf
}

export async function createInvoicePDF(inv: Invoice, co: Company): Promise<void> {
  const pdf = await buildInvoicePDF(inv, co)
  pdf.save(`${inv.invNo || 'invoice'}.pdf`)
}

export async function createInvoicePDFBlob(inv: Invoice, co: Company): Promise<Blob> {
  const pdf = await buildInvoicePDF(inv, co)
  return pdf.output('blob')
}

// ─── QUOTATION PDF ───────────────────────────────────────────────────────────

async function renderQuotationGeneric(pdf: jsPDF, quot: Quotation, co: Company, imgs: LoadedImages, tplName: string) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP
  const words = quot.grand > 0 ? num2words(quot.grand, cur) + ' only' : ''

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN, y, 12, 12) } catch {}
    pdf.text(co.name, MARGIN + 16, y + 5)
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 16, y + 9.5); pdf.setFontSize(10); pdf.setTextColor('#333') }
  } else {
    pdf.setFontSize(16); pdf.setTextColor(pc); pdf.text(co.name, MARGIN, y + 5)
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN, y + 10); pdf.setFontSize(10); pdf.setTextColor('#333') }
  }

  const contact = [co.loc, co.tel, co.email].filter(Boolean).join(' | ')
  if (contact) { pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text(contact, MARGIN + (imgs.logo ? 16 : 0), y + (co.sub ? 14 : 10)) }

  y = Math.max(y + 20, y + (imgs.logo ? 14 : 14) + 4)
  pdf.setDrawColor(pc); pdf.setLineWidth(0.5); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 6

  pdf.setFontSize(11); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text(`${cap(tplName)} Quotation`, MARGIN, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8); pdf.setTextColor('#999')
  pdf.text(`${quot.quotNo} | ${quot.date}${quot.validUntil ? ` | Valid: ${quot.validUntil}` : ''}`, MARGIN, y + 4)
  y += 10

  pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text('TO', MARGIN, y)
  pdf.setFontSize(10); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
  pdf.text(quot.customer.name, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  const cust = [quot.customer.address, quot.customer.phone, quot.customer.email, quot.customer.cr ? `CR: ${quot.customer.cr}` : ''].filter(Boolean).join(' | ')
  if (cust) { pdf.setFontSize(8); pdf.setTextColor('#666'); pdf.text(cust, MARGIN, y + 9, { maxWidth: W }) }
  y += 15

  const c1 = MARGIN, c2 = MARGIN + 8, c3 = MARGIN + W - 65, c4 = MARGIN + W - 35, c5 = MARGIN + W

  y = addPageIfNeeded(pdf, y + 18)
  y = renderTableHeader(pdf, y, [
    { label: '#', x: c1, align: 'left' }, { label: 'Description', x: c2, align: 'left' },
    { label: 'Qty', x: c3, align: 'right' }, { label: 'Price', x: c4, align: 'right' }, { label: 'Amount', x: c5, align: 'right' },
  ], pc)

  quot.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    y = renderTableRow(pdf, y, [
      { text: String(i + 1), x: c1, align: 'left' }, { text: item.desc, x: c2, align: 'left' },
      { text: String(item.qty), x: c3, align: 'right' }, { text: fmt(item.price, dp), x: c4, align: 'right' },
      { text: fmt(item.amount, dp), x: c5, align: 'right' },
    ], i % 2 === 1)
  })

  y += 3; y = addPageIfNeeded(pdf, y + 30)
  const sx = MARGIN + W - 55
  pdf.setFontSize(8.5); pdf.setTextColor('#333')
  pdf.text('Subtotal', sx, y); pdf.text(fmt(quot.subtotal, dp), MARGIN + W, y, { align: 'right' }); y += 5
  if (quot.vatPct > 0) { pdf.text(`VAT (${quot.vatPct}%)`, sx, y); pdf.text(fmt(quot.vatAmt, dp), MARGIN + W, y, { align: 'right' }); y += 5 }
  if (quot.discount > 0) { pdf.text('Discount', sx, y); pdf.text(`-${fmt(quot.discount, dp)}`, MARGIN + W, y, { align: 'right' }); y += 5 }
  pdf.setDrawColor(pc); pdf.setLineWidth(0.5); pdf.line(sx, y, MARGIN + W, y); y += 3
  pdf.setFontSize(11); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('Total:', sx, y); pdf.text(`${cur.symbol}${fmt(quot.grand, dp)}`, MARGIN + W, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal'); y += 4
  if (words) { pdf.setFontSize(7); pdf.setTextColor('#999'); pdf.text(words, sx, y, { maxWidth: 55 }) }

  y += 8
  if (quot.notes) { y = addPageIfNeeded(pdf, y + 8); pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y); y += 3; pdf.setFontSize(8); pdf.setTextColor('#999'); pdf.text('Notes:', MARGIN, y); pdf.setTextColor('#666'); pdf.text(quot.notes, MARGIN, y + 4, { maxWidth: W }) }
  if (quot.terms) { pdf.setFontSize(8); pdf.setTextColor('#666'); pdf.text(`Terms: ${quot.terms}`, MARGIN, y + 8, { maxWidth: W }) }

  renderFooter(pdf, co, 280)
}

async function renderQuotationClassic(pdf: jsPDF, quot: Quotation, co: Company, imgs: LoadedImages) {
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP - 4
  const words = quot.grand > 0 ? num2words(quot.grand, cur) + ' only' : ''

  pdf.setFillColor(pc); pdf.rect(0, y, 210, 4, 'F')
  y += 8

  if (imgs.logo) {
    try { pdf.addImage(imgs.logo, 'PNG', MARGIN, y, 12, 12) } catch {}
    pdf.setFontSize(15); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN + 16, y + 5); pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN + 16, y + 9.5) }
  } else {
    pdf.setFontSize(15); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
    pdf.text(co.name, MARGIN, y + 5); pdf.setFont('helvetica', 'normal')
    if (co.sub) { pdf.setFontSize(9); pdf.setTextColor('#666'); pdf.text(co.sub, MARGIN, y + 10) }
  }

  const contact = [co.loc, co.tel, co.mob, co.email].filter(Boolean).join(' | ')
  if (contact) { pdf.setFontSize(7.5); pdf.setTextColor('#666'); pdf.text(contact, MARGIN, y + (co.sub ? 14 : 10)) }

  y = Math.max(y + 18, y + (imgs.logo ? 14 : 14) + 6)
  pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 5

  pdf.setFontSize(13); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('QUOTATION', MARGIN, y)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor('#999')
  pdf.text(`Quotation No.: ${quot.quotNo} | Date: ${quot.date} | Valid: ${quot.validUntil}${co.vatReg ? ` | VAT: ${co.vatReg}` : ''}`, MARGIN, y + 4)
  y += 10

  pdf.setDrawColor('#eee'); pdf.setLineWidth(0.2); pdf.line(MARGIN, y, MARGIN + W, y)
  y += 4

  pdf.setFontSize(7.5); pdf.setTextColor('#999'); pdf.text('Bill To', MARGIN, y)
  pdf.setFontSize(10); pdf.setTextColor('#333'); pdf.setFont('helvetica', 'bold')
  pdf.text(quot.customer.name, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  const cust = [quot.customer.address, quot.customer.phone, quot.customer.cr, quot.customer.email].filter(Boolean).join(' | ')
  if (cust) { pdf.setFontSize(8); pdf.setTextColor('#555'); pdf.text(cust, MARGIN, y + 9, { maxWidth: W }) }
  y += 16

  const c1 = MARGIN, c2 = MARGIN + 8, c3 = MARGIN + W - 65, c4 = MARGIN + W - 35, c5 = MARGIN + W

  y = addPageIfNeeded(pdf, y + 18)
  pdf.setFillColor(pc)
  pdf.rect(MARGIN, y - 3, W, 6, 'F')
  pdf.setFontSize(7.5); pdf.setTextColor('#fff'); pdf.setFont('helvetica', 'bold')
  pdf.text('#', c1, y); pdf.text('Description', c2, y); pdf.text('Qty', c3, y, { align: 'right' }); pdf.text('Price', c4, y, { align: 'right' }); pdf.text('Amount', c5, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  y += 5

  quot.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    y = renderTableRow(pdf, y, [
      { text: String(i + 1), x: c1, align: 'left' }, { text: item.desc, x: c2, align: 'left' },
      { text: String(item.qty), x: c3, align: 'right' }, { text: fmt(item.price, dp), x: c4, align: 'right' },
      { text: fmt(item.amount, dp), x: c5, align: 'right' },
    ], i % 2 === 1)
  })

  y += 3; y = addPageIfNeeded(pdf, y + 30)
  const sx = MARGIN + W - 55
  pdf.setFontSize(8.5); pdf.setTextColor('#333')
  pdf.text('Subtotal:', sx, y); pdf.text(fmt(quot.subtotal, dp), MARGIN + W, y, { align: 'right' }); y += 5
  if (quot.vatPct > 0) { pdf.text(`VAT (${quot.vatPct}%):`, sx, y); pdf.text(fmt(quot.vatAmt, dp), MARGIN + W, y, { align: 'right' }); y += 5 }
  if (quot.discount > 0) { pdf.text('Discount:', sx, y); pdf.text(`-${fmt(quot.discount, dp)}`, MARGIN + W, y, { align: 'right' }); y += 5 }
  pdf.setDrawColor('#333'); pdf.setLineWidth(0.5); pdf.line(sx, y, MARGIN + W, y); y += 3
  pdf.setFontSize(11); pdf.setTextColor(pc); pdf.setFont('helvetica', 'bold')
  pdf.text('Total:', sx, y); pdf.text(`${cur.symbol}${fmt(quot.grand, dp)}`, MARGIN + W, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal'); y += 4
  if (words) { pdf.setFontSize(7); pdf.setTextColor('#666'); pdf.text(words, sx, y, { maxWidth: 55 }) }

  y += 8
  if (quot.notes || quot.terms || co.invTerms) {
    pdf.setDrawColor('#ddd'); pdf.setLineWidth(0.3); pdf.line(MARGIN, y, MARGIN + W, y); y += 3
    pdf.setFontSize(8); pdf.setTextColor('#555')
    if (quot.notes) pdf.text(`Notes: ${quot.notes}`, MARGIN, y, { maxWidth: W })
    if (quot.terms) pdf.text(`Terms: ${quot.terms}`, MARGIN, y + 4, { maxWidth: W })
  }

  renderFooter(pdf, co, 280)
}

export async function createQuotationPDF(quot: Quotation, co: Company): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgs = await loadImages(co)
  const tpl = co.quotTemplate || 'classic'

  if (tpl === 'classic') {
    await renderQuotationClassic(pdf, quot, co, imgs)
  } else {
    await renderQuotationGeneric(pdf, quot, co, imgs, tpl)
  }

  pdf.save(`${quot.quotNo || 'quotation'}.pdf`)
}

// ─── LEGACY IMAGE-BASED PDF + PRINT HELPERS ─────────────────────────────────

import html2canvas from 'html2canvas'

const A4_W = 794
const A4_H = 1123

export async function capturePDF(html: string, filename: string): Promise<void> {
  const pageEl = document.createElement('div')
  pageEl.style.cssText = `position:fixed;top:-9999px;left:0;width:${A4_W}px;height:${A4_H}px;overflow:hidden;background:#fff;`
  const content = document.createElement('div')
  content.style.cssText = `width:${A4_W}px;background:#fff;min-height:0!important;`
  content.innerHTML = html
  pageEl.appendChild(content)
  document.body.appendChild(pageEl)
  await waitForImages(content)
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = 210; const pdfH = 297
    const totalH = content.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalH / A4_H))
    for (let i = 0; i < pageCount; i++) {
      content.style.marginTop = `${-i * A4_H}px`
      const canvas = await html2canvas(pageEl, { scale: 2, useCORS: true, allowTaint: true, logging: false })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
    }
    pdf.save(filename + '.pdf')
  } catch (err) { throw err }
  finally { document.body.removeChild(pageEl) }
}

export async function printHTML(html: string): Promise<void> {
  const area = document.getElementById('printArea') || createPrintArea()
  area.innerHTML = html; area.style.display = 'block'
  await waitForImages(area); window.print(); area.style.display = ''
}

export function downloadText(html: string, filename: string): void {
  const div = document.createElement('div')
  div.innerHTML = html
  const cleaned = (div.textContent || '').replace(/\s+/g, ' ').trim()
  const blob = new Blob([cleaned], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename + '.txt'
  a.click(); URL.revokeObjectURL(url)
}

function createPrintArea(): HTMLElement {
  const el = document.createElement('div'); el.id = 'printArea'; el.className = 'print-only'
  document.body.appendChild(el); return el
}

function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = container.querySelectorAll('img')
  if (imgs.length === 0) return Promise.resolve()
  return Promise.all(Array.from(imgs).map((img) =>
    new Promise<void>((resolve) => {
      if (img.complete) resolve()
      else { img.onload = () => resolve(); img.onerror = () => resolve() }
    })
  )).then(() => {})
}
