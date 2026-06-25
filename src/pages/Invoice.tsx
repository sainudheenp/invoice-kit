import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Card, CardHeader, Button } from '@/components/ui'
import { LineItemsTable } from '@/components/invoice/LineItemsTable'
import { InvoiceSummary } from '@/components/invoice/InvoiceSummary'
import { num2words, dp as getDp } from '@/utils'
import { buildInvoiceHTML } from '@/templates'
import { createInvoicePDF, printHTML, downloadText } from '@/utils/pdf'
import type { LineItem, Customer, Invoice } from '@/types/invoice'

interface InvoiceFormState {
  invNo: string
  date: string
  dueDate: string
  custName: string
  custAddr: string
  custPhone: string
  custCr: string
  custEmail: string
  items: LineItem[]
  vatPct: number
  discount: number
  notes: string
  payMethod: string
  chequeNo: string
  bankName: string
}

const emptyForm = (): InvoiceFormState => ({
  invNo: '',
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  custName: '', custAddr: '', custPhone: '', custCr: '', custEmail: '',
  items: [{ desc: '', qty: 1, price: 0, amount: 0 }, { desc: '', qty: 1, price: 0, amount: 0 }],
  vatPct: 0, discount: 0,
  notes: '', payMethod: 'Cash', chequeNo: '', bankName: '',
})

