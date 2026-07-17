import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { Company } from '@/types/company'
import { buildInvoiceHTML, buildReceiptHTML, buildQuotationHTML } from '@/templates'
import { buildInvoicePDF, buildReceiptPDF, buildQuotationPDF } from '@/templates/pdfEngine'
import { transformInvDataExport, transformRecDataExport, transformQuotDataExport } from '@/templates/dataTransform'

// ─── PDF Download (jsPDF programmatic — crisp, design-faithful) ───────────────

export async function createInvoicePDF(inv: Invoice, co: Company): Promise<void> {
  const data = transformInvDataExport(inv, co)
  if (!data) return
  await buildInvoicePDF(data, inv.invNo || 'invoice')
}

export async function createReceiptPDF(rec: Receipt, co: Company): Promise<void> {
  const data = transformRecDataExport(rec, co)
  if (!data) return
  await buildReceiptPDF(data, rec.recNo || 'receipt')
}

export async function createQuotationPDF(quot: Quotation, co: Company): Promise<void> {
  const data = transformQuotDataExport(quot, co)
  if (!data) return
  await buildQuotationPDF(data, quot.quotNo || 'quotation')
}

// ─── Blob versions (for email/share — still uses jsPDF) ──────────────────────

export async function createInvoicePDFBlob(inv: Invoice, co: Company): Promise<Blob> {
  const { htmlToPDFBlob } = await import('@/templates/html2pdf')
  const html = buildInvoiceHTML(inv, co)
  if (!html) return new Blob()
  return htmlToPDFBlob(html)
}

export async function createReceiptPDFBlob(rec: Receipt, co: Company): Promise<Blob> {
  const { htmlToPDFBlob } = await import('@/templates/html2pdf')
  const html = buildReceiptHTML(rec, co)
  if (!html) return new Blob()
  return htmlToPDFBlob(html)
}

export async function createQuotationPDFBlob(quot: Quotation, co: Company): Promise<Blob> {
  const { htmlToPDFBlob } = await import('@/templates/html2pdf')
  const html = buildQuotationHTML(quot, co)
  if (!html) return new Blob()
  return htmlToPDFBlob(html)
}

// ─── Print ────────────────────────────────────────────────────────────────────

export function printHTML(html: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;height:1123px;border:none;overflow:hidden;'
  document.body.appendChild(iframe)
  iframe.srcdoc = html
  iframe.onload = () => {
    const doc = iframe.contentDocument
    if (doc) {
      const style = doc.createElement('style')
      style.textContent = 'html,body{margin:0!important;padding:0!important;background:#fff!important;}@media print{html,body{margin:0!important;padding:0!important;background:#fff!important;}}'
      doc.head.appendChild(style)
    }
    iframe.contentWindow!.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }
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
