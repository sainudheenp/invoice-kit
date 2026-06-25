import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Card, CardHeader, Button } from '@/components/ui'
import { ReceiptSummary } from '@/components/receipt/ReceiptSummary'
import { num2words, dp as getDp } from '@/utils'

interface ReceiptFormState {
  recNo: string
  date: string
  receivedFrom: string
  amount: number
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
  amount: 0,
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
  const { markDirty, markClean, showToast } = useUI()
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
    setForm({
      recNo: rec.recNo,
      date: rec.date,
      receivedFrom: rec.receivedFrom,
      amount: rec.amount,
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

  const set = useCallback((field: keyof ReceiptFormState, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }))
    markDirty()
  }, [markDirty])

  const words = form.amount > 0 && cur ? num2words(form.amount, cur) : ''

  const showCheque = form.payMethod === 'Cheque'
  const showBank = form.payMethod === 'Cheque' || form.payMethod === 'Bank Transfer'
  const showTransDate = form.payMethod === 'Cheque' || form.payMethod === 'Bank Transfer'

  const handleSave = async () => {
    if (!co) { showToast('No active company.', 'err'); return }
    if (!form.recNo.trim()) { showToast('Receipt number is required.', 'err'); return }

    const editingId = state.editingDoc?.type === 'rec' ? state.editingDoc.id : null
    const dupe = state.receipts.find(
      (r) => r.recNo === form.recNo && r.companyId === co.id && r.id !== editingId
    )
    if (dupe) { showToast('Receipt number already exists.', 'err'); return }

    try {
      await createReceipt(co, {
        recNo: form.recNo,
        date: form.date,
        receivedFrom: form.receivedFrom,
        amount: form.amount,
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

      setEditing(null)
      setIsEditing(false)
      setForm(emptyForm())
      markClean()
      showToast(editingId ? 'Receipt updated!' : 'Receipt saved!')
    } catch {
      showToast('Failed to save receipt.', 'err')
    }
  }

  useKeyboardShortcuts({ s: handleSave, enter: handleSave })

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
                  <label className="text-xs font-medium text-[var(--color-text2)]">Receipt No.</label>
                  <input value={form.recNo} onChange={(e) => set('recNo', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Date</label>
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Received From</label>
                <input value={form.receivedFrom} onChange={(e) => set('receivedFrom', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Amount</label>
                  <input type="number" min="0" step="0.001" value={form.amount} onChange={(e) => set('amount', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Words</label>
                  <input readOnly value={words} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm" />
                </div>
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
        </div>

        <div className="space-y-4">
          <ReceiptSummary amount={form.amount} words={words} dp={decimals} curSymbol={cur?.symbol || ''} />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} className="justify-center w-full">
              {isEditing ? 'Update Receipt' : 'Save Receipt'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
