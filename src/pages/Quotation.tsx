import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { DocWizard, type WizardStep } from '@/components/ui/DocWizard'
import { CardHeader, Field, Input, Textarea, CustomerPicker, ExportActions, Button } from '@/components/ui'
import { LineItemsTable } from '@/components/invoice/LineItemsTable'
import { num2words, dp as getDp } from '@/utils'
import { fmtName } from '@/utils/nameFormat'
import { buildQuotationHTML } from '@/templates'
import { printHTML, htmlToPDF, downloadText } from '@/utils/pdf'
import { Svg } from '@/icons'
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
  discount: number
  notes: string
  terms: string
}

const STEPS: WizardStep[] = [
  { key: 'details', label: 'Details', icon: 'file' },
  { key: 'customer', label: 'Customer', icon: 'users' },
  { key: 'items', label: 'Items', icon: 'box' },
  { key: 'review', label: 'Review', icon: 'check' },
]

const emptyForm = (): QuotationFormState => ({
  quotNo: '',
  date: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  custName: '', custAddr: '', custPhone: '', custCr: '', custEmail: '',
  items: [{ desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }],
  discount: 0,
  notes: '', terms: '',
})

export default function QuotationPage() {
  const navigate = useNavigate()
  const { state, getCo, saveCompany, createQuotation, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPreview, showPdfOverlay, hidePdfOverlay } = useUI()
  const { customers, saveCustomer } = useSavedCustomers()
  const co = getCo()
  const [form, setForm] = useState<QuotationFormState>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  useEffect(() => {
    if (!state.editingDoc || state.editingDoc.type !== 'quot') return
    const quot = state.quotations.find((q) => q.id === state.editingDoc!.id)
    if (!quot) return
    setIsEditing(true)
    setStep(3)
    setForm({
      quotNo: quot.quotNo,
      date: quot.date,
      validUntil: quot.validUntil,
      custName: quot.customer.name,
      custAddr: quot.customer.address,
      custPhone: quot.customer.phone,
      custCr: quot.customer.cr,
      custEmail: quot.customer.email,
      items: quot.items.length > 0 ? quot.items : [{ desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }],
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
      notes: co.invNotes,
      terms: co.invTerms,
    }))
  }, [co?.id, isEditing])

  const set = useCallback((field: keyof QuotationFormState, value: string | number | LineItem[]) => {
    setForm((f) => ({ ...f, [field]: value }))
    markDirty()
  }, [markDirty])

  const subtotal = form.items.reduce((s, i) => s + i.amount, 0)
  const totalTax = form.items.reduce((s, i) => s + i.amount * ((i.taxRate || 0) / 100), 0)
  const grand = subtotal + totalTax - form.discount
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
      setSaving(true)
      const saved = await createQuotation(co, {
        quotNo: form.quotNo,
        date: form.date,
        validUntil: form.validUntil,
        customer,
        items: form.items,
        subtotal, vatPct: 0, vatAmt: totalTax, discount: form.discount, grand,
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
    } finally {
      setSaving(false)
    }
  }

  const handleNew = () => {
    setForm(emptyForm())
    setIsEditing(false)
    setEditing(null)
    setStep(0)
    markClean()
  }

  useKeyboardShortcuts({ s: handleSave })

  const buildTempQuotation = (): Quotation => ({
    id: '',
    companyId: co?.id || '',
    quotNo: form.quotNo,
    date: form.date,
    validUntil: form.validUntil,
    customer,
    items: form.items,
    subtotal, vatPct: 0, vatAmt: totalTax, discount: form.discount, grand,
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
    showPdfOverlay()
    try {
      await htmlToPDF(html, form.quotNo || 'quotation')
    } catch (e) {
      console.error('PDF generation failed, falling back to print:', e)
      showToast('PDF export unavailable, opening print instead.', 'err')
      printHTML(html)
    } finally { hidePdfOverlay() }
  }

  const handleText = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildQuotationHTML(buildTempQuotation(), co)
    if (!html) { showToast('Cannot export text.', 'err'); return }
    downloadText(html, form.quotNo || 'quotation')
  }

  const goNext = () => {
    if (step === 0) {
      if (!form.quotNo.trim()) { showToast('Quotation number is required.', 'err'); return }
      if (form.validUntil && form.date && form.validUntil < form.date) { showToast('Valid until date must be on or after the quotation date.', 'err'); return }
      setStep(1)
      return
    }
    if (step === 1) {
      if (!form.custName.trim()) { showToast('Customer name is required.', 'err'); return }
      setStep(2)
      return
    }
    if (step === 2) {
      const validItems = form.items.filter((i) => i.desc.trim() && i.qty > 0 && i.price > 0)
      if (validItems.length === 0) { showToast('Add at least one line item with a description, quantity, and price.', 'err'); return }
      setStep(3)
      return
    }
    handleSave()
  }

  const badge = (
    <div className="flex items-center gap-2 flex-wrap">
      {cur && (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-semibold">
          <Svg name="folder" className="w-3.5 h-3.5" /> {cur.code} {cur.symbol}
        </span>
      )}
      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${isEditing ? 'bg-green-bg text-green-dark' : 'bg-[var(--color-input-bg)] text-[var(--color-text2)]'}`}>
        {isEditing ? 'Editing' : 'New Document'}
      </span>
    </div>
  )

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="surface" key="q0">
            <CardHeader>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center"><Svg name="file" className="w-4 h-4" /></span>
                Quotation Details
              </h2>
            </CardHeader>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Quotation No." required>
                  <Input value={form.quotNo} onChange={(e) => set('quotNo', e.target.value)} placeholder="QUO-0001" />
                </Field>
                <Field label="Date">
                  <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </Field>
                <Field label="Valid Until">
                  <Input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} />
                </Field>
              </div>
              <div className="mt-4 p-4 rounded-2xl bg-[var(--color-primary-bg)] border border-[var(--color-primary)]/20 text-xs text-[var(--color-primary-dark)] flex items-center gap-2">
                <Svg name="warning" className="w-4 h-4 shrink-0" />
                Quotations are valid for 30 days by default — adjust the "Valid Until" date as needed.
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="surface" key="q1">
            <CardHeader className="flex-col sm:flex-row sm:items-center">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Svg name="users" className="w-4 h-4 text-[var(--color-primary)]" />
                Customer
              </h2>
              <CustomerPicker
                companyId={co?.id || null}
                currentName={form.custName}
                onPick={(c) => {
                  setForm((f) => ({
                    ...f,
                    custName: c.name, custAddr: c.address,
                    custPhone: c.phone, custCr: c.cr, custEmail: c.email,
                  }))
                  markDirty()
                }}
              />
            </CardHeader>
            <div className="p-6 space-y-4">
              <Field label="Customer Name" required>
                <Input value={form.custName} onChange={(e) => set('custName', fmtName(e.target.value))} list="quotCustNameList" placeholder="Enter customer name" />
                <datalist id="quotCustNameList">
                  {customers.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Address">
                  <Input value={form.custAddr} onChange={(e) => set('custAddr', e.target.value)} placeholder="Street, city" />
                </Field>
                <Field label="Phone">
                  <Input value={form.custPhone} onChange={(e) => set('custPhone', e.target.value)} placeholder="+968 ..." />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="C.R.">
                  <Input value={form.custCr} onChange={(e) => set('custCr', e.target.value)} placeholder="Commercial registration" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.custEmail} onChange={(e) => set('custEmail', e.target.value)} placeholder="name@example.com" />
                </Field>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="surface" key="q2">
            <CardHeader>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center"><Svg name="box" className="w-4 h-4" /></span>
                Line Items
              </h2>
            </CardHeader>
            <div className="p-6">
              <LineItemsTable items={form.items} onChange={(items) => set('items', items)} dp={decimals} />
              <div className="mt-5 pt-5 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Discount">
                  <Input type="number" min="0" step="0.001" value={form.discount} onChange={(e) => set('discount', Math.max(0, parseFloat(e.target.value) || 0))} />
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <div className="flex-1 min-w-[160px] p-4 rounded-2xl bg-[var(--color-input-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text3)]">Subtotal</div>
                  <div className="text-lg font-bold tabular-nums">{cur?.symbol}{subtotal.toFixed(decimals)}</div>
                </div>
                <div className="flex-1 min-w-[160px] p-4 rounded-2xl bg-[var(--color-input-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text3)]">Tax</div>
                  <div className="text-lg font-bold tabular-nums">{cur?.symbol}{totalTax.toFixed(decimals)}</div>
                </div>
                <div className="flex-1 min-w-[160px] p-4 rounded-2xl bg-[var(--color-primary-bg)] border border-[var(--color-primary)]/30">
                  <div className="text-xs font-medium text-[var(--color-primary)]">Grand Total</div>
                  <div className="text-lg font-bold text-[var(--color-primary)] tabular-nums">{cur?.symbol}{grand.toFixed(decimals)}</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div key="q3" className="space-y-5">
            <div className="surface overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-primary-bg)] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs font-medium text-[var(--color-primary)]">Quotation #{form.quotNo || '—'}</div>
                  <div className="text-3xl font-bold text-[var(--color-text)] tabular-nums mt-1">{cur?.symbol}{grand.toFixed(decimals)}</div>
                  <div className="text-xs text-[var(--color-text2)] mt-1 italic">{words || 'Add items to see amount in words'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text3)]">{form.date} &rarr; {form.validUntil}</div>
                  <div className="text-sm font-semibold text-[var(--color-text)] mt-1 truncate max-w-[200px]">{form.custName || 'No customer'}</div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Summary</h3>
                  <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                    <div className="flex justify-between px-5 py-3 text-sm border-b border-[var(--color-border)]">
                      <span className="text-[var(--color-text2)]">Subtotal</span>
                      <span className="font-medium tabular-nums">{cur?.symbol}{subtotal.toFixed(decimals)}</span>
                    </div>
                    {totalTax > 0 && (
                      <div className="flex justify-between px-5 py-3 text-sm border-b border-[var(--color-border)]">
                        <span className="text-[var(--color-text2)]">Total Tax</span>
                        <span className="font-medium tabular-nums">{cur?.symbol}{totalTax.toFixed(decimals)}</span>
                      </div>
                    )}
                    {form.discount > 0 && (
                      <div className="flex justify-between px-5 py-3 text-sm border-b border-[var(--color-border)] text-red">
                        <span>Discount</span>
                        <span className="font-medium tabular-nums">-{cur?.symbol}{form.discount.toFixed(decimals)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-5 py-3 text-base font-bold">
                      <span>Grand Total</span>
                      <span className="tabular-nums">{cur?.symbol}{grand.toFixed(decimals)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Notes</h3>
                    <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Quotation notes..." />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Terms & Conditions</h3>
                    <Textarea value={form.terms} onChange={(e) => set('terms', e.target.value)} rows={2} placeholder="Payment terms, delivery, etc." />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Save & Export</h3>
                  <ExportActions
                    saveLabel={isEditing ? 'Update Quotation' : 'Save Quotation'}
                    onSave={handleSave}
                    onPreview={handlePreview}
                    onPrint={handlePrint}
                    onDownload={handleDownloadPDF}
                    onText={handleText}
                    onNew={handleNew}
                    newLabel="Start New Quotation"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <DocWizard
      steps={STEPS}
      current={step}
      onStepChange={setStep}
      canStepTo={(i) => i <= step}
      title={isEditing ? 'Edit Quotation' : 'New Quotation'}
      subtitle="Prepare a quotation for your customer in four easy steps."
      badge={badge}
      onBack={() => navigate('/')}
      nextLabel={step < 3 ? 'Continue' : saving ? 'Saving…' : (isEditing ? 'Update Quotation' : 'Save Quotation')}
      nextDisabled={saving}
      onNext={goNext}
      footerExtra={step === 3 ? (
        <Button variant="outline" onClick={handlePreview}>Preview</Button>
      ) : undefined}
    >
      {renderStep()}
    </DocWizard>
  )
}