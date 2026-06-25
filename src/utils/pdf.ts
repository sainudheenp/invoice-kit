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

function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

function fmt(n: number, dp: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

function header(pdf: jsPDF, co: Company, pc: string, y: number): number {
  const logoSize = 12
  let x = MARGIN

  if (co.logo) {
    try {
      pdf.addImage(co.logo, 'PNG', x, y, logoSize, logoSize)
    } catch { /* ignore */ }
    x += logoSize + 4
  }

  pdf.setFontSize(16)
  pdf.setTextColor(pc)
  pdf.text(co.name, x, y + 5)

  if (co.sub) {
    pdf.setFontSize(9)
    pdf.setTextColor('#666')
    pdf.text(co.sub, x, y + 10)
  }

  const contact = [co.loc, co.tel, co.email].filter(Boolean).join(' | ')
  if (contact) {
    pdf.setFontSize(7.5)
    pdf.setTextColor('#999')
    pdf.text(contact, MARGIN + (co.logo ? logoSize + 4 : 0), y + (co.sub ? 14 : 10))
  }

  const barY = Math.max(y + (co.logo ? logoSize : 14) + 4, y + 20)
  pdf.setDrawColor(pc)
  pdf.setLineWidth(0.5)
  pdf.line(MARGIN, barY, MARGIN + W, barY)

  return barY + 6
}

function footer(pdf: jsPDF, co: Company, pc: string): void {
  const y = 285
  pdf.setDrawColor('#ddd')
  pdf.setLineWidth(0.3)
  pdf.line(MARGIN, y, MARGIN + W, y)

  pdf.setFontSize(7)
  pdf.setTextColor('#999')
  pdf.text(`${co.name}${co.tel ? ` | ${co.tel}` : ''}${co.email ? ` | ${co.email}` : ''}`, MARGIN, y + 4)

  if (co.bankName) {
    const bank = [co.bankName, co.bankAcc, co.bankIban].filter(Boolean).join(' | ')
    pdf.text(bank, MARGIN, y + 8)
  }
}

function addPageIfNeeded(pdf: jsPDF, y: number): number {
  if (y > 265) {
    pdf.addPage()
    return TOP
  }
  return y
}

function tableHeader(pdf: jsPDF, y: number, cols: { label: string; x: number; align: 'left' | 'right' }[], pc: string): number {
  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  for (const col of cols) {
    if (col.align === 'right') {
      pdf.text(col.label, col.x, y, { align: 'right' })
    } else {
      pdf.text(col.label, col.x, y)
    }
  }
  pdf.setDrawColor('#ddd')
  pdf.setLineWidth(0.3)
  const lineY = y + 1.5
  pdf.line(MARGIN, lineY, MARGIN + W, lineY)
  return lineY + 3
}

function tableRow(pdf: jsPDF, y: number, cols: { text: string; x: number; align: 'left' | 'right' }[], dp: number, isAlt?: boolean): number {
  if (isAlt) {
    pdf.setFillColor('#fafafa')
    pdf.rect(MARGIN, y - 2.5, W, 7, 'F')
  }
  pdf.setFontSize(8.5)
  pdf.setTextColor('#333')
  for (const col of cols) {
    if (col.align === 'right') {
      pdf.text(col.text, col.x, y, { align: 'right' })
    } else {
      pdf.text(col.text, col.x, y)
    }
  }
  const lineY = y + 1.5
  pdf.setDrawColor('#eee')
  pdf.setLineWidth(0.2)
  pdf.line(MARGIN, lineY, MARGIN + W, lineY)
  return lineY + 3
}

// ─── RECEIPT PDF ────────────────────────────────────────────────────────────

export async function createReceiptPDF(rec: Receipt, co: Company): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP

  pdf.setFont('helvetica', 'normal')
  const amount = rec.amount || rec.items.reduce((s, i) => s + i.amount, 0)
  const words = rec.amountWords || (amount > 0 ? num2words(amount, cur) + ' only' : '')

  y = header(pdf, co, pc, y)

  pdf.setFontSize(12)
  pdf.setTextColor(pc)
  pdf.text('RECEIPT VOUCHER', MARGIN, y)
  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text(`${rec.recNo} | ${rec.date}`, MARGIN, y + 4)

  y += 10

  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text('RECEIVED FROM', MARGIN, y)
  pdf.setFontSize(10)
  pdf.setTextColor('#333')
  pdf.setFont('helvetica', 'bold')
  pdf.text(rec.receivedFrom, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')

  y += 10

  if (rec.items.length > 0) {
    y = addPageIfNeeded(pdf, y + 18)

    const col1 = MARGIN
    const col2 = MARGIN + 8
    const col3 = MARGIN + W - 60
    const col4 = MARGIN + W - 30
    const col5 = MARGIN + W

    y = tableHeader(pdf, y, [
      { label: '#', x: col1, align: 'left' },
      { label: 'Description', x: col2, align: 'left' },
      { label: 'Qty', x: col3, align: 'right' },
      { label: 'Price', x: col4, align: 'right' },
      { label: 'Amount', x: col5, align: 'right' },
    ], pc)

    rec.items.forEach((item, i) => {
      y = addPageIfNeeded(pdf, y + 7)
      y = tableRow(pdf, y, [
        { text: String(i + 1), x: col1, align: 'left' },
        { text: item.desc, x: col2, align: 'left' },
        { text: String(item.qty), x: col3, align: 'right' },
        { text: fmt(item.price, dp), x: col4, align: 'right' },
        { text: fmt(item.amount, dp), x: col5, align: 'right' },
      ], dp, i % 2 === 1)
    })

    y += 2
  }

  y = addPageIfNeeded(pdf, y + 20)

  pdf.setFillColor('#f9fafb')
  pdf.rect(MARGIN, y, W, 12, 'F')
  pdf.setDrawColor('#eee')
  pdf.rect(MARGIN, y, W, 12, 'S')

  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text('AMOUNT', MARGIN + 2, y + 3.5)
  if (words) {
    pdf.setFontSize(7)
    pdf.setTextColor('#999')
    pdf.text(words, MARGIN + 2, y + 6.5)
  }
  pdf.setFontSize(16)
  pdf.setTextColor(pc)
  pdf.setFont('helvetica', 'bold')
  const amtText = `${cur.symbol}${fmt(amount, dp)}`
  pdf.text(amtText, MARGIN + W - 2, y + 8, { align: 'right' })
  pdf.setFont('helvetica', 'normal')

  y += 16

  y = addPageIfNeeded(pdf, y + 25)

  const payLines: string[] = [`Payment: ${rec.payMethod}`]
  if (rec.chequeNo) payLines.push(`Cheque: ${rec.chequeNo}`)
  if (rec.bankName) payLines.push(`Bank: ${rec.bankName}`)
  if (rec.transDate) payLines.push(`Date: ${rec.transDate}`)
  if (rec.being) payLines.push(`Purpose: ${rec.being}`)

  pdf.setFontSize(8.5)
  pdf.setTextColor('#333')
  pdf.text(payLines.join(' | '), MARGIN, y, { maxWidth: W })

  y += 8

  if (rec.receiver || rec.signatory) {
    y = addPageIfNeeded(pdf, y + 15)
    pdf.setDrawColor('#ddd')
    pdf.setLineWidth(0.3)
    pdf.line(MARGIN, y, MARGIN + W, y)
    y += 4

    if (rec.receiver) {
      pdf.setDrawColor('#999')
      pdf.line(MARGIN, y, MARGIN + 40, y)
      pdf.setFontSize(8)
      pdf.setTextColor('#666')
      pdf.text('Receiver', MARGIN, y + 3.5)
      pdf.setFontSize(9)
      pdf.setTextColor('#333')
      pdf.text(rec.receiver, MARGIN, y - 1)
    }
    if (rec.signatory) {
      pdf.setDrawColor('#999')
      pdf.line(MARGIN + 60, y, MARGIN + 100, y)
      pdf.setFontSize(8)
      pdf.setTextColor('#666')
      pdf.text('Signatory', MARGIN + 60, y + 3.5)
      pdf.setFontSize(9)
      pdf.setTextColor('#333')
      pdf.text(rec.signatory, MARGIN + 60, y - 1)
    }
  }

  footer(pdf, co, pc)
  pdf.save(`${rec.recNo || 'receipt'}.pdf`)
}

// ─── INVOICE PDF ────────────────────────────────────────────────────────────

export async function createInvoicePDF(inv: Invoice, co: Company): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP

  pdf.setFont('helvetica', 'normal')
  const words = inv.grand > 0 ? num2words(inv.grand, cur) + ' only' : ''

  y = header(pdf, co, pc, y)

  pdf.setFontSize(12)
  pdf.setTextColor(pc)
  pdf.text('TAX INVOICE', MARGIN, y)
  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text(`${inv.invNo} | ${inv.date}${inv.dueDate ? ` | Due: ${inv.dueDate}` : ''}`, MARGIN, y + 4)

  y += 10

  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text('BILL TO', MARGIN, y)
  pdf.setFontSize(10)
  pdf.setTextColor('#333')
  pdf.setFont('helvetica', 'bold')
  pdf.text(inv.customer.name, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  const custLines: string[] = []
  if (inv.customer.address) custLines.push(inv.customer.address)
  if (inv.customer.phone) custLines.push(inv.customer.phone)
  if (inv.customer.email) custLines.push(inv.customer.email)
  if (inv.customer.cr) custLines.push(`CR: ${inv.customer.cr}`)
  if (custLines.length > 0) {
    pdf.setFontSize(8)
    pdf.setTextColor('#666')
    pdf.text(custLines.join(' | '), MARGIN, y + 9, { maxWidth: W })
  }

  y += 14

  const col1 = MARGIN
  const col2 = MARGIN + 8
  const col3 = MARGIN + W - 65
  const col4 = MARGIN + W - 35
  const col5 = MARGIN + W

  y = addPageIfNeeded(pdf, y + 18)
  y = tableHeader(pdf, y, [
    { label: '#', x: col1, align: 'left' },
    { label: 'Description', x: col2, align: 'left' },
    { label: 'Qty', x: col3, align: 'right' },
    { label: 'Price', x: col4, align: 'right' },
    { label: 'Amount', x: col5, align: 'right' },
  ], pc)

  inv.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    y = tableRow(pdf, y, [
      { text: String(i + 1), x: col1, align: 'left' },
      { text: item.desc, x: col2, align: 'left' },
      { text: String(item.qty), x: col3, align: 'right' },
      { text: fmt(item.price, dp), x: col4, align: 'right' },
      { text: fmt(item.amount, dp), x: col5, align: 'right' },
    ], dp, i % 2 === 1)
  })

  y += 3

  y = addPageIfNeeded(pdf, y + 30)

  const sumX = MARGIN + W - 60
  pdf.setFontSize(8.5)
  pdf.setTextColor('#333')

  pdf.text('Subtotal', sumX, y)
  pdf.text(fmt(inv.subtotal, dp), MARGIN + W, y, { align: 'right' })
  y += 5

  if (inv.vatPct > 0) {
    pdf.text(`VAT (${inv.vatPct}%)`, sumX, y)
    pdf.text(fmt(inv.vatAmt, dp), MARGIN + W, y, { align: 'right' })
    y += 5
  }

  if (inv.discount > 0) {
    pdf.text('Discount', sumX, y)
    pdf.text(`-${fmt(inv.discount, dp)}`, MARGIN + W, y, { align: 'right' })
    y += 5
  }

  pdf.setDrawColor(pc)
  pdf.setLineWidth(0.5)
  pdf.line(sumX, y, MARGIN + W, y)
  y += 3

  pdf.setFontSize(12)
  pdf.setTextColor(pc)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Total:', sumX, y)
  pdf.text(`${cur.symbol}${fmt(inv.grand, dp)}`, MARGIN + W, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal')

  y += 4

  if (words) {
    pdf.setFontSize(7)
    pdf.setTextColor('#999')
    pdf.text(words, sumX, y, { maxWidth: 60 })
  }

  y += 8

  if (inv.notes) {
    y = addPageIfNeeded(pdf, y + 8)
    pdf.setDrawColor('#ddd')
    pdf.setLineWidth(0.3)
    pdf.line(MARGIN, y, MARGIN + W, y)
    y += 3
    pdf.setFontSize(8)
    pdf.setTextColor('#999')
    pdf.text('Notes:', MARGIN, y)
    pdf.setTextColor('#666')
    pdf.text(inv.notes, MARGIN, y + 4, { maxWidth: W })
    y += 8
  }

  if (inv.payMethod) {
    y = addPageIfNeeded(pdf, y + 8)
    const dets: string[] = [`Payment: ${inv.payMethod}`]
    if (inv.payDetails) dets.push(inv.payDetails)
    if (inv.bankName) dets.push(inv.bankName)
    pdf.setFontSize(8)
    pdf.setTextColor('#666')
    pdf.text(dets.join(' | '), MARGIN, y, { maxWidth: W })
  }

  footer(pdf, co, pc)
  pdf.save(`${inv.invNo || 'invoice'}.pdf`)
}

