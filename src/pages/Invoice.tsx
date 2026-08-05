import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { CardHeader, Field, Input, Textarea, Select, CustomerPicker, ExportActions } from '@/components/ui'
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
    } finally {
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

  return (
    <div className="page-enter">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="text-sm text-[var(--color-text2)] mt-0.5">Fill in the details, add items, and save.</p>
        </div>
        {badge}
      </header>

      <div className="max-w-3xl mx-auto space-y-5">
        <div className="surface" key="s0">
          <CardHeader>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center"><Svg name="file" className="w-4 h-4" /></span>
              Invoice Details
            </h2>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Invoice No." required>
                <Input value={form.invNo} onChange={(e) => setField('invNo', e.target.value)} placeholder="INV-0001" />
              </Field>
              <Field label="Date">
                <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
              </Field>
            </div>

            <div>
              <hr className="border-[var(--color-border)] my-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text3)] mb-3">Payment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Payment Method">
                  <Select value={form.payMethod} onChange={(e) => setField('payMethod', e.target.value)}>
                    <option value="">-- Select --</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>Bank Transfer</option>
                  </Select>
                </Field>
                {showCheque && (
                  <Field label="Cheque No.">
                    <Input value={form.chequeNo} onChange={(e) => setField('chequeNo', e.target.value)} />
                  </Field>
                )}
                {showBank && (
                  <Field label="Bank Name">
                    <Input value={form.bankName} onChange={(e) => setField('bankName', e.target.value)} />
                  </Field>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="surface" key="s1">
          <CardHeader className="flex-col sm:flex-row sm:items-center">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Svg name="users" className="w-4 h-4 text-[var(--color-primary)]" />
              Customer
            </h2>
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
          </CardHeader>
          <div className="p-6 space-y-4">
            <Field label="Customer Name" required>
              <Input value={form.custName} onChange={(e) => setField('custName', fmtName(e.target.value))} list="custNameList" placeholder="Enter customer name" />
              <datalist id="custNameList">
                {customers.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address">
                <Input value={form.custAddr} onChange={(e) => setField('custAddr', e.target.value)} placeholder="Street, city" />
              </Field>
              <Field label="Phone">
                <Input value={form.custPhone} onChange={(e) => setField('custPhone', e.target.value)} placeholder="+968 ..." />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="C.R.">
                <Input value={form.custCr} onChange={(e) => setField('custCr', e.target.value)} placeholder="Commercial registration" />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.custEmail} onChange={(e) => setField('custEmail', e.target.value)} placeholder="name@example.com" />
              </Field>
            </div>
          </div>
        </div>

        <div className="surface" key="s2">
          <CardHeader>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center"><Svg name="box" className="w-4 h-4" /></span>
              Line Items
            </h2>
          </CardHeader>
          <div className="p-6">
            <LineItemsTable items={form.items} onChange={(items) => setField('items', items)} dp={decimals} />
            <div className="mt-5 pt-5 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Discount">
                <Input type="number" min="0" step="0.001" value={form.discount} onChange={(e) => setField('discount', Math.max(0, parseFloat(e.target.value) || 0))} />
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

        <div className="surface overflow-hidden" key="s3">
          <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-primary-bg)] flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-medium text-[var(--color-primary)]">Invoice #{form.invNo || '—'}</div>
              <div className="text-3xl font-bold text-[var(--color-text)] tabular-nums mt-1">{cur?.symbol}{grand.toFixed(decimals)}</div>
              <div className="text-xs text-[var(--color-text2)] mt-1 italic">{words || 'Enter items to see amount in words'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-text3)]">{form.date}</div>
              {form.payMethod && <div className="text-xs font-medium text-[var(--color-primary)]">{form.payMethod}</div>}
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
                <Textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={3} placeholder="Invoice notes..." />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Save & Export</h3>
              <ExportActions
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
          </div>
        </div>
      </div>
    </div>
  )
}
