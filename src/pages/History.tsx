import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { Card, CardHeader, Button } from '@/components/ui'
import { Svg } from '@/icons'
import { invStatus } from '@/utils'
import { buildInvoiceHTML, buildReceiptHTML, buildQuotationHTML } from '@/templates'
import { capturePDF, printHTML, downloadText } from '@/utils/pdf'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'

type Tab = 'inv' | 'rec' | 'quot'

export default function History() {
  const navigate = useNavigate()
  const { state, deleteInvoice, deleteReceipt, deleteQuotation, markInvoicePaid, setEditing } = useApp()
  const { showToast, showPDFOverlay, hidePDFOverlay } = useUI()
  const co = state.companies.find((c) => c.id === state.activeId)
  const [tab, setTab] = useState<Tab>('inv')
  const [search, setSearch] = useState('')

  const invoices = state.invoices
    .filter((i) => i.companyId === co?.id)
    .filter((i) => !search || i.invNo.toLowerCase().includes(search.toLowerCase()) || i.customer.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt)

  const receipts = state.receipts
    .filter((r) => r.companyId === co?.id)
    .filter((r) => !search || r.recNo.toLowerCase().includes(search.toLowerCase()) || r.receivedFrom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt)

  const quotations = state.quotations
    .filter((q) => q.companyId === co?.id)
    .filter((q) => !search || q.quotNo.toLowerCase().includes(search.toLowerCase()) || q.customer.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt)

  const handleEdit = (type: Tab, id: string) => {
    setEditing({ type, id })
    navigate('/' + (type === 'quot' ? 'quotation' : type))
  }

  const handleDelete = async (type: Tab, id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      if (type === 'inv') await deleteInvoice(id)
      else if (type === 'rec') await deleteReceipt(id)
      else await deleteQuotation(id)
      showToast('Deleted.')
    } catch { showToast('Failed to delete.', 'err') }
  }

  const handlePaid = async (id: string) => {
    if (!confirm('Toggle paid status?')) return
    try {
      await markInvoicePaid(id)
      showToast('Status updated.')
    } catch { showToast('Failed to update.', 'err') }
  }

  const handlePrint = (type: Tab, doc: Invoice | Receipt | Quotation) => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = type === 'inv' ? buildInvoiceHTML(doc as Invoice, co)
      : type === 'rec' ? buildReceiptHTML(doc as Receipt, co)
      : buildQuotationHTML(doc as Quotation, co)
    if (!html) { showToast('Cannot print.', 'err'); return }
    printHTML(html)
  }

  const handlePDF = async (type: Tab, doc: Invoice | Receipt | Quotation) => {
    if (!co) { showToast('No active company.', 'err'); return }
    showPDFOverlay()
    try {
      const html = type === 'inv' ? buildInvoiceHTML(doc as Invoice, co)
        : type === 'rec' ? buildReceiptHTML(doc as Receipt, co)
        : buildQuotationHTML(doc as Quotation, co)
      if (!html) { showToast('Cannot generate PDF.', 'err'); hidePDFOverlay(); return }
      const name = type === 'inv' ? (doc as Invoice).invNo
        : type === 'rec' ? (doc as Receipt).recNo
        : (doc as Quotation).quotNo
      await capturePDF(html, name || 'document')
    } catch { showToast('PDF generation failed.', 'err') }
    hidePDFOverlay()
  }

  const handleText = (type: Tab, doc: Invoice | Receipt | Quotation) => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = type === 'inv' ? buildInvoiceHTML(doc as Invoice, co)
      : type === 'rec' ? buildReceiptHTML(doc as Receipt, co)
      : buildQuotationHTML(doc as Quotation, co)
    if (!html) { showToast('Cannot export text.', 'err'); return }
    const name = type === 'inv' ? (doc as Invoice).invNo
      : type === 'rec' ? (doc as Receipt).recNo
      : (doc as Quotation).quotNo
    downloadText(html, name || 'document')
  }

  const count = tab === 'inv' ? invoices.length : tab === 'rec' ? receipts.length : quotations.length

  const tabBtn = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs rounded-full font-medium cursor-pointer transition-colors ${tab === t ? 'bg-[var(--color-primary)] text-white' : 'border border-[var(--color-border)] hover:bg-[var(--color-input-bg)]'}`}>
      {label}
    </button>
  )

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">Documents</h1>
        <p className="text-sm text-[var(--color-text2)]">View and manage saved documents.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Saved Documents</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">{count}</span>
        </CardHeader>

        <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {tabBtn('inv', 'Invoices')}
            {tabBtn('rec', 'Receipts')}
            {tabBtn('quot', 'Quotations')}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Svg name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text3)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === 'inv' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text2)] text-xs">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text3)] text-sm">No invoices yet.</td></tr>
                )}
                {invoices.map((inv) => {
                  const status = invStatus(inv)
                  return (
                    <tr key={inv.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-input-bg)]/50">
                      <td className="py-2.5 px-4 font-medium">{inv.invNo}</td>
                      <td className="py-2.5 px-4 text-[var(--color-text2)]">{inv.date}</td>
                      <td className="py-2.5 px-4">{inv.customer.name}</td>
                      <td className="py-2.5 px-4 text-right font-medium">{co?.currency.symbol}{inv.grand.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium
                          ${status.cls === 'green' ? 'bg-green-bg text-green-dark' : ''}
                          ${status.cls === 'red' ? 'bg-red-bg text-red' : ''}
                          ${status.cls === 'amber' ? 'bg-amber-bg text-amber' : ''}
                        `}>{status.lbl}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex gap-1 justify-end">
                          {!inv.paid && (
                            <button onClick={() => handlePaid(inv.id)} className="p-1.5 rounded-lg hover:bg-green-bg text-green cursor-pointer" title="Mark Paid">
                              <Svg name="check" />
                            </button>
                          )}
                          <button onClick={() => handlePrint('inv', inv)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Print">
                            <Svg name="print" />
                          </button>
                          <button onClick={() => handlePDF('inv', inv)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Download PDF">
                            <Svg name="download" />
                          </button>
                          <button onClick={() => handleText('inv', inv)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Export Text">
                            <Svg name="file" />
                          </button>
                          <button onClick={() => handleEdit('inv', inv.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Edit">
                            <Svg name="edit" />
                          </button>
                          <button onClick={() => handleDelete('inv', inv.id)} className="p-1.5 rounded-lg hover:bg-red-bg text-red cursor-pointer" title="Delete">
                            <Svg name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : tab === 'rec' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text2)] text-xs">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Received From</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text3)] text-sm">No receipts yet.</td></tr>
                )}
                {receipts.map((rec) => (
                  <tr key={rec.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-input-bg)]/50">
                    <td className="py-2.5 px-4 font-medium">{rec.recNo}</td>
                    <td className="py-2.5 px-4 text-[var(--color-text2)]">{rec.date}</td>
                    <td className="py-2.5 px-4">{rec.receivedFrom}</td>
                    <td className="py-2.5 px-4 text-right font-medium">{co?.currency.symbol}{rec.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handlePrint('rec', rec)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Print">
                          <Svg name="print" />
                        </button>
                        <button onClick={() => handlePDF('rec', rec)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Download PDF">
                          <Svg name="download" />
                        </button>
                        <button onClick={() => handleText('rec', rec)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Export Text">
                          <Svg name="file" />
                        </button>
                        <button onClick={() => handleEdit('rec', rec.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Edit">
                          <Svg name="edit" />
                        </button>
                        <button onClick={() => handleDelete('rec', rec.id)} className="p-1.5 rounded-lg hover:bg-red-bg text-red cursor-pointer" title="Delete">
                          <Svg name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text2)] text-xs">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text3)] text-sm">No quotations yet.</td></tr>
                )}
                {quotations.map((q) => (
                  <tr key={q.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-input-bg)]/50">
                    <td className="py-2.5 px-4 font-medium">{q.quotNo}</td>
                    <td className="py-2.5 px-4 text-[var(--color-text2)]">{q.date}</td>
                    <td className="py-2.5 px-4">{q.customer.name}</td>
                    <td className="py-2.5 px-4 text-right font-medium">{co?.currency.symbol}{q.grand.toFixed(2)}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handlePrint('quot', q)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Print">
                          <Svg name="print" />
                        </button>
                        <button onClick={() => handlePDF('quot', q)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Download PDF">
                          <Svg name="download" />
                        </button>
                        <button onClick={() => handleText('quot', q)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Export Text">
                          <Svg name="file" />
                        </button>
                        <button onClick={() => handleEdit('quot', q.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-input-bg)] text-[var(--color-text2)] cursor-pointer" title="Edit">
                          <Svg name="edit" />
                        </button>
                        <button onClick={() => handleDelete('quot', q.id)} className="p-1.5 rounded-lg hover:bg-red-bg text-red cursor-pointer" title="Delete">
                          <Svg name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
