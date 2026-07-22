import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"'
  }
  return val
}

function toCSVRow(fields: (string | number)[]): string {
  return fields.map((f) => escapeCSV(String(f))).join(',')
}

export function invoicesToCSV(invoices: Invoice[], symbol: string): string {
  const header = toCSVRow(['Invoice #', 'Date', 'Customer', 'Subtotal', 'Tax', 'Discount', 'Total', 'Status'])
  const rows = invoices.map((inv) =>
    toCSVRow([
      inv.invNo,
      inv.date,
      inv.customer.name,
      `${symbol}${inv.subtotal.toFixed(2)}`,
      `${symbol}${inv.vatAmt.toFixed(2)}`,
      `${symbol}${inv.discount.toFixed(2)}`,
      `${symbol}${inv.grand.toFixed(2)}`,
      inv.paid ? 'Paid' : 'Unpaid',
    ])
  )
  return [header, ...rows].join('\n')
}

export function receiptsToCSV(receipts: Receipt[], symbol: string): string {
  const header = toCSVRow(['Receipt #', 'Date', 'Received From', 'Amount', 'Payment Method'])
  const rows = receipts.map((rec) =>
    toCSVRow([
      rec.recNo,
      rec.date,
      rec.receivedFrom,
      `${symbol}${rec.amount.toFixed(2)}`,
      rec.payMethod,
    ])
  )
  return [header, ...rows].join('\n')
}

export function quotationsToCSV(quotations: Quotation[], symbol: string): string {
  const header = toCSVRow(['Quote #', 'Date', 'Customer', 'Valid Until', 'Total'])
  const rows = quotations.map((q) =>
    toCSVRow([
      q.quotNo,
      q.date,
      q.customer.name,
      q.validUntil,
      `${symbol}${q.grand.toFixed(2)}`,
    ])
  )
  return [header, ...rows].join('\n')
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
