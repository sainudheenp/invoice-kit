import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { Field, Input, Textarea, Select, CustomerPicker, ExportActions } from '@/components/ui'
import { Card, CardBody, SectionTitle } from '@/components/layout'
import { LineItemsTable } from '@/components/invoice/LineItemsTable'
import { num2words, dp as getDp } from '@/utils'
import { fmtName } from '@/utils/nameFormat'
import { buildInvoiceHTML } from '@/templates'
import { printHTML, htmlToPDF, downloadText } from '@/utils/pdf'
import type { LineItem, Customer, Invoice } from '@/types/invoice'

interface InvoiceFormState {
  invNo: string
  date: string
  custName: string
  custAddr: string
  custPhone: string
  custCr: string
  custEmail: string
  items: LineItem[]
  discount: number
  notes: string
  payMethod: string
  chequeNo: string
  bankName: string
}

const emptyForm = (): InvoiceFormState => ({
  invNo: '',
  date: new Date().toISOString().slice(0, 10),
  custName: '', custAddr: '', custPhone: '', custCr: '', custEmail: '',
  items: [{ desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }],
  discount: 0,
  notes: '', payMethod: '', chequeNo: '', bankName: '',
})

export default function Invoice() {
  const { state, getCo, saveCompany, createInvoice, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPreview, showPdfOverlay, hidePdfOverlay } = useUI()
  const { customers, saveCustomer } = useSavedCustomers()
  const co = getCo()
  const { state: form, set: setForm } = useUndoRedo<InvoiceFormState>(emptyForm())
  const [isEditing, setIsEditing] = useState(false)

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  useEffect(() => {
    if (!state.editingDoc || state.editingDoc.type !== 'inv') return
    const inv = state.invoices.find((i) => i.id === state.editingDoc!.id)
    if (!inv) return
    setIsEditing(true)
    setForm({
      invNo: inv.invNo,
      date: inv.date,
      custName: inv.customer.name,
      custAddr: inv.customer.address,
      custPhone: inv.customer.phone,
      custCr: inv.customer.cr,
      custEmail: inv.customer.email,
      items: inv.items.length > 0 ? inv.items : [{ desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }],
      discount: inv.discount,
      notes: inv.notes,
      payMethod: inv.payMethod || '',
      chequeNo: inv.payDetails || '',
      bankName: inv.bankName || '',
    })
    markClean()
  }, [state.editingDoc])

  useEffect(() => {
    if (!co || isEditing) return
    setForm({
      ...form,
      invNo: co.invPref + co.invNext,
      notes: co.invNotes,
    })
  }, [co?.id, isEditing])

  const setField = useCallback((field: keyof InvoiceFormState, value: string | number | LineItem[]) => {
    setForm({ ...form, [field]: value })
    markDirty()
  }, [form, setForm, markDirty])

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
    if (!form.invNo.trim()) { showToast('Invoice number is required.', 'err'); return }
    if (!form.custName.trim()) { showToast('Customer name is required.', 'err'); return }
    const validItems = form.items.filter((i) => i.desc.trim() && i.qty > 0 && i.price > 0)
    if (validItems.length === 0) { showToast('At least one line item with description, quantity, and price is required.', 'err'); return }

    const editingId = state.editingDoc?.type === 'inv' ? state.editingDoc.id : null
    const existingInv = editingId ? state.invoices.find((i) => i.id === editingId) : null
    const isPaid = existingInv?.paid ?? false

    const dupe = state.invoices.find(
      (i) => i.invNo === form.invNo && i.companyId === co.id && i.id !== editingId
    )
    if (dupe) { showToast('Invoice number already exists.', 'err'); return }

    try {
      const saved = await createInvoice(co, {
        invNo: form.invNo,
        date: form.date,
        paid: isPaid,
        customer,
        items: form.items,
        subtotal, vatPct: 0, vatAmt: totalTax, discount: form.discount, grand,
        notes: form.notes,
        payMethod: form.payMethod,
        payDetails: form.chequeNo,
        bankName: form.bankName,
      })

      if (!editingId) {
        const updated = { ...co, invNext: co.invNext + 1, updatedAt: Date.now() }
        await saveCompany(updated)
      }

      saveCustomer(form.custName)
      setEditing({ type: 'inv', id: saved.id })
      setIsEditing(true)
      markClean()
      showToast(editingId ? 'Invoice updated!' : 'Invoice saved!')
    } catch {
      showToast('Failed to save invoice.', 'err')
    }
  }

  const handleNew = () => {
    setForm(emptyForm())
    setIsEditing(false)
    setEditing(null)
    markClean()
  }

  useKeyboardShortcuts({ s: handleSave })

  const buildTempInvoice = (): Invoice => {
    const editingId = state.editingDoc?.type === 'inv' ? state.editingDoc.id : null
    const existingInv = editingId ? state.invoices.find((i) => i.id === editingId) : null
    const isPaid = existingInv?.paid ?? false
    return {
      id: '',
      companyId: co?.id || '',
      invNo: form.invNo,
      date: form.date,
      paid: isPaid,
      customer,
      items: form.items,
      subtotal, vatPct: 0, vatAmt: totalTax, discount: form.discount, grand,
      notes: form.notes,
      payMethod: form.payMethod,
      payDetails: form.chequeNo,
      bankName: form.bankName,
      createdAt: Date.now(),
    }
  }

  const handlePrint = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildInvoiceHTML(buildTempInvoice(), co)
    if (!html) { showToast('Cannot print empty invoice.', 'err'); return }
    await printHTML(html)
  }

  const handleDownloadPDF = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildInvoiceHTML(buildTempInvoice(), co)
    if (!html) { showToast('Cannot generate empty invoice.', 'err'); return }
    showPdfOverlay()
    try {
      await htmlToPDF(html, form.invNo || 'invoice')
    } catch (e) {
      console.error('PDF generation failed, falling back to print:', e)
      showToast('PDF export unavailable, opening print instead.', 'err')
      printHTML(html)
    } finally { hidePdfOverlay() }
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
    <div className="page-enter flex flex-col gap-4 lg:h-[calc(100dvh-2.5rem)] lg:min-h-0">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="text-xs text-[var(--color-text2)] mt-0.5">Create and manage your invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportActions
            layout="bar"
            saveLabel={isEditing ? 'Update' : 'Save'}
            onSave={handleSave}
            onPreview={handlePreview}
            onPrint={handlePrint}
            onDownload={handleDownloadPDF}
            onText={handleText}
            onNew={handleNew}
            newLabel="New"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1 space-y-4">
        <Card>
          <CardBody className="p-4 sm:p-5 space-y-5">
            {/* Invoice Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Invoice No." required dense>
                <Input dense value={form.invNo} onChange={(e) => setField('invNo', e.target.value)} placeholder="INV-0001" />
              </Field>
              <Field label="Date" dense>
                <Input dense type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
              </Field>
              <Field label="Payment Method" dense>
                <Select dense value={form.payMethod} onChange={(e) => setField('payMethod', e.target.value)}>
                  <option value="">-- Select --</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Bank Transfer</option>
                </Select>
              </Field>
              {showCheque && (
                <Field label="Cheque No." dense>
                  <Input dense value={form.chequeNo} onChange={(e) => setField('chequeNo', e.target.value)} />
                </Field>
              )}
              {showBank && !showCheque && (
                <Field label="Bank Name" dense>
                  <Input dense value={form.bankName} onChange={(e) => setField('bankName', e.target.value)} />
                </Field>
              )}
            </div>

            <hr className="border-[var(--color-border)]" />

            {/* Customer */}
            <div className="flex items-center justify-between gap-3">
              <SectionTitle icon="users">Customer</SectionTitle>
              <CustomerPicker
                companyId={co?.id || null}
                currentName={form.custName}
                onPick={(c) => {
                  setForm({
                    ...form,
                    custName: c.name, custAddr: c.address,
                    custPhone: c.phone, custCr: c.cr, custEmail: c.email,
                  })
                  markDirty()
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Customer Name" required dense>
                <Input dense value={form.custName} onChange={(e) => setField('custName', fmtName(e.target.value))} list="custNameList" placeholder="Enter customer name" />
                <datalist id="custNameList">
                  {customers.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <Field label="Phone" dense>
                <Input dense value={form.custPhone} onChange={(e) => setField('custPhone', e.target.value)} placeholder="+968 ..." />
              </Field>
              <Field label="Email" dense>
                <Input dense type="email" value={form.custEmail} onChange={(e) => setField('custEmail', e.target.value)} placeholder="name@example.com" />
              </Field>
              <Field label="Address" dense>
                <Input dense value={form.custAddr} onChange={(e) => setField('custAddr', e.target.value)} placeholder="Street, city" />
              </Field>
              <Field label="C.R." dense>
                <Input dense value={form.custCr} onChange={(e) => setField('custCr', e.target.value)} placeholder="Commercial registration" />
              </Field>
            </div>

            <hr className="border-[var(--color-border)]" />

            {/* Notes + Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <SectionTitle icon="file-text">Notes</SectionTitle>
                <Field label="Notes" dense>
                  <Textarea dense value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={3} placeholder="Add any notes or payment terms here..." />
                </Field>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text2)]">Discount</span>
                  <Input dense type="number" min="0" step="0.001" value={form.discount} onChange={(e) => setField('discount', Math.max(0, parseFloat(e.target.value) || 0))} className="w-24" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text2)]">Subtotal</span>
                    <span className="tabular-nums font-medium">{cur?.symbol}{subtotal.toFixed(decimals)}</span>
                  </div>
                  {totalTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text2)]">Tax</span>
                      <span className="tabular-nums font-medium">{cur?.symbol}{totalTax.toFixed(decimals)}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--color-border)] my-1" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Grand Total</span>
                    <span className="tabular-nums text-[var(--color-primary)]">{cur?.symbol}{grand.toFixed(decimals)}</span>
                  </div>
                  {words && (
                    <div className="text-[11px] text-[var(--color-text3)] italic leading-relaxed">{words}</div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-[var(--color-border)]" />

            {/* Line Items */}
            <LineItemsTable items={form.items} onChange={(items) => setField('items', items)} dp={decimals} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
