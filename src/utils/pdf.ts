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
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;height:1123px;border:none;overflow:hidden;'
  document.body.appendChild(iframe)
  iframe.srcdoc = html
  await new Promise<void>((resolve) => { iframe.onload = () => resolve() })

  const doc = iframe.contentDocument
  if (doc) {
    const style = doc.createElement('style')
    style.textContent = 'html,body{margin:0!important;padding:0!important;background:#fff!important;}@media print{html,body{margin:0!important;padding:0!important;background:#fff!important;}}'
    doc.head.appendChild(style)
  }

  iframe.contentWindow!.print()
  document.body.removeChild(iframe)
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