// ─── QUOTATION PDF ─────────────────────────────────────────────────────────

export async function createQuotationPDF(quot: Quotation, co: Company): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const cur = co.currency
  const dp = getDp(cur.subPer)
  const pc = co.pcolor || '#D97706'
  let y = TOP

  pdf.setFont('helvetica', 'normal')
  const words = quot.grand > 0 ? num2words(quot.grand, cur) + ' only' : ''

  y = header(pdf, co, pc, y)

  pdf.setFontSize(12)
  pdf.setTextColor(pc)
  pdf.text('QUOTATION', MARGIN, y)
  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text(`${quot.quotNo} | ${quot.date}${quot.validUntil ? ` | Valid until: ${quot.validUntil}` : ''}`, MARGIN, y + 4)

  y += 10

  pdf.setFontSize(8)
  pdf.setTextColor('#999')
  pdf.text('TO', MARGIN, y)
  pdf.setFontSize(10)
  pdf.setTextColor('#333')
  pdf.setFont('helvetica', 'bold')
  pdf.text(quot.customer.name, MARGIN, y + 4)
  pdf.setFont('helvetica', 'normal')
  const custLines: string[] = []
  if (quot.customer.address) custLines.push(quot.customer.address)
  if (quot.customer.phone) custLines.push(quot.customer.phone)
  if (quot.customer.email) custLines.push(quot.customer.email)
  if (quot.customer.cr) custLines.push(`CR: ${quot.customer.cr}`)
  if (custLines.length > 0) {
    pdf.setFontSize(8)
    pdf.setTextColor('#666')
    pdf.text(custLines.join(' | '), MARGIN, y + 9, { maxWidth: W })
  }

  y += 14

  const col1 = MARGIN
  const col2 = MARGIN + 8
  const col3 = MARGIN + W - 65
  const col4 = MARGIN + W - 35
  const col5 = MARGIN + W

  y = addPageIfNeeded(pdf, y + 18)
  y = tableHeader(pdf, y, [
    { label: '#', x: col1, align: 'left' },
    { label: 'Description', x: col2, align: 'left' },
    { label: 'Qty', x: col3, align: 'right' },
    { label: 'Price', x: col4, align: 'right' },
    { label: 'Amount', x: col5, align: 'right' },
  ], pc)

  quot.items.forEach((item, i) => {
    y = addPageIfNeeded(pdf, y + 7)
    y = tableRow(pdf, y, [
      { text: String(i + 1), x: col1, align: 'left' },
      { text: item.desc, x: col2, align: 'left' },
      { text: String(item.qty), x: col3, align: 'right' },
      { text: fmt(item.price, dp), x: col4, align: 'right' },
      { text: fmt(item.amount, dp), x: col5, align: 'right' },
    ], dp, i % 2 === 1)
  })

  y += 3

  y = addPageIfNeeded(pdf, y + 30)

  const sumX = MARGIN + W - 60
  pdf.setFontSize(8.5)
  pdf.setTextColor('#333')

  pdf.text('Subtotal', sumX, y)
  pdf.text(fmt(quot.subtotal, dp), MARGIN + W, y, { align: 'right' })
  y += 5

  if (quot.vatPct > 0) {
    pdf.text(`VAT (${quot.vatPct}%)`, sumX, y)
    pdf.text(fmt(quot.vatAmt, dp), MARGIN + W, y, { align: 'right' })
    y += 5
  }

  if (quot.discount > 0) {
    pdf.text('Discount', sumX, y)
    pdf.text(`-${fmt(quot.discount, dp)}`, MARGIN + W, y, { align: 'right' })
    y += 5
  }

  pdf.setDrawColor(pc)
  pdf.setLineWidth(0.5)
  pdf.line(sumX, y, MARGIN + W, y)
  y += 3

  pdf.setFontSize(12)
  pdf.setTextColor(pc)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Total:', sumX, y)
  pdf.text(`${cur.symbol}${fmt(quot.grand, dp)}`, MARGIN + W, y, { align: 'right' })
  pdf.setFont('helvetica', 'normal')

  y += 4

  if (words) {
    pdf.setFontSize(7)
    pdf.setTextColor('#999')
    pdf.text(words, sumX, y, { maxWidth: 60 })
  }

  y += 8

  if (quot.notes) {
    y = addPageIfNeeded(pdf, y + 8)
    pdf.setDrawColor('#ddd')
    pdf.setLineWidth(0.3)
    pdf.line(MARGIN, y, MARGIN + W, y)
    y += 3
    pdf.setFontSize(8)
    pdf.setTextColor('#999')
    pdf.text('Notes:', MARGIN, y)
    pdf.setTextColor('#666')
    pdf.text(quot.notes, MARGIN, y + 4, { maxWidth: W })
    y += 8
  }

  if (quot.terms) {
    y = addPageIfNeeded(pdf, y + 8)
    pdf.setDrawColor('#ddd')
    pdf.setLineWidth(0.3)
    pdf.line(MARGIN, y, MARGIN + W, y)
    y += 3
    pdf.setFontSize(8)
    pdf.setTextColor('#999')
    pdf.text('Terms:', MARGIN, y)
    pdf.setTextColor('#666')
    pdf.text(quot.terms, MARGIN, y + 4, { maxWidth: W })
  }

  footer(pdf, co, pc)
  pdf.save(`${quot.quotNo || 'quotation'}.pdf`)
}

