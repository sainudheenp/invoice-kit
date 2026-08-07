import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Field, Input, Textarea, Select, CustomerPicker, ExportActions } from '@/components/ui'
import { DocWorkspace, SectionTitle } from '@/components/layout/DocWorkspace'
import { ReceiptItems } from '@/components/receipt/ReceiptItems'
import { num2words, dp as getDp } from '@/utils'
import { fmtName } from '@/utils/nameFormat'
import { buildReceiptHTML } from '@/templates'
import { printHTML, htmlToPDF, downloadText } from '@/utils/pdf'
import { Svg } from '@/icons'
import type { LineItem } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'

interface ReceiptFormState {
  recNo: string
  date: string
  receivedFrom: string
  mode: 'simple' | 'itemized'
  simpleAmount: number
  items: LineItem[]
  payMethod: string
  chequeNo: string
  bankName: string
  transDate: string
  being: string
  receiver: string
  signatory: string
}

const emptyForm = (): ReceiptFormState => ({
  recNo: '',
  date: new Date().toISOString().slice(0, 10),
  receivedFrom: '',
  mode: 'simple',
  simpleAmount: 0,
  items: [{ desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }],
  payMethod: '',
  chequeNo: '',
  bankName: '',
  transDate: '',
  being: '',
  receiver: '',
  signatory: '',
})

