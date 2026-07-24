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

export function customersToCSV(customers: Array<{ name: string; address?: string; phone?: string; cr?: string; email?: string }>): string {
  const header = toCSVRow(['Name', 'Email', 'Phone', 'Address', 'CR Number'])
  const rows = customers.map((c) =>
    toCSVRow([c.name || '', c.email || '', c.phone || '', c.address || '', c.cr || ''])
  )
  return [header, ...rows].join('\n')
}

export function productsToCSV(products: Array<{ name: string; desc?: string; price: number }>, symbol = ''): string {
  const header = toCSVRow(['Name', 'Description', 'Price'])
  const rows = products.map((p) =>
    toCSVRow([p.name || '', p.desc || '', p.price ? `${symbol}${p.price.toFixed(2)}` : '0.00'])
  )
  return [header, ...rows].join('\n')
}

export function parseCSVLines(text: string): string[][] {
  const lines: string[][] = []
  let row: string[] = []
  let inQuotes = false
  let current = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim())
      current = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      row.push(current.trim())
      if (row.some((cell) => cell.length > 0)) {
        lines.push(row)
      }
      row = []
      current = ''
    } else {
      current += char
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim())
    if (row.some((cell) => cell.length > 0)) {
      lines.push(row)
    }
  }

  return lines
}

export function parseCustomersCsv(csvContent: string, companyId: string) {
  const rows = parseCSVLines(csvContent)
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.toLowerCase())
  const nameIdx = header.findIndex((h) => h.includes('name'))
  const emailIdx = header.findIndex((h) => h.includes('email'))
  const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('tel'))
  const addrIdx = header.findIndex((h) => h.includes('address') || h.includes('loc'))
  const crIdx = header.findIndex((h) => h.includes('cr') || h.includes('vat') || h.includes('reg'))

  const now = Date.now()
  const results = []

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const name = nameIdx >= 0 ? r[nameIdx] : r[0]
    if (!name) continue

    results.push({
      id: `cust_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      companyId,
      name,
      email: emailIdx >= 0 ? r[emailIdx] || '' : '',
      phone: phoneIdx >= 0 ? r[phoneIdx] || '' : '',
      address: addrIdx >= 0 ? r[addrIdx] || '' : '',
      cr: crIdx >= 0 ? r[crIdx] || '' : '',
      createdAt: now,
    })
  }

  return results
}

export function parseProductsCsv(csvContent: string, companyId: string) {
  const rows = parseCSVLines(csvContent)
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.toLowerCase())
  const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('title') || h.includes('item'))
  const descIdx = header.findIndex((h) => h.includes('desc') || h.includes('detail'))
  const priceIdx = header.findIndex((h) => h.includes('price') || h.includes('amount') || h.includes('rate') || h.includes('cost'))

  const now = Date.now()
  const results = []

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const name = nameIdx >= 0 ? r[nameIdx] : r[0]
    if (!name) continue

    const priceRaw = priceIdx >= 0 ? r[priceIdx]?.replace(/[^0-9.]/g, '') : '0'
    const price = parseFloat(priceRaw) || 0

    results.push({
      id: `prod_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      companyId,
      name,
      desc: descIdx >= 0 ? r[descIdx] || '' : '',
      price,
      createdAt: now,
    })
  }

  return results
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
