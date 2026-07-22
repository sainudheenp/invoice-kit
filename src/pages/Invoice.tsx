import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useSavedCustomers } from '@/hooks/useSavedCustomers'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { Card, CardHeader, Button, Field, Input, Textarea, Select } from '@/components/ui'
import { LineItemsTable } from '@/components/invoice/LineItemsTable'
import { InvoiceSummary } from '@/components/invoice/InvoiceSummary'
import { num2words, dp as getDp } from '@/utils'
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
  notes: '', payMethod: 'Cash', chequeNo: '', bankName: '',
})

export default function Invoice() {
  const { state, getCo, saveCompany, createInvoice, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPreview, showPdfOverlay, hidePdfOverlay } = useUI()
  const { customers, saveCustomer } = useSavedCustomers()
  const co = getCo()
  const { state: form, set: setForm, undo, redo, canUndo, canRedo } = useUndoRedo<InvoiceFormState>(emptyForm())
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
      payMethod: inv.payMethod || 'Cash',
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

  useKeyboardShortcuts({ s: handleSave, enter: handleSave })

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Invoice No." required>
                  <Input value={form.invNo} onChange={(e) => setField('invNo', e.target.value)} />
                </Field>
                <Field label="Date">
                  <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
                </Field>
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
                      setForm({
                        ...form,
                        custName: found.name,
                        custAddr: found.address,
                        custPhone: found.phone,
                        custCr: found.cr,
                        custEmail: found.email,
                      })
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
              <Field label="Customer Name" required>
                <Input value={form.custName} onChange={(e) => setField('custName', e.target.value)} list="custNameList" />
                <datalist id="custNameList">
                  {customers.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Address">
                  <Input value={form.custAddr} onChange={(e) => setField('custAddr', e.target.value)} />
                </Field>
                <Field label="Phone">
                  <Input value={form.custPhone} onChange={(e) => setField('custPhone', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="C.R.">
                  <Input value={form.custCr} onChange={(e) => setField('custCr', e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input value={form.custEmail} onChange={(e) => setField('custEmail', e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Line Items</h2></CardHeader>
            <div className="p-5">
              <LineItemsTable items={form.items} onChange={(items) => setField('items', items)} dp={decimals} />
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Summary</h2></CardHeader>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Subtotal">
                  <Input readOnly value={subtotal.toFixed(decimals)} />
                </Field>
                <Field label="Total Tax">
                  <Input readOnly value={totalTax.toFixed(decimals)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Discount">
                  <Input type="number" min="0" step="0.001" value={form.discount} onChange={(e) => setField('discount', Math.max(0, parseFloat(e.target.value) || 0))} />
                </Field>
                <Field label="Grand Total">
                  <Input readOnly value={grand.toFixed(decimals)} />
                </Field>
              </div>
              <Field label="Amount in Words">
                <Input readOnly value={words} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Additional</h2></CardHeader>
            <div className="p-5 space-y-4">
              <Field label="Payment Method">
                <Select value={form.payMethod} onChange={(e) => setField('payMethod', e.target.value)}>
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
              <Field label="Notes">
                <Textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={2} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <InvoiceSummary
            subtotal={subtotal}
            totalTax={totalTax}
            discount={form.discount}
            grand={grand}
            words={words}
            dp={decimals}
            curSymbol={cur?.symbol || ''}
          >
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} className="justify-center w-full">
                {isEditing ? 'Update Invoice' : 'Save Invoice'}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview} className="justify-center w-full">Preview</Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="justify-center w-full">Print</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="justify-center w-full">Download PDF</Button>
              <Button variant="outline" size="sm" onClick={handleText} className="justify-center w-full">Text</Button>
              <Button variant="outline" onClick={handleNew} className="justify-center w-full">+ New Invoice</Button>
            </div>
          </InvoiceSummary>
        </div>
      </div>
    </div>
  )
}
