import { useState, useRef } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { defCompany } from '@/utils/defCompany'
import { CUR_PRESETS } from '@/utils/currencyPresets'
import { Button } from '@/components/ui/Button'

export function WelcomeOverlay({ onDone }: { onDone: () => void }) {
  const { saveCompany, setActive } = useApp()
  const { showToast } = useUI()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    sub: '',
    subAr: '',
    tel: '',
    mob: '',
    email: '',
    cr: '',
    loc: '',
    currency: 'OMR',
  })
  const [error, setError] = useState('')

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const completeSetup = async () => {
    if (!form.name.trim()) { setError('Company name is required.'); return }
    setError('')
    const co = defCompany(form.name.trim())
    co.nameAr = form.nameAr
    co.sub = form.sub
    co.subAr = form.subAr
    co.tel = form.tel
    co.mob = form.mob
    co.email = form.email
    co.cr = form.cr
    co.loc = form.loc
    co.currency = { ...CUR_PRESETS[form.currency as keyof typeof CUR_PRESETS] }
    co.invNext = 1
    co.recNext = 1
    await saveCompany(co)
    setActive(co.id)
    onDone()
    showToast('Company created!')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (Array.isArray(data.companies)) {
        for (const c of data.companies) await saveCompany(c)
        if (data.invoices) for (const i of data.invoices) await saveCompany(i) // defer to context
        showToast('Data imported!')
        onDone()
      }
    } catch {
      showToast('Invalid backup file', 'err')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-start sm:items-center justify-center bg-[var(--color-page-bg)] p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[var(--color-card)] rounded-2xl shadow-lg p-5 sm:p-8 my-4">
        <div className="flex justify-center mb-4">
          <span className="text-4xl text-[var(--color-primary)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>
          </span>
        </div>
        <h1 className="text-xl font-bold text-center mb-1">Welcome to invoicekitz</h1>
        <p className="text-sm text-[var(--color-text2)] text-center mb-6">Set up your first company to get started.</p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Company Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Name (Arabic)</label>
              <input value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Subtitle</label>
              <input value={form.sub} onChange={(e) => set('sub', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Subtitle (Arabic)</label>
              <input value={form.subAr} onChange={(e) => set('subAr', e.target.value)} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Telephone</label>
              <input value={form.tel} onChange={(e) => set('tel', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Mobile</label>
              <input value={form.mob} onChange={(e) => set('mob', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">Email</label>
              <input value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text2)]">C.R. Number</label>
              <input value={form.cr} onChange={(e) => set('cr', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text2)]">Location / Address</label>
            <input value={form.loc} onChange={(e) => set('loc', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text2)]">Currency</label>
            <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]">
              {Object.keys(CUR_PRESETS).map((k) => (
                <option key={k} value={k}>{k} - {CUR_PRESETS[k as keyof typeof CUR_PRESETS].name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red mt-2">{error}</p>}

        <Button className="w-full mt-5 justify-center" onClick={completeSetup}>
          Save &amp; Get Started
        </Button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text3)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <Button variant="outline" className="w-full justify-center" onClick={() => fileRef.current?.click()}>
          Import from File
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  )
}
