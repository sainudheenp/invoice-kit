import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Card, CardHeader, Button } from '@/components/ui'
import { ReceiptItems } from '@/components/receipt/ReceiptItems'
import { ReceiptSummary } from '@/components/receipt/ReceiptSummary'
import { num2words, dp as getDp } from '@/utils'
import { buildReceiptHTML } from '@/templates'
import { createReceiptPDF, printHTML, downloadText } from '@/utils/pdf'
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
  items: [{ desc: '', qty: 1, price: 0, amount: 0 }],
  payMethod: 'Cash',
  chequeNo: '',
  bankName: '',
  transDate: '',
  being: '',
  receiver: '',
  signatory: '',
})

export default function Receipt() {
  const { state, getCo, saveCompany, createReceipt, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPDFOverlay, hidePDFOverlay, showPreview } = useUI()
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
      items: rec.items.length > 0 ? rec.items : [{ desc: '', qty: 1, price: 0, amount: 0 }],
      payMethod: rec.payMethod || 'Cash',
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
  const words = amount > 0 && cur ? num2words(amount, cur) : ''

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
        amount,
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

  useKeyboardShortcuts({ s: handleSave, enter: handleSave })

  const buildTempReceipt = (): Receipt => ({
    id: '',
    companyId: co?.id || '',
    recNo: form.recNo,
    date: form.date,
    receivedFrom: form.receivedFrom,
    items: form.mode === 'simple' ? [] : form.items.filter((i) => i.desc.trim()),
    amount,
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
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Cannot print empty receipt.', 'err'); return }
    await printHTML(html)
  }

  const handlePDF = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    showPDFOverlay()
    try {
      await createReceiptPDF(buildTempReceipt(), co)
    } catch { showToast('PDF generation failed.', 'err') }
    hidePDFOverlay()
  }

  const handlePreview = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Nothing to preview.', 'err'); return }
    showPreview(html)
  }

  const handleText = () => {
    if (!co) { showToast('No active company.', 'err'); return }
    const html = buildReceiptHTML(buildTempReceipt(), co)
    if (!html) { showToast('Cannot export text.', 'err'); return }
    downloadText(html, form.recNo || 'receipt')
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">{isEditing ? 'Edit Receipt' : 'Receipt Voucher'}</h1>
        <p className="text-sm text-[var(--color-text2)]">Create a receipt voucher.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Receipt Details</h2>
              {cur && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">{cur.code} {cur.symbol}</span>}
            </CardHeader>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Receipt No. <span className="text-red">*</span></label>
                  <input value={form.recNo} onChange={(e) => set('recNo', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Date</label>
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
              <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Received From <span className="text-red">*</span></label>
                <input value={form.receivedFrom} onChange={(e) => set('receivedFrom', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
              </div>
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
              {showTransDate && (
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Transaction Date</label>
                  <input type="date" value={form.transDate} onChange={(e) => set('transDate', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Being (Purpose)</label>
                <input value={form.being} onChange={(e) => set('being', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Receiver Name</label>
                  <input value={form.receiver} onChange={(e) => set('receiver', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Signatory</label>
                  <input value={form.signatory} onChange={(e) => set('signatory', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Items</h2>
              <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden text-xs font-medium">
                <button
                  onClick={() => set('mode', 'simple')}
                  className={`px-3 py-1.5 cursor-pointer transition-colors ${form.mode === 'simple' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-input-bg)] text-[var(--color-text2)] hover:text-[var(--color-text)]'}`}
                >
                  Simple
                </button>
                <button
                  onClick={() => set('mode', 'itemized')}
                  className={`px-3 py-1.5 cursor-pointer transition-colors ${form.mode === 'itemized' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-input-bg)] text-[var(--color-text2)] hover:text-[var(--color-text)]'}`}
                >
                  Itemized
                </button>
              </div>
            </CardHeader>
            <div className="p-5">
              {form.mode === 'simple' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--color-text2)]">Amount <span className="text-red">*</span></label>
                    <input type="number" min="0" step="0.001" value={form.simpleAmount} onChange={(e) => set('simpleAmount', Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--color-text2)]">Words</label>
                    <input readOnly value={words} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm" />
                  </div>
                </div>
              ) : (
                <ReceiptItems items={form.items} onChange={(items) => set('items', items)} dp={decimals} />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <ReceiptSummary amount={amount} words={words} dp={decimals} curSymbol={cur?.symbol || ''}>
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} className="justify-center w-full">
                {isEditing ? 'Update Receipt' : 'Save Receipt'}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview} className="justify-center w-full">Preview</Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="justify-center w-full">Print</Button>
              <Button variant="outline" size="sm" onClick={handlePDF} className="justify-center w-full">PDF</Button>
              <Button variant="outline" size="sm" onClick={handleText} className="justify-center w-full">Text</Button>
              <Button variant="outline" onClick={handleNew} className="justify-center w-full">+ New Receipt</Button>
            </div>
          </ReceiptSummary>
        </div>
      </div>
    </div>
  )
}
