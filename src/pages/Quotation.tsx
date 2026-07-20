import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Card, CardHeader, Button } from '@/components/ui'
import { LineItemsTable } from '@/components/invoice/LineItemsTable'
import { QuotationSummary } from '@/components/quotation/QuotationSummary'
import { num2words, dp as getDp } from '@/utils'
import { buildQuotationHTML } from '@/templates'
import { printHTML, htmlToPDF, downloadText } from '@/utils/pdf'
import type { LineItem, Customer } from '@/types/invoice'
import type { Quotation } from '@/types/quotation'

interface QuotationFormState {
  quotNo: string
  date: string
  validUntil: string
  custName: string
  custAddr: string
  custPhone: string
  custCr: string
  custEmail: string
  items: LineItem[]
  vatPct: number
  discount: number
  notes: string
  terms: string
}

const emptyForm = (): QuotationFormState => ({
  quotNo: '',
  date: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  custName: '', custAddr: '', custPhone: '', custCr: '', custEmail: '',
  items: [{ desc: '', qty: 1, price: 0, amount: 0 }, { desc: '', qty: 1, price: 0, amount: 0 }],
  vatPct: 0, discount: 0,
  notes: '', terms: '',
})

export default function QuotationPage() {
  const { state, getCo, saveCompany, createQuotation, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPreview } = useUI()
  const { customers, saveCustomer } = useSavedCustomers()
  const co = getCo()
  const [form, setForm] = useState<QuotationFormState>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  useEffect(() => {
    if (!state.editingDoc || state.editingDoc.type !== 'quot') return
    const quot = state.quotations.find((q) => q.id === state.editingDoc!.id)
    if (!quot) return
    setIsEditing(true)
    setForm({
      quotNo: quot.quotNo,
      date: quot.date,
      validUntil: quot.validUntil,
      custName: quot.customer.name,
      custAddr: quot.customer.address,
      custPhone: quot.customer.phone,
      custCr: quot.customer.cr,
      custEmail: quot.customer.email,
      items: quot.items.length > 0 ? quot.items : [{ desc: '', qty: 1, price: 0, amount: 0 }],
      vatPct: quot.vatPct,
      discount: quot.discount,
      notes: quot.notes,
      terms: quot.terms,
    })
    markClean()
  }, [state.editingDoc])

  useEffect(() => {
    if (!co || isEditing) return
    setForm((f) => ({
      ...f,
      quotNo: co.quotPref + co.quotNext,
      vatPct: co.vatPct,
      notes: co.invNotes,
      terms: co.invTerms,
    }))
  }, [co?.id, isEditing])

  const set = useCallback((field: keyof QuotationFormState, value: string | number | LineItem[]) => {
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
    if (!form.quotNo.trim()) { showToast('Quotation number is required.', 'err'); return }
    if (!form.custName.trim()) { showToast('Customer name is required.', 'err'); return }
    if (form.validUntil && form.date && form.validUntil < form.date) { showToast('Valid until date must be on or after the quotation date.', 'err'); return }
    const validItems = form.items.filter((i) => i.desc.trim() && i.qty > 0 && i.price > 0)
    if (validItems.length === 0) { showToast('At least one line item with description, quantity, and price is required.', 'err'); return }

    const editingId = state.editingDoc?.type === 'quot' ? state.editingDoc.id : null
    const dupe = state.quotations.find(
      (q) => q.quotNo === form.quotNo && q.companyId === co.id && q.id !== editingId
    )
    if (dupe) { showToast('Quotation number already exists.', 'err'); return }

    try {
      const saved = await createQuotation(co, {
        quotNo: form.quotNo,
        date: form.date,
        validUntil: form.validUntil,
        customer,
        items: form.items,
        subtotal, vatPct: form.vatPct, vatAmt, discount: form.discount, grand,
        notes: form.notes,
        terms: form.terms,
      })

      if (!editingId) {
        const updated = { ...co, quotNext: co.quotNext + 1, updatedAt: Date.now() }
        await saveCompany(updated)
      }

      saveCustomer(form.custName)
      setEditing({ type: 'quot', id: saved.id })
      setIsEditing(true)
      markClean()
      showToast(editingId ? 'Quotation updated!' : 'Quotation saved!')
    } catch {
      showToast('Failed to save quotation.', 'err')
    }
  }

  const handleNew = () => {
    setForm(emptyForm())
    setIsEditing(false)
    setEditing(null)
    markClean()
  }

  useKeyboardShortcuts({ s: handleSave, enter: handleSave })

  const buildTempQuotation = (): Quotation => ({
    id: '',
    companyId: co?.id || '',
    quotNo: form.quotNo,
    date: form.date,
    validUntil: form.validUntil,
    customer,
    items: form.items,
    subtotal, vatPct: form.vatPct, vatAmt, discount: form.discount, grand,
    notes: form.notes,
    terms: form.terms,
    createdAt: Date.now(),
  })

  const handlePrint = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildQuotationHTML(buildTempQuotation(), co)
    if (!html) { showToast('Cannot print empty quotation.', 'err'); return }
    await printHTML(html)
  }

  const handlePreview = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildQuotationHTML(buildTempQuotation(), co)
    if (!html) { showToast('Nothing to preview.', 'err'); return }
    showPreview(html)
  }

  const handleDownloadPDF = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildQuotationHTML(buildTempQuotation(), co)
    if (!html) { showToast('Cannot generate empty quotation.', 'err'); return }
    setPdfLoading(true)
    try {
      await htmlToPDF(html, form.quotNo || 'quotation')
    } catch { showToast('PDF generation failed.', 'err') }
    finally { setPdfLoading(false) }
  }

  const handleText = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildQuotationHTML(buildTempQuotation(), co)
    if (!html) { showToast('Cannot export text.', 'err'); return }
    downloadText(html, form.quotNo || 'quotation')
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">{isEditing ? 'Edit Quotation' : 'New Quotation'}</h1>
        <p className="text-sm text-[var(--color-text2)]">Create a quotation for a customer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Quotation Details</h2>
              {cur && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">{cur.code} {cur.symbol}</span>}
            </CardHeader>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Quotation No. <span className="text-red">*</span></label>
                  <input value={form.quotNo} onChange={(e) => set('quotNo', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Date</label>
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Customer</h2>
              {state.customers.filter((c) => c.companyId === co?.id).length > 0 && (
                <select
                  onChange={(e) => {
                    const found = state.customers.find((c) => c.id === e.target.value)
                    if (found) {
                      setForm((f) => ({
                        ...f,
                        custName: found.name,
                        custAddr: found.address,
                        custPhone: found.phone,
                        custCr: found.cr,
                        custEmail: found.email,
                      }))
                      markDirty()
                    }
                    e.target.value = ''
                  }}
                  className="text-xs max-w-[180px] px-2 py-1 rounded border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
                >
                  <option value="">-- Load Saved Customer --</option>
                  {state.customers.filter((c) => c.companyId === co?.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </CardHeader>
            <div className="p-5 space-y-3">
              <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Customer Name <span className="text-red">*</span></label>
                <input value={form.custName} onChange={(e) => set('custName', e.target.value)} list="quotCustNameList" className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                <datalist id="quotCustNameList">
                  {customers.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Address</label>
                  <input value={form.custAddr} onChange={(e) => set('custAddr', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Phone</label>
                  <input value={form.custPhone} onChange={(e) => set('custPhone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="text-xs font-medium text-[var(--color-text2)]">Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Terms & Conditions</label>
                <textarea value={form.terms} onChange={(e) => set('terms', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <QuotationSummary
            subtotal={subtotal}
            vatPct={form.vatPct}
            vatAmt={vatAmt}
            discount={form.discount}
            grand={grand}
            words={words}
            dp={decimals}
            curSymbol={cur?.symbol || ''}
          >
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} className="justify-center w-full">
                {isEditing ? 'Update Quotation' : 'Save Quotation'}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview} className="justify-center w-full">Preview</Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="justify-center w-full">Print</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={pdfLoading} className="justify-center w-full">
                {pdfLoading ? <><span className="spinner-sm" />Generating...</> : 'Download PDF'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleText} className="justify-center w-full">Text</Button>
              <Button variant="outline" onClick={handleNew} className="justify-center w-full">+ New Quotation</Button>
            </div>
          </QuotationSummary>
        </div>
      </div>
    </div>
  )
}