export default function Invoice() {
  const navigate = useNavigate()
  const { state, getCo, saveCompany, createInvoice, setEditing, deleteInvoice } = useApp()
  const { markDirty, markClean, showToast, closeSidebar, showPDFOverlay, hidePDFOverlay, showPreview } = useUI()
  const { customers, saveCustomer } = useSavedCustomers()
  const co = getCo()
  const [form, setForm] = useState<InvoiceFormState>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  // restore editing doc
  useEffect(() => {
    if (!state.editingDoc || state.editingDoc.type !== 'inv') return
    const inv = state.invoices.find((i) => i.id === state.editingDoc!.id)
    if (!inv) return
    setIsEditing(true)
    setForm({
      invNo: inv.invNo,
      date: inv.date,
      dueDate: inv.dueDate,
      custName: inv.customer.name,
      custAddr: inv.customer.address,
      custPhone: inv.customer.phone,
      custCr: inv.customer.cr,
      custEmail: inv.customer.email,
      items: inv.items.length > 0 ? inv.items : [{ desc: '', qty: 1, price: 0, amount: 0 }],
      vatPct: inv.vatPct,
      discount: inv.discount,
      notes: inv.notes,
      payMethod: inv.payMethod || 'Cash',
      chequeNo: inv.payDetails || '',
      bankName: inv.bankName || '',
    })
    markClean()
  }, [state.editingDoc])

  // set defaults when company loads
  useEffect(() => {
    if (!co || isEditing) return
    setForm((f) => ({
      ...f,
      invNo: co.invPref + co.invNext,
      vatPct: co.vatPct,
      notes: co.invNotes,
    }))
  }, [co?.id, isEditing])

  const set = useCallback((field: keyof InvoiceFormState, value: string | number | LineItem[]) => {
    setForm((f) => ({ ...f, [field]: value }))
    markDirty()
  }, [markDirty])

  const subtotal = form.items.reduce((s, i) => s + i.amount, 0)
  const vatAmt = form.vatPct > 0 ? subtotal * (form.vatPct / 100) : 0
  const grand = subtotal - form.discount + vatAmt
  const words = grand > 0 && cur ? num2words(grand, cur) : ''

  const customer: Customer = {
    name: form.custName, address: form.custAddr, phone: form.custPhone,
    cr: form.custCr, email: form.custEmail,
  }

  const handleSave = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    if (!form.invNo.trim()) { showToast('Invoice number is required.', 'err'); return }
    if (!form.custName.trim()) { showToast('Customer name is required.', 'err'); return }
    if (form.dueDate && form.date && form.dueDate < form.date) { showToast('Due date must be on or after the invoice date.', 'err'); return }
    const validItems = form.items.filter((i) => i.desc.trim() && i.qty > 0 && i.price > 0)
    if (validItems.length === 0) { showToast('At least one line item with description, quantity, and price is required.', 'err'); return }

    // duplicate check (skip when editing same doc)
    const editingId = state.editingDoc?.type === 'inv' ? state.editingDoc.id : null
    const dupe = state.invoices.find(
      (i) => i.invNo === form.invNo && i.companyId === co.id && i.id !== editingId
    )
    if (dupe) { showToast('Invoice number already exists.', 'err'); return }

    try {
      await createInvoice(co, {
        invNo: form.invNo,
        date: form.date,
        dueDate: form.dueDate,
        paid: false,
        customer,
        items: form.items,
        subtotal, vatPct: form.vatPct, vatAmt, discount: form.discount, grand,
        notes: form.notes,
        payMethod: form.payMethod,
        payDetails: form.chequeNo,
        bankName: form.bankName,
      })

      // increment next number if new
      if (!editingId) {
        const updated = { ...co, invNext: co.invNext + 1, updatedAt: Date.now() }
        await saveCompany(updated)
      }

      saveCustomer(form.custName)
      setEditing(null)
      setIsEditing(false)
      setForm(emptyForm())
      markClean()
      showToast(editingId ? 'Invoice updated!' : 'Invoice saved!')
    } catch {
      showToast('Failed to save invoice.', 'err')
    }
  }

  useKeyboardShortcuts({ s: handleSave, enter: handleSave })

  const buildTempInvoice = (): Invoice => ({
    id: '',
    companyId: co?.id || '',
    invNo: form.invNo,
    date: form.date,
    dueDate: form.dueDate,
    paid: false,
    customer,
    items: form.items,
    subtotal, vatPct: form.vatPct, vatAmt, discount: form.discount, grand,
    notes: form.notes,
    payMethod: form.payMethod,
    payDetails: form.chequeNo,
    bankName: form.bankName,
    createdAt: Date.now(),
  })

  const handlePrint = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildInvoiceHTML(buildTempInvoice(), co)
    if (!html) { showToast('Cannot print empty invoice.', 'err'); return }
    await printHTML(html)
  }

  const handlePDF = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    showPDFOverlay()
    try {
      await createInvoicePDF(buildTempInvoice(), co)
    } catch { showToast('PDF generation failed.', 'err') }
    hidePDFOverlay()
  }

  const handlePreview = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildInvoiceHTML(buildTempInvoice(), co)
    if (!html) { showToast('Nothing to preview.', 'err'); return }
    showPreview(html)
  }

  const handleText = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildInvoiceHTML(buildTempInvoice(), co)
    if (!html) { showToast('Cannot export text.', 'err'); return }
    downloadText(html, form.invNo || 'invoice')
  }

  const showCheque = form.payMethod === 'Cheque'
  const showBank = form.payMethod === 'Cheque' || form.payMethod === 'Bank Transfer'

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h1>
        <p className="text-sm text-[var(--color-text2)]">Create a tax invoice.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Invoice Details</h2>
              {cur && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">{cur.code} {cur.symbol}</span>}
            </CardHeader>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Invoice No. <span className="text-red">*</span></label>
                  <input value={form.invNo} onChange={(e) => set('invNo', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Date</label>
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Customer</h2></CardHeader>
            <div className="p-5 space-y-3">
              <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Customer Name <span className="text-red">*</span></label>
                <input value={form.custName} onChange={(e) => set('custName', e.target.value)} list="custNameList" className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                <datalist id="custNameList">
                  {customers.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Address</label>
                  <input value={form.custAddr} onChange={(e) => set('custAddr', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Phone</label>
                  <input value={form.custPhone} onChange={(e) => set('custPhone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">C.R.</label>
                  <input value={form.custCr} onChange={(e) => set('custCr', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Email</label>
                  <input value={form.custEmail} onChange={(e) => set('custEmail', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Line Items</h2></CardHeader>
            <div className="p-5">
              <LineItemsTable items={form.items} onChange={(items) => set('items', items)} dp={decimals} />
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Summary</h2></CardHeader>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Subtotal</label>
                  <input readOnly value={subtotal.toFixed(decimals)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">VAT %</label>
                  <input type="number" min="0" max="100" step="0.01" value={form.vatPct} onChange={(e) => set('vatPct', Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">VAT Amount</label>
                  <input readOnly value={vatAmt.toFixed(decimals)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Discount</label>
                  <input type="number" min="0" step="0.001" value={form.discount} onChange={(e) => set('discount', Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Grand Total</label>
                  <input readOnly value={grand.toFixed(decimals)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Amount in Words</label>
                <input readOnly value={words} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm" />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Additional</h2></CardHeader>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Payment Method</label>
                <select value={form.payMethod} onChange={(e) => set('payMethod', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]">
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              {showCheque && (
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Cheque No.</label>
                  <input value={form.chequeNo} onChange={(e) => set('chequeNo', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              )}
              {showBank && (
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Bank Name</label>
                  <input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <InvoiceSummary
            subtotal={subtotal}
            vatPct={form.vatPct}
            vatAmt={vatAmt}
            discount={form.discount}
            grand={grand}
            words={words}
            dp={decimals}
            curSymbol={cur?.symbol || ''}
          />

          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} className="justify-center w-full">
              {isEditing ? 'Update Invoice' : 'Save Invoice'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview} className="justify-center">Preview</Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="justify-center">Print</Button>
              <Button variant="outline" size="sm" onClick={handlePDF} className="justify-center">PDF</Button>
              <Button variant="outline" size="sm" onClick={handleText} className="justify-center">Text</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
