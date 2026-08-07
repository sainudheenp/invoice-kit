import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { Field, Input, Textarea, Select, CustomerPicker, ExportActions } from '@/components/ui'
import { DocWorkspace, SectionTitle } from '@/components/layout/DocWorkspace'
import { LineItemsTable } from '@/components/invoice/LineItemsTable'
import { num2words, dp as getDp } from '@/utils'
import { fmtName } from '@/utils/nameFormat'
import { buildInvoiceHTML } from '@/templates'
import { printHTML, htmlToPDF, downloadText } from '@/utils/pdf'
import { Svg } from '@/icons'
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

  // restore editing doc
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

  // set defaults when company loads
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

  const badge = (
    <div className="flex items-center gap-2 flex-wrap">
      {cur && (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-semibold">
          <Svg name="save" className="w-3.5 h-3.5" /> {cur.code} {cur.symbol}
        </span>
      )}
      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${isEditing ? 'bg-green-bg text-green-dark' : 'bg-[var(--color-input-bg)] text-[var(--color-text2)]'}`}>
        {isEditing ? 'Editing' : 'New Document'}
      </span>
    </div>
  )

  const panel = (
    <>
      <div className="surface p-3 sm:p-4 sm:w-[320px] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text3)]">Total</span>
          <span className="text-xl font-bold tabular-nums">{cur?.symbol}{grand.toFixed(decimals)}</span>
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--color-text3)]">
          <span>Subtotal <b className="text-[var(--color-text)] tabular-nums">{cur?.symbol}{subtotal.toFixed(decimals)}</b></span>
          {totalTax > 0 && (
            <span>Tax <b className="text-[var(--color-text)] tabular-nums">{cur?.symbol}{totalTax.toFixed(decimals)}</b></span>
          )}
          {form.discount > 0 && (
            <span>Discount <b className="text-red tabular-nums">-{cur?.symbol}{form.discount.toFixed(decimals)}</b></span>
          )}
        </div>
        <div className="text-[11px] italic text-[var(--color-text3)] mt-1.5 border-t border-[var(--color-border)] pt-1.5">
          {words || 'Enter items to see amount in words'}
        </div>
      </div>
      <div className="surface p-3 flex-1">
        <ExportActions
          layout="bar"
          saveLabel={isEditing ? 'Update Invoice' : 'Save Invoice'}
          onSave={handleSave}
          onPreview={handlePreview}
          onPrint={handlePrint}
          onDownload={handleDownloadPDF}
          onText={handleText}
          onNew={handleNew}
          newLabel="Start New Invoice"
        />
      </div>
    </>
  )

  return (
    <DocWorkspace
      title={isEditing ? 'Edit Invoice' : 'New Invoice'}
      subtitle="Create a tax invoice."
      badge={badge}
      panel={panel}
    >
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle icon="file">Invoice Details</SectionTitle>
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

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <Field label="Customer Name" required dense>
              <Input dense value={form.custName} onChange={(e) => setField('custName', fmtName(e.target.value))} list="custNameList" placeholder="Enter customer name" />
              <datalist id="custNameList">
                {customers.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <Field label="Phone" dense>
              <Input dense value={form.custPhone} onChange={(e) => setField('custPhone', e.target.value)} placeholder="+968 ..." />
            </Field>
            <Field label="Email" dense>
              <Input dense type="email" value={form.custEmail} onChange={(e) => setField('custEmail', e.target.value)} placeholder="name@example.com" />
            </Field>
          </div>
          <Field label="Address" dense>
            <Input dense value={form.custAddr} onChange={(e) => setField('custAddr', e.target.value)} placeholder="Street, city" />
          </Field>
          <Field label="C.R." dense>
            <Input dense value={form.custCr} onChange={(e) => setField('custCr', e.target.value)} placeholder="Commercial registration" />
          </Field>
        </div>

        <hr className="border-[var(--color-border)]" />

        <SectionTitle icon="box">Line Items</SectionTitle>
        <LineItemsTable items={form.items} onChange={(items) => setField('items', items)} dp={decimals} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount" dense>
            <Input dense type="number" min="0" step="0.001" value={form.discount} onChange={(e) => setField('discount', Math.max(0, parseFloat(e.target.value) || 0))} />
          </Field>
          <Field label="Notes" dense>
            <Textarea dense value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={2} placeholder="Invoice notes..." />
          </Field>
        </div>
      </div>
    </DocWorkspace>
  )
}