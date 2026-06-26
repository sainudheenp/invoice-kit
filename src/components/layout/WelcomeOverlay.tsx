import { useState, useRef } from 'react'
import { useApp } from '@/store/AppContext'
import { db } from '@/db'
import { useUI } from '@/store/UIContext'
import { defCompany } from '@/utils/defCompany'
import { CUR_PRESETS } from '@/utils/currencyPresets'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const IMAGE_INFO = {
  logo: { dim: '200\u00D7200px', desc: 'Square, transparent background', note: 'Displays at 80\u00D780px on documents' },
  seal: { dim: '300\u00D7300px', desc: 'Square, transparent background', note: 'Displays at 120\u00D7120px on documents' },
  signature: { dim: '400\u00D7150px', desc: 'Wide, transparent background', note: 'Displays at 140\u00D770px on documents' },
} as const

const STEPS = ['Company', 'Contact', 'Branding'] as const

export function WelcomeOverlay({ onDone }: { onDone: () => void }) {
  const { saveCompany, setActive, state } = useApp()
  const { showToast } = useUI()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [uploadField, setUploadField] = useState<'logo' | 'seal' | 'signature' | null>(null)
  const [dragOverField, setDragOverField] = useState<'logo' | 'seal' | 'signature' | null>(null)

  const [form, setForm] = useState({
    name: '', nameAr: '', sub: '', subAr: '',
    tel: '', mob: '', email: '', cr: '', loc: '',
    currency: 'OMR',
    logo: '', seal: '', signature: '',
    pcolor: '#D97706', acolor: '#78716C',
  })
  const [error, setError] = useState('')

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleUpload = (field: 'logo' | 'seal' | 'signature') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'err'); return }
      const reader = new FileReader()
      reader.onload = () => { set(field, reader.result as string) }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleDrop = (field: 'logo' | 'seal' | 'signature', e: React.DragEvent) => {
    e.preventDefault()
    setDragOverField(null)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'err'); return }
    const reader = new FileReader()
    reader.onload = () => { set(field, reader.result as string) }
    reader.readAsDataURL(file)
  }

  const completeStep0 = async () => {
    if (!form.name.trim()) { setError('Company name is required.'); return }
    setError('')
    const co = defCompany(form.name.trim())
    co.nameAr = form.nameAr
    co.sub = form.sub
    co.subAr = form.subAr
    await saveCompany(co)
    setCompanyId(co.id)
    setStep(1)
  }

  const completeStep1 = async () => {
    if (!companyId) { setStep(2); return }
    const c = state.companies.find((x) => x.id === companyId)
    if (!c) { setStep(2); return }
    c.tel = form.tel; c.mob = form.mob; c.email = form.email; c.cr = form.cr; c.loc = form.loc
    c.currency = { ...CUR_PRESETS[form.currency as keyof typeof CUR_PRESETS] }
    await saveCompany(c)
    setStep(2)
  }

  const completeStep2 = async () => {
    if (!companyId) { finish(); return }
    const c = state.companies.find((x) => x.id === companyId)
    if (!c) { finish(); return }
    c.logo = form.logo; c.seal = form.seal; c.signature = form.signature
    c.pcolor = form.pcolor; c.acolor = form.acolor
    await saveCompany(c)
    setActive(companyId)
    finish()
  }

  const finish = () => {
    if (companyId) setActive(companyId)
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
        if (data.invoices) for (const i of data.invoices) await db.invoices.put(i)
        if (data.receipts) for (const r of data.receipts) await db.receipts.put(r)
        if (data.quotations) for (const q of data.quotations) await db.quotations.put(q)
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
        <p className="text-sm text-[var(--color-text2)] text-center mb-6">Set up your company to get started.</p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'border-2 border-[var(--color-border)] text-[var(--color-text3)]'
                }`}>
                  {i < step ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[10px] mt-1 ${
                  i <= step ? 'text-[var(--color-text1)] font-medium' : 'text-[var(--color-text3)]'
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 sm:w-16 h-0.5 mx-1 sm:mx-2 -mt-4 ${
                  i < step ? 'bg-green-500' : 'bg-[var(--color-border)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
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
            {error && <p className="text-xs text-red">{error}</p>}
            <Button className="w-full justify-center mt-2" onClick={completeStep0}>Continue</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Telephone</label>
                <input value={form.tel} onChange={(e) => set('tel', e.target.value)} autoFocus className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
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
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Skip &rarr;</Button>
              <Button className="flex-1" onClick={completeStep1}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {(['logo', 'seal', 'signature'] as const).map((field) => (
              <div key={field}>
                <label className="text-xs font-medium text-[var(--color-text2)] capitalize mb-1.5 block">{field}</label>
                <div
                  onClick={() => setUploadField(field)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverField(field) }}
                  onDragLeave={() => setDragOverField(null)}
                  onDrop={(e) => handleDrop(field, e)}
                  className={`relative w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-[var(--color-input-bg)] cursor-pointer transition-all ${
                    dragOverField === field
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                      : form[field]
                        ? 'border-[var(--color-primary)]/30'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  {form[field] ? (
                    <img src={form[field]} alt="" className="max-w-full max-h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[var(--color-text3)]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span className="text-xs">Click or drop an image</span>
                    </div>
                  )}
                </div>
                {form[field] && (
                  <button onClick={() => set(field, '')} className="text-xs text-red hover:brightness-110 transition-colors cursor-pointer mt-1">Remove</button>
                )}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Primary Color</label>
                <div className="flex gap-2 items-center mt-1">
                  <input type="color" value={form.pcolor} onChange={(e) => set('pcolor', e.target.value)} className="w-9 h-9 rounded-lg border border-[var(--color-input-border)] cursor-pointer" />
                  <span className="text-xs text-[var(--color-text2)]">{form.pcolor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Accent Color</label>
                <div className="flex gap-2 items-center mt-1">
                  <input type="color" value={form.acolor} onChange={(e) => set('acolor', e.target.value)} className="w-9 h-9 rounded-lg border border-[var(--color-input-border)] cursor-pointer" />
                  <span className="text-xs text-[var(--color-text2)]">{form.acolor}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button variant="outline" className="flex-1" onClick={finish}>Skip &rarr;</Button>
              <Button className="flex-1" onClick={completeStep2}>Get Started</Button>
            </div>
          </div>
        )}

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

      {/* Upload Info Modal */}
      <Modal open={uploadField !== null} onClose={() => setUploadField(null)} maxW="540px">
        {uploadField && (() => {
          const info = IMAGE_INFO[uploadField]
          const full = [form.name, form.sub].filter(Boolean).join(' — ')
          const prompt = {
            logo: `If I have uploaded my logo, make its background transparent, enhance clarity, and resize it to 200\u00D7200px for use on invoices. Keep the exact original design. If no logo is uploaded, generate a clean minimalist logo for "${full}" — square 200\u00D7200px, transparent background, professional and simple.`,
            seal: `If I have uploaded my seal, make its background transparent, clean it up, and resize to 300\u00D7300px for document use. Keep the exact original design. If no seal is uploaded, create a professional circular company seal with "${full}" around the edge — square 300\u00D7300px, transparent background.`,
            signature: `If I have uploaded my signature, remove the background, enhance clarity, and resize to 400\u00D7150px for invoices. Keep the exact original design. If none is uploaded, generate an elegant cursive signature for "${full}" on a transparent background, 400\u00D7150px.`,
          }[uploadField]
          return (
            <div>
              <h2 className="text-lg font-bold capitalize mb-1">{uploadField}</h2>
              <p className="text-xs text-[var(--color-text2)] mb-4">{info.dim} &middot; {info.desc} &middot; {info.note}</p>
              {form[uploadField] ? (
                <div className="mb-4 flex items-center justify-center h-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] overflow-hidden">
                  <img src={form[uploadField]} alt="" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text3)] mb-4 italic">No image uploaded yet.</p>
              )}
              <div className="text-xs text-[var(--color-text2)] space-y-1.5 mb-3">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  Open <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">ChatGPT</a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  Upload your existing <strong className="text-[var(--color-text1)] capitalize">{uploadField}</strong> image
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  Copy the prompt below & paste it into ChatGPT
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">4</span>
                  Download the result, then click <strong className="text-[var(--color-text1)]">Choose File</strong> to upload it
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-text2)]">ChatGPT Prompt</label>
                <textarea readOnly rows={4} value={prompt} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-xs text-[var(--color-text1)] outline-none resize-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                <button onClick={() => { navigator.clipboard.writeText(prompt); showToast('Copied!') }} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">Copy Prompt</button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setUploadField(null)}>Cancel</Button>
                <Button onClick={() => { handleUpload(uploadField); setUploadField(null) }}>Choose File</Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