export default function Receipt() {
  const { state, getCo, saveCompany, createReceipt, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPreview, showPdfOverlay, hidePdfOverlay } = useUI()
  const co = getCo()
  const [form, setForm] = useState<ReceiptFormState>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  useEffect(() => {
    if (!state.editingDoc || state.editingDoc.type !== 'rec') return
    const rec = state.receipts.find((r) => r.id === state.editingDoc!.id)
    if (!rec) return
    setIsEditing(true)
    const hasItems = rec.items.length > 0 && rec.items.some((i) => i.desc.trim())
    setForm({
      recNo: rec.recNo,
      date: rec.date,
      receivedFrom: rec.receivedFrom,
      mode: hasItems ? 'itemized' : 'simple',
      simpleAmount: hasItems ? rec.items.reduce((s, i) => s + i.amount, 0) : rec.amount,
      items: rec.items.length > 0 ? rec.items.map((i) => ({ ...i, taxRate: i.taxRate || 0 })) : [{ desc: '', qty: 1, price: 0, amount: 0, taxRate: 0 }],
      payMethod: rec.payMethod || '',
      chequeNo: rec.chequeNo || '',
      bankName: rec.bankName || '',
      transDate: rec.transDate || '',
      being: rec.being || '',
      receiver: rec.receiver || '',
      signatory: rec.signatory || '',
    })
    markClean()
  }, [state.editingDoc])

  useEffect(() => {
    if (!co || isEditing) return
    setForm((f) => ({
      ...f,
      recNo: co.recPref + co.recNext,
      being: co.recBeing,
    }))
  }, [co?.id, isEditing])

  const set = useCallback((field: keyof ReceiptFormState, value: string | number | LineItem[] | 'simple' | 'itemized') => {
    setForm((f) => ({ ...f, [field]: value }))
    markDirty()
  }, [markDirty])

  const amount = form.mode === 'simple' ? form.simpleAmount : form.items.reduce((s, i) => s + i.amount, 0)
  const totalTax = form.mode === 'simple' ? 0 : form.items.reduce((s, i) => s + i.amount * ((i.taxRate || 0) / 100), 0)
  const grand = amount + totalTax
  const words = grand > 0 && cur ? num2words(grand, cur) : ''

  const showCheque = form.payMethod === 'Cheque'
  const showBank = form.payMethod === 'Cheque' || form.payMethod === 'Bank Transfer'
  const showTransDate = form.payMethod === 'Cheque' || form.payMethod === 'Bank Transfer'

  const handleSave = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    if (!form.recNo.trim()) { showToast('Receipt number is required.', 'err'); return }
    if (!form.receivedFrom.trim()) { showToast('Received from is required.', 'err'); return }
    if (amount <= 0) { showToast('Amount must be greater than zero.', 'err'); return }

    const editingId = state.editingDoc?.type === 'rec' ? state.editingDoc.id : null
    const dupe = state.receipts.find(
      (r) => r.recNo === form.recNo && r.companyId === co.id && r.id !== editingId
    )
    if (dupe) { showToast('Receipt number already exists.', 'err'); return }

    try {
      const savedItems = form.mode === 'simple'
        ? []
        : form.items.filter((i) => i.desc.trim()) as LineItem[]

      const saved = await createReceipt(co, {
        recNo: form.recNo,
        date: form.date,
        receivedFrom: form.receivedFrom,
        items: savedItems,
        amount: grand,
        vatPct: 0,
        vatAmt: totalTax,
        amountWords: words,
        payMethod: form.payMethod,
        chequeNo: form.chequeNo,
        bankName: form.bankName,
        transDate: form.transDate,
        being: form.being,
        receiver: form.receiver,
        signatory: form.signatory,
      })

      if (!editingId) {
        const updated = { ...co, recNext: co.recNext + 1, updatedAt: Date.now() }
        await saveCompany(updated)
      }

      setEditing({ type: 'rec', id: saved.id })
      setIsEditing(true)
      markClean()
      showToast(editingId ? 'Receipt updated!' : 'Receipt saved!')
    } catch {
      showToast('Failed to save receipt.', 'err')
    }
  }

  const handleNew = () => {
    setForm(emptyForm())
    setIsEditing(false)
    setEditing(null)
    markClean()
  }

  useKeyboardShortcuts({ s: handleSave })

  const buildTempReceipt = (): Receipt => ({
    id: '',
    companyId: co?.id || '',
    recNo: form.recNo,
    date: form.date,
    receivedFrom: form.receivedFrom,
    items: form.mode === 'simple' ? [] : form.items.filter((i) => i.desc.trim()),
    amount: grand,
    vatPct: 0,
    vatAmt: totalTax,
    amountWords: words,
    payMethod: form.payMethod,
    chequeNo: form.chequeNo,
    bankName: form.bankName,
    transDate: form.transDate,
    being: form.being,
    receiver: form.receiver,
    signatory: form.signatory,
    createdAt: Date.now(),
  })


  const handlePrint = async () => {
    if (!co) { showToast('No active file.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Cannot print empty receipt.', 'err'); return }
    await printHTML(html)
  }

  const handleDownloadPDF = async () => {
    if (!co) { showToast('No active file.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Cannot generate empty receipt.', 'err'); return }
    showPdfOverlay()
    try {
      await htmlToPDF(html, form.recNo || 'receipt')
    } catch (e) {
      console.error('PDF generation failed, falling back to print:', e)
      showToast('PDF export unavailable, opening print instead.', 'err')
      printHTML(html)
    } finally { hidePdfOverlay() }
  }

  const handlePreview = () => {
    if (!co) { showToast('No active file.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Nothing to preview.', 'err'); return }
    showPreview(html)
  }

  const handleText = () => {
    if (!co) { showToast('No active file.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Cannot export text.', 'err'); return }
    downloadText(html, form.recNo || 'receipt')
  }

  const badge = (
    <div className="flex items-center gap-2 flex-wrap">
      {cur && (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-semibold">
          <Svg name="receipt" className="w-3.5 h-3.5" /> {cur.code} {cur.symbol}
        </span>
      )}
      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${isEditing ? 'bg-green-bg text-green-dark' : 'bg-[var(--color-input-bg)] text-[var(--color-text2)]'}`}>
        {isEditing ? 'Editing' : 'New Document'}
      </span>
    </div>
  )

  const modeSwitch = (
    <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden text-xs font-medium bg-[var(--color-input-bg)] p-1">
      <button
        onClick={() => set('mode', 'simple')}
        className={`px-4 py-1.5 rounded-lg cursor-pointer transition-colors ${form.mode === 'simple' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text2)] hover:text-[var(--color-text)]'}`}
      >
        Simple
      </button>
      <button
        onClick={() => set('mode', 'itemized')}
        className={`px-4 py-1.5 rounded-lg cursor-pointer transition-colors ${form.mode === 'itemized' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text2)] hover:text-[var(--color-text)]'}`}
      >
        Itemized
      </button>
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
          <span>{form.mode === 'simple' ? 'Amount' : 'Subtotal'} <b className="text-[var(--color-text)] tabular-nums">{cur?.symbol}{amount.toFixed(decimals)}</b></span>
          {totalTax > 0 && (
            <span>Tax <b className="text-[var(--color-text)] tabular-nums">{cur?.symbol}{totalTax.toFixed(decimals)}</b></span>
          )}
        </div>
        <div className="text-[11px] italic text-[var(--color-text3)] mt-1.5 border-t border-[var(--color-border)] pt-1.5">
          {words || 'Set an amount to see it in words'}
        </div>
      </div>
      <div className="surface p-3 flex-1">
        <ExportActions
          layout="bar"
          saveLabel={isEditing ? 'Update Receipt' : 'Save Receipt'}
          onSave={handleSave}
          onPreview={handlePreview}
          onPrint={handlePrint}
          onDownload={handleDownloadPDF}
          onText={handleText}
          onNew={handleNew}
          newLabel="Start New Receipt"
        />
      </div>
    </>
  )

  return (
    <DocWorkspace
      title={isEditing ? 'Edit Receipt' : 'New Receipt'}
      subtitle="Create a receipt."
      badge={badge}
      panel={panel}
    >
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle icon="file">Receipt Details</SectionTitle>
          <div className="flex items-center gap-2">
            {modeSwitch}
            <CustomerPicker
              companyId={co?.id || null}
              currentName={form.receivedFrom}
              onPick={(c) => set('receivedFrom', c.name)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Receipt No." required dense>
            <Input dense value={form.recNo} onChange={(e) => set('recNo', e.target.value)} placeholder="RCT-0001" />
          </Field>
          <Field label="Date" dense>
            <Input dense type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
          <Field label="Payment Method" dense>
            <Select dense value={form.payMethod} onChange={(e) => set('payMethod', e.target.value)}>
              <option value="">-- Select --</option>
              <option>Cash</option>
              <option>Cheque</option>
              <option>Bank Transfer</option>
            </Select>
          </Field>
          {showTransDate && (
            <Field label="Transaction Date" dense>
              <Input dense type="date" value={form.transDate} onChange={(e) => set('transDate', e.target.value)} />
            </Field>
          )}
          {!showTransDate && showCheque && (
            <Field label="Cheque No." dense>
              <Input dense value={form.chequeNo} onChange={(e) => set('chequeNo', e.target.value)} />
            </Field>
          )}
          {!showTransDate && showBank && !showCheque && (
            <Field label="Bank Name" dense>
              <Input dense value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Payer / Customer" required dense>
            <Input dense value={form.receivedFrom} onChange={(e) => set('receivedFrom', fmtName(e.target.value))} list="recvCustNameList" placeholder="Name of the payer" />
            <datalist id="recvCustNameList">
              {state.customers.filter((c) => c.companyId === co?.id).map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Receiver Name" dense>
              <Input dense value={form.receiver} onChange={(e) => set('receiver', e.target.value)} placeholder="Who received the payment" />
            </Field>
            <Field label="Signatory" dense>
              <Input dense value={form.signatory} onChange={(e) => set('signatory', e.target.value)} placeholder="Signer on the receipt" />
            </Field>
          </div>
        </div>

        {form.mode === 'simple' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" required dense>
              <Input dense type="number" min="0" step="0.001" value={form.simpleAmount} onChange={(e) => set('simpleAmount', Math.max(0, parseFloat(e.target.value) || 0))} />
            </Field>
            <Field label="Words" dense>
              <Input dense readOnly value={words} />
            </Field>
          </div>
        ) : (
          <div>
            <SectionTitle icon="box">Items</SectionTitle>
            <div className="mt-3">
              <ReceiptItems items={form.items} onChange={(items) => set('items', items)} dp={decimals} />
            </div>
          </div>
        )}

        <Field label="Being (Purpose)" dense>
          <Textarea dense value={form.being} onChange={(e) => set('being', e.target.value)} rows={2} placeholder="Reason for the payment..." />
        </Field>
      </div>
    </DocWorkspace>
  )
}