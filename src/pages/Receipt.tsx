import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { DocWizard, type WizardStep } from '@/components/ui/DocWizard'
import { CardHeader, Field, Input, Textarea, Select, CustomerPicker, ExportActions, Button } from '@/components/ui'
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

const STEPS: WizardStep[] = [
  { key: 'details', label: 'Details', icon: 'file' },
  { key: 'from', label: 'Received From', icon: 'users' },
  { key: 'amount', label: 'Amount', icon: 'box' },
  { key: 'review', label: 'Review', icon: 'check' },
]

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
  const navigate = useNavigate()
  const { state, getCo, saveCompany, createReceipt, setEditing } = useApp()
  const { markDirty, markClean, showToast, showPreview, showPdfOverlay, hidePdfOverlay } = useUI()
  const co = getCo()
  const [form, setForm] = useState<ReceiptFormState>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const cur = co?.currency
  const decimals = cur ? getDp(cur.subPer) : 2

  useEffect(() => {
    if (!state.editingDoc || state.editingDoc.type !== 'rec') return
    const rec = state.receipts.find((r) => r.id === state.editingDoc!.id)
    if (!rec) return
    setIsEditing(true)
    setStep(3)
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
      setSaving(true)
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

  const goNext = () => {
    if (step === 0) {
      if (!form.recNo.trim()) { showToast('Receipt number is required.', 'err'); return }
      setStep(1)
      return
    }
    if (step === 1) {
      if (!form.receivedFrom.trim()) { showToast('Received from is required.', 'err'); return }
      setStep(2)
      return
    }
    if (step === 2) {
      if (amount <= 0) { showToast('Amount must be greater than zero.', 'err'); return }
      setStep(3)
      return
    }
    handleSave()
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

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="surface" key="r0">
            <CardHeader>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center"><Svg name="file" className="w-4 h-4" /></span>
                Receipt Details
              </h2>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Receipt No." required>
                  <Input value={form.recNo} onChange={(e) => set('recNo', e.target.value)} placeholder="RCT-0001" />
                </Field>
                <Field label="Date">
                  <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </Field>
              </div>

              <div>
                <hr className="border-[var(--color-border)] my-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text3)] mb-3">Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Payment Method">
                    <Select value={form.payMethod} onChange={(e) => set('payMethod', e.target.value)}>
                      <option value="">-- Select --</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                      <option>Bank Transfer</option>
                    </Select>
                  </Field>
                  {showCheque && (
                    <Field label="Cheque No.">
                      <Input value={form.chequeNo} onChange={(e) => set('chequeNo', e.target.value)} />
                    </Field>
                  )}
                  {showBank && (
                    <Field label="Bank Name">
                      <Input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
                    </Field>
                  )}
                  {showTransDate && (
                    <Field label="Transaction Date">
                      <Input type="date" value={form.transDate} onChange={(e) => set('transDate', e.target.value)} />
                    </Field>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="surface" key="r1">
            <CardHeader className="flex-col sm:flex-row sm:items-center">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Svg name="users" className="w-4 h-4 text-[var(--color-primary)]" />
                Received From
              </h2>
              <CustomerPicker
                companyId={co?.id || null}
                currentName={form.receivedFrom}
                onPick={(c) => set('receivedFrom', c.name)}
              />
            </CardHeader>
            <div className="p-6 space-y-4">
                <Field label="Payer / Customer" required>
                  <Input value={form.receivedFrom} onChange={(e) => set('receivedFrom', fmtName(e.target.value))} list="recvCustNameList" placeholder="Name of the payer" />
                <datalist id="recvCustNameList">
                  {state.customers.filter((c) => c.companyId === co?.id).map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Receiver Name">
                  <Input value={form.receiver} onChange={(e) => set('receiver', e.target.value)} placeholder="Who received the payment" />
                </Field>
                <Field label="Signatory">
                  <Input value={form.signatory} onChange={(e) => set('signatory', e.target.value)} placeholder="Signer on the receipt" />
                </Field>
              </div>
              <Field label="Being (Purpose)">
                <Textarea value={form.being} onChange={(e) => set('being', e.target.value)} rows={2} placeholder="Reason for the payment..." />
              </Field>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="surface" key="r2">
            <CardHeader>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center"><Svg name="box" className="w-4 h-4" /></span>
                Amount
              </h2>
              {modeSwitch}
            </CardHeader>
            <div className="p-6">
              {form.mode === 'simple' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Amount" required>
                    <Input type="number" min="0" step="0.001" value={form.simpleAmount} onChange={(e) => set('simpleAmount', Math.max(0, parseFloat(e.target.value) || 0))} />
                  </Field>
                  <Field label="Words">
                    <Input readOnly value={words} />
                  </Field>
                </div>
              ) : (
                <ReceiptItems items={form.items} onChange={(items) => set('items', items)} dp={decimals} />
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <div className="flex-1 min-w-[160px] p-4 rounded-2xl bg-[var(--color-input-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text3)]">{form.mode === 'simple' ? 'Amount' : 'Subtotal'}</div>
                  <div className="text-lg font-bold tabular-nums">{cur?.symbol}{amount.toFixed(decimals)}</div>
                </div>
                <div className="flex-1 min-w-[160px] p-4 rounded-2xl bg-[var(--color-input-bg)] border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text3)]">Tax</div>
                  <div className="text-lg font-bold tabular-nums">{cur?.symbol}{totalTax.toFixed(decimals)}</div>
                </div>
                <div className="flex-1 min-w-[160px] p-4 rounded-2xl bg-[var(--color-primary-bg)] border border-[var(--color-primary)]/30">
                  <div className="text-xs font-medium text-[var(--color-primary)]">Total</div>
                  <div className="text-lg font-bold text-[var(--color-primary)] tabular-nums">{cur?.symbol}{grand.toFixed(decimals)}</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div key="r3" className="space-y-5">
            <div className="surface overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-primary-bg)] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs font-medium text-[var(--color-primary)]">Receipt #{form.recNo || '—'}</div>
                  <div className="text-3xl font-bold text-[var(--color-text)] tabular-nums mt-1">{cur?.symbol}{grand.toFixed(decimals)}</div>
                  <div className="text-xs text-[var(--color-text2)] mt-1 italic">{words || 'Set an amount to see it in words'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text3)]">{form.date}</div>
                  {form.payMethod && <div className="text-xs font-medium text-[var(--color-primary)]">{form.payMethod}</div>}
                  <div className="text-sm font-semibold text-[var(--color-text)] mt-1 truncate max-w-[200px]">{form.receivedFrom || 'No payer'}</div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Summary</h3>
                  <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                    <div className="flex justify-between px-5 py-3 text-sm border-b border-[var(--color-border)]">
                      <span className="text-[var(--color-text2)]">Subtotal</span>
                      <span className="font-medium tabular-nums">{cur?.symbol}{amount.toFixed(decimals)}</span>
                    </div>
                    {totalTax > 0 && (
                      <div className="flex justify-between px-5 py-3 text-sm border-b border-[var(--color-border)]">
                        <span className="text-[var(--color-text2)]">Total Tax</span>
                        <span className="font-medium tabular-nums">{cur?.symbol}{totalTax.toFixed(decimals)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-5 py-3 text-base font-bold">
                      <span>Total</span>
                      <span className="tabular-nums">{cur?.symbol}{grand.toFixed(decimals)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Being (Purpose)</h3>
                    <Textarea value={form.being} onChange={(e) => set('being', e.target.value)} rows={3} placeholder="Purpose of this payment..." />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Save & Export</h3>
                  <ExportActions
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
      title={isEditing ? 'Edit Receipt' : 'New Receipt'}
      subtitle="Create a receipt voucher in a few easy steps."
      badge={badge}
      onBack={() => navigate('/')}
      nextLabel={step < 3 ? 'Continue' : saving ? 'Saving…' : (isEditing ? 'Update Receipt' : 'Save Receipt')}
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