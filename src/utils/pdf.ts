import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { Company } from '@/types/company'
import { buildInvoiceHTML, buildReceiptHTML, buildQuotationHTML } from '@/templates'
import { htmlToPDF, htmlToPDFBlob } from '@/templates/html2pdf'

export async function createInvoicePDF(inv: Invoice, co: Company): Promise<void> {
  const html = buildInvoiceHTML(inv, co)
  if (!html) return
  await htmlToPDF(html, inv.invNo || 'invoice')
}

export async function createInvoicePDFBlob(inv: Invoice, co: Company): Promise<Blob> {
  const html = buildInvoiceHTML(inv, co)
  if (!html) return new Blob()
  return htmlToPDFBlob(html)
}

export async function createReceiptPDF(rec: Receipt, co: Company): Promise<void> {
  const html = buildReceiptHTML(rec, co)
  if (!html) return
  await htmlToPDF(html, rec.recNo || 'receipt')
}

export async function createQuotationPDF(quot: Quotation, co: Company): Promise<void> {
  const html = buildQuotationHTML(quot, co)
  if (!html) return
  await htmlToPDF(html, quot.quotNo || 'quotation')
}

export async function capturePDF(html: string, filename: string): Promise<void> {
  await htmlToPDF(html, filename)
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