// ─── LEGACY (image-based) and PRINT helpers ─────────────────────────────────

const A4_W = 794
const A4_H = 1123

import html2canvas from 'html2canvas'

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
    const pdfW = 210
    const pdfH = 297

    const totalH = content.scrollHeight
    const pageCount = Math.max(1, Math.ceil(totalH / A4_H))

    for (let i = 0; i < pageCount; i++) {
      content.style.marginTop = `${-i * A4_H}px`

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
    }

    pdf.save(filename + '.pdf')
  } catch (err) {
    throw err
  } finally {
    document.body.removeChild(pageEl)
  }
}

export async function printHTML(html: string): Promise<void> {
  const area = document.getElementById('printArea') || createPrintArea()
  area.innerHTML = html
  area.style.display = 'block'
  await waitForImages(area)
  window.print()
  area.style.display = ''
}

export function downloadText(html: string, filename: string): void {
  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.textContent || ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const blob = new Blob([cleaned], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename + '.txt'
  a.click()
  URL.revokeObjectURL(url)
}

function createPrintArea(): HTMLElement {
  const el = document.createElement('div')
  el.id = 'printArea'
  el.className = 'print-only'
  document.body.appendChild(el)
  return el
}

function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = container.querySelectorAll('img')
  if (imgs.length === 0) return Promise.resolve()
  const promises = Array.from(imgs).map((img) =>
    new Promise<void>((resolve) => {
      if (img.complete) resolve()
      else { img.onload = () => resolve(); img.onerror = () => resolve() }
    })
  )
  return Promise.all(promises).then(() => {})
}
