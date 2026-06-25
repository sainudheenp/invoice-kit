import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { Card, CardHeader, Button, Modal } from '@/components/ui'
import { Svg } from '@/icons'
import { CUR_PRESETS } from '@/utils/currencyPresets'
import { defCompany } from '@/utils/defCompany'
import { sampleInvData, sampleRecData, sampleQuotData, INV_TEMPLATES, REC_TEMPLATES, QUOT_TEMPLATES } from '@/templates'
import { applyWatermark } from '@/templates/registry'
import type { Company } from '@/types/company'

const SECTIONS = [
  { id: 'profiles', label: 'Profiles' },
  { id: 'company', label: 'Company' },
  { id: 'contact', label: 'Contact' },
  { id: 'branding', label: 'Branding' },
  { id: 'currency', label: 'Currency' },
  { id: 'tax', label: 'Tax & Banking' },
  { id: 'documents', label: 'Documents' },
  { id: 'backup', label: 'Backup' },
  { id: 'theme', label: 'Theme' },
  { id: 'danger', label: 'Danger Zone' },
] as const

function parseCo(c: Company) {
  return {
    name: c.name, nameAr: c.nameAr, sub: c.sub, subAr: c.subAr,
    tel: c.tel, fax: c.fax, mob: c.mob, email: c.email, cr: c.cr, pobox: c.pobox, loc: c.loc, website: c.website,
    pcolor: c.pcolor, acolor: c.acolor,
    curCode: c.currency.code, curSym: c.currency.symbol, curName: c.currency.name, curNamePl: c.currency.namePl,
    curSub: c.currency.sub, curSubPl: c.currency.subPl, curSubPer: String(c.currency.subPer),
    vatReg: c.vatReg, vatPct: String(c.vatPct),
    bankName: c.bankName, bankAccName: c.bankAccName, bankAcc: c.bankAcc, bankIban: c.bankIban, bankSwift: c.bankSwift, bankBranch: c.bankBranch,
    invPref: c.invPref, invNext: String(c.invNext), recPref: c.recPref, recNext: String(c.recNext),
    quotPref: c.quotPref, quotNext: String(c.quotNext),
    invNotes: c.invNotes, invTerms: c.invTerms, invFooter: c.invFooter, recBeing: c.recBeing,
    invTemplate: c.invTemplate, recTemplate: c.recTemplate, quotTemplate: c.quotTemplate, watermark: c.watermark,
    showArabic: c.showArabic,
    logo: c.logo, seal: c.seal, signature: c.signature,
  }
}

const TEMPLATE_OPTIONS = ['classic', 'modern', 'compact', 'minimal', 'elegant', 'bold', 'professional']
const WATERMARK_OPTIONS = ['', 'Draft', 'Paid', 'Sample', 'Copy']

export default function Settings() {
  const { state, getCo, saveCompany, deleteCompany, setActive, resetAll, dispatch } = useApp()
  const { ui, toggleDark, showToast, showResetModal, hideResetModal, showPreview } = useUI()
  const co = getCo()
  const [activeSection, setActiveSection] = useState('profiles')
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState<'ok' | 'err'>('ok')
  const [resetConfirm, setResetConfirm] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState(co ? parseCo(co) : null)

  useEffect(() => {
    if (co) setForm(parseCo(co))
  }, [co?.id])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      const sections = el.querySelectorAll<HTMLElement>('[data-section]')
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect()
        if (rect.top <= 120) setActiveSection(sec.dataset.section || 'profiles')
      }
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  if (!co || !form) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--color-text2)]">No company selected.</p>
        </div>
      </div>
    )
  }

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((f) => f ? { ...f, [field]: value } : f)

  const handleSave = async () => {
    if (!form) return
    if (!form.name.trim()) { setStatusType('err'); setStatus('Company name is required.'); setTimeout(() => setStatus(''), 3000); return }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setStatusType('err'); setStatus('Invalid email format.'); setTimeout(() => setStatus(''), 3000); return }
    const subPer = parseInt(form.curSubPer) || 0
    if (subPer < 1) { setStatusType('err'); setStatus('Sub-units per unit must be at least 1.'); setTimeout(() => setStatus(''), 3000); return }
    const updated: Company = {
      ...co,
      name: form.name, nameAr: form.nameAr, sub: form.sub, subAr: form.subAr,
      tel: form.tel, fax: form.fax, mob: form.mob, email: form.email, cr: form.cr, pobox: form.pobox, loc: form.loc, website: form.website,
      pcolor: form.pcolor, acolor: form.acolor,
      currency: {
        code: form.curCode, symbol: form.curSym, name: form.curName, namePl: form.curNamePl,
        sub: form.curSub, subPl: form.curSubPl, subPer,
      },
      vatReg: form.vatReg, vatPct: parseFloat(form.vatPct) || 0,
      bankName: form.bankName, bankAccName: form.bankAccName, bankAcc: form.bankAcc, bankIban: form.bankIban, bankSwift: form.bankSwift, bankBranch: form.bankBranch,
      invPref: form.invPref, invNext: parseInt(form.invNext) || 1, recPref: form.recPref, recNext: parseInt(form.recNext) || 1,
      quotPref: form.quotPref, quotNext: parseInt(form.quotNext) || 1,
      invNotes: form.invNotes, invTerms: form.invTerms, invFooter: form.invFooter, recBeing: form.recBeing,
      invTemplate: form.invTemplate, recTemplate: form.recTemplate, quotTemplate: form.quotTemplate, watermark: form.watermark,
      showArabic: form.showArabic,
      logo: form.logo, seal: form.seal, signature: form.signature,
      updatedAt: Date.now(),
    }
    await saveCompany(updated)
    setStatusType('ok')
    setStatus('Settings saved.')
    setTimeout(() => setStatus(''), 3000)
  }

  const handleCurrencyPreset = (preset: string) => {
    const cur = CUR_PRESETS[preset as keyof typeof CUR_PRESETS]
    if (!cur) return
    set('curCode', cur.code)
    set('curSym', cur.symbol)
    set('curName', cur.name)
    set('curNamePl', cur.namePl)
    set('curSub', cur.sub)
    set('curSubPl', cur.subPl)
    set('curSubPer', String(cur.subPer))
  }

  const handleUpload = (field: 'logo' | 'seal' | 'signature') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'err'); return }
      const reader = new FileReader()
      reader.onload = () => {
        set(field, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const applyPreset = () => {
    const val = (document.getElementById('curPresetSelect') as HTMLSelectElement)?.value
    if (val) handleCurrencyPreset(val)
  }

  const handleNewCompany = async () => {
    const c = defCompany('New Company ' + (state.companies.length + 1))
    await saveCompany(c)
    setActive(c.id)
    showToast('Company created.')
  }

  const handleDeleteCompany = async () => {
    if (state.companies.length < 2) { showToast('Need at least one company.', 'err'); return }
    if (!confirm(`Delete "${co.name}" and all its documents?`)) return
    await deleteCompany(co.id)
    setActive(state.companies.find((c) => c.id !== co.id)?.id || '')
    showToast('Company deleted.')
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `open_invoice_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (Array.isArray(data.companies)) {
          for (const c of data.companies) await saveCompany(c)
          if (data.invoices) for (const i of data.invoices) dispatch({ type: 'UPSERT_INVOICE', payload: i })
          if (data.receipts) for (const r of data.receipts) dispatch({ type: 'UPSERT_RECEIPT', payload: r })
          if (data.quotations) for (const q of data.quotations) dispatch({ type: 'UPSERT_QUOTATION', payload: q })
          showToast('Data imported!')
        }
      } catch { showToast('Invalid file.', 'err') }
    }
    reader.readAsText(file)
  }

  const handleReset = async () => {
    if (resetConfirm !== co.name) { showToast('Name does not match.', 'err'); return }
    await resetAll()
    hideResetModal()
    setResetConfirm('')
    window.location.reload()
  }

  const handlePreview = (type: 'inv' | 'rec' | 'quot', tpl: string) => {
    const sampleCo = { ...co }
    if (type === 'inv') sampleCo.invTemplate = tpl
    else if (type === 'rec') sampleCo.recTemplate = tpl
    else sampleCo.quotTemplate = tpl

    let html = ''
    if (type === 'inv') {
      const data = sampleInvData(sampleCo)
      if (!data) { showToast('Cannot generate preview.', 'err'); return }
      const fn = INV_TEMPLATES[tpl] || INV_TEMPLATES.classic
      html = applyWatermark(fn(data), sampleCo.watermark)
    } else if (type === 'rec') {
      const data = sampleRecData(sampleCo)
      if (!data) { showToast('Cannot generate preview.', 'err'); return }
      const fn = REC_TEMPLATES[tpl] || REC_TEMPLATES.classic
      html = applyWatermark(fn(data), sampleCo.watermark)
    } else {
      const data = sampleQuotData(sampleCo)
      if (!data) { showToast('Cannot generate preview.', 'err'); return }
      const fn = QUOT_TEMPLATES[tpl] || QUOT_TEMPLATES.classic
      html = applyWatermark(fn(data), sampleCo.watermark)
    }

    showPreview(html)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--color-text2)]">Manage your company and preferences.</p>
      </div>

      <div className="flex gap-5">
        {/* Settings Nav */}
        <nav className="hidden md:flex flex-col gap-1 w-48 shrink-0 sticky top-4 self-start">
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#settings-${sec.id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(`settings-${sec.id}`)?.scrollIntoView({ behavior: 'smooth' }) }}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                activeSection === sec.id ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium' : 'text-[var(--color-text2)] hover:bg-[var(--color-input-bg)]'
              }`}
            >
              {sec.label}
            </a>
          ))}
        </nav>

        {/* Settings Content */}
        <div ref={scrollRef} className="flex-1 space-y-5 max-w-3xl overflow-y-auto">
          {/* Company Profiles */}
          <Card id="settings-profiles" data-section="profiles">
            <CardHeader><h2 className="text-sm font-semibold">Company Profiles</h2></CardHeader>
            <div className="p-5">
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={co.id}
                  onChange={(e) => { setActive(e.target.value); setActiveSection('profiles') }}
                  className="px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                >
                  {state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Button size="sm" onClick={handleNewCompany}>+ New</Button>
                <Button size="sm" variant="danger" onClick={handleDeleteCompany}>Delete</Button>
                <Button size="sm" variant="info" onClick={handleExport}>Export</Button>
                <Button size="sm" variant="orange" onClick={() => document.getElementById('importFileInput')?.click()}>Import</Button>
                <input id="importFileInput" type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>
            </div>
          </Card>

          {/* Company Details */}
          <Card id="settings-company" data-section="company">
            <CardHeader><h2 className="text-sm font-semibold">Company Details</h2></CardHeader>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Company Name (EN)</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Company Name (AR)</label>
                  <input value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Subtitle (EN)</label>
                  <input value={form.sub} onChange={(e) => set('sub', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Subtitle (AR)</label>
                  <input value={form.subAr} onChange={(e) => set('subAr', e.target.value)} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" />
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card id="settings-contact" data-section="contact">
            <CardHeader><h2 className="text-sm font-semibold">Contact Information</h2></CardHeader>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Telephone</label><input value={form.tel} onChange={(e) => set('tel', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Fax</label><input value={form.fax} onChange={(e) => set('fax', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Mobile</label><input value={form.mob} onChange={(e) => set('mob', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Email</label><input value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">C.R. Number</label><input value={form.cr} onChange={(e) => set('cr', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">P.O. Box</label><input value={form.pobox} onChange={(e) => set('pobox', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div className="col-span-2"><label className="text-xs font-medium text-[var(--color-text2)]">Location</label><input value={form.loc} onChange={(e) => set('loc', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div className="col-span-2"><label className="text-xs font-medium text-[var(--color-text2)]">Website</label><input value={form.website} onChange={(e) => set('website', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
              </div>
            </div>
          </Card>

          {/* Branding */}
          <Card id="settings-branding" data-section="branding">
            <CardHeader><h2 className="text-sm font-semibold">Branding</h2></CardHeader>
            <div className="p-5 space-y-4">
              {(['logo', 'seal', 'signature'] as const).map((field) => (
                <div key={field} className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center overflow-hidden bg-[var(--color-input-bg)]">
                    {form[field] ? <img src={form[field]} alt="" className="max-w-full max-h-full object-contain" /> : <span className="text-xs text-[var(--color-text3)] capitalize">{field}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpload(field)}>Upload</Button>
                    {field === 'logo' && (
                      <Button size="sm" variant="outline" onClick={() => {
                        const svg = prompt('Paste SVG code:')
                        if (svg) set('logo', 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))))
                      }}>SVG</Button>
                    )}
                    {form[field] && <Button size="sm" variant="danger" onClick={() => set(field, '')}>X</Button>}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.pcolor} onChange={(e) => set('pcolor', e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--color-input-border)] cursor-pointer" />
                    <span className="text-xs text-[var(--color-text2)]">{form.pcolor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text2)]">Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.acolor} onChange={(e) => set('acolor', e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--color-input-border)] cursor-pointer" />
                    <span className="text-xs text-[var(--color-text2)]">{form.acolor}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Currency */}
          <Card id="settings-currency" data-section="currency">
            <CardHeader><h2 className="text-sm font-semibold">Currency</h2></CardHeader>
            <div className="p-5 space-y-3">
              <div className="flex gap-2 items-center">
                <select id="curPresetSelect" defaultValue="" className="px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]">
                  <option value="" disabled>Presets</option>
                  {Object.keys(CUR_PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <Button size="sm" onClick={applyPreset}>Apply</Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Code</label><input value={form.curCode} onChange={(e) => set('curCode', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Symbol</label><input value={form.curSym} onChange={(e) => set('curSym', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Sub-units per unit</label><input value={form.curSubPer} onChange={(e) => set('curSubPer', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Name (singular)</label><input value={form.curName} onChange={(e) => set('curName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Name (plural)</label><input value={form.curNamePl} onChange={(e) => set('curNamePl', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Sub-unit (singular)</label><input value={form.curSub} onChange={(e) => set('curSub', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Sub-unit (plural)</label><input value={form.curSubPl} onChange={(e) => set('curSubPl', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
              </div>
            </div>
          </Card>

          {/* Tax & Banking */}
          <Card id="settings-tax" data-section="tax">
            <CardHeader><h2 className="text-sm font-semibold">Tax &amp; Banking</h2></CardHeader>
            <div className="p-5 space-y-4">
              <h3 className="text-xs font-semibold text-[var(--color-text2)] uppercase">VAT</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text2)]">VAT Reg No.</label><input value={form.vatReg} onChange={(e) => set('vatReg', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Default VAT %</label><input type="number" min="0" step="0.01" value={form.vatPct} onChange={(e) => set('vatPct', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
              </div>
              <h3 className="text-xs font-semibold text-[var(--color-text2)] uppercase">Bank Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Bank Name</label><input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Account Name</label><input value={form.bankAccName} onChange={(e) => set('bankAccName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Account No.</label><input value={form.bankAcc} onChange={(e) => set('bankAcc', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">IBAN</label><input value={form.bankIban} onChange={(e) => set('bankIban', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">SWIFT</label><input value={form.bankSwift} onChange={(e) => set('bankSwift', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Branch</label><input value={form.bankBranch} onChange={(e) => set('bankBranch', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
              </div>
            </div>
          </Card>

          {/* Document Settings */}
          <Card id="settings-documents" data-section="documents">
            <CardHeader><h2 className="text-sm font-semibold">Document Settings</h2></CardHeader>
            <div className="p-5 space-y-4">
              <h3 className="text-xs font-semibold text-[var(--color-text2)] uppercase">Numbering</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Invoice Prefix</label><input value={form.invPref} onChange={(e) => set('invPref', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Next Invoice #</label><input value={form.invNext} onChange={(e) => set('invNext', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Receipt Prefix</label><input value={form.recPref} onChange={(e) => set('recPref', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Next Receipt #</label><input value={form.recNext} onChange={(e) => set('recNext', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Quotation Prefix</label><input value={form.quotPref} onChange={(e) => set('quotPref', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
                <div><label className="text-xs font-medium text-[var(--color-text2)]">Next Quotation #</label><input value={form.quotNext} onChange={(e) => set('quotNext', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
              </div>
              <h3 className="text-xs font-semibold text-[var(--color-text2)] uppercase">Defaults</h3>
              <div><label className="text-xs font-medium text-[var(--color-text2)]">Invoice Notes</label><textarea value={form.invNotes} onChange={(e) => set('invNotes', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none" /></div>
              <div><label className="text-xs font-medium text-[var(--color-text2)]">Invoice Terms</label><textarea value={form.invTerms} onChange={(e) => set('invTerms', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none" /></div>
              <div><label className="text-xs font-medium text-[var(--color-text2)]">Invoice Footer</label><textarea value={form.invFooter} onChange={(e) => set('invFooter', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none" /></div>
              <div><label className="text-xs font-medium text-[var(--color-text2)]">Receipt Purpose</label><input value={form.recBeing} onChange={(e) => set('recBeing', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]" /></div>
              <h3 className="text-xs font-semibold text-[var(--color-text2)] uppercase">Templates &amp; Watermark</h3>

              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Invoice Template</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const sel = form.invTemplate === t
                    return (
                      <button key={t} onClick={() => sel ? handlePreview('inv', t) : set('invTemplate', t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          sel
                            ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] border-[var(--color-primary)]'
                            : 'bg-[var(--color-input-bg)] text-[var(--color-text2)] border-[var(--color-input-border)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {sel && <span className="ml-1.5 text-[10px] opacity-70">Preview</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Receipt Template</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const sel = form.recTemplate === t
                    return (
                      <button key={t} onClick={() => sel ? handlePreview('rec', t) : set('recTemplate', t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          sel
                            ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] border-[var(--color-primary)]'
                            : 'bg-[var(--color-input-bg)] text-[var(--color-text2)] border-[var(--color-input-border)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {sel && <span className="ml-1.5 text-[10px] opacity-70">Preview</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Quotation Template</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const sel = form.quotTemplate === t
                    return (
                      <button key={t} onClick={() => sel ? handlePreview('quot', t) : set('quotTemplate', t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          sel
                            ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] border-[var(--color-primary)]'
                            : 'bg-[var(--color-input-bg)] text-[var(--color-text2)] border-[var(--color-input-border)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {sel && <span className="ml-1.5 text-[10px] opacity-70">Preview</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">Show Arabic Text</div>
                  <div className="text-xs text-[var(--color-text3)]">Displays Arabic company name and labels in Classic templates</div>
                </div>
                <button
                  onClick={() => set('showArabic', !form.showArabic)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${form.showArabic ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.showArabic ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text2)]">Watermark</label>
                <select value={form.watermark} onChange={(e) => set('watermark', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]">
                  {WATERMARK_OPTIONS.map((w) => <option key={w} value={w}>{w || '(none)'}</option>)}
                </select>
              </div>

              <Button size="sm" onClick={handleSave} className="self-start">Save</Button>
            </div>
          </Card>

          {/* Backup & Restore */}
          <Card id="settings-backup" data-section="backup">
            <CardHeader><h2 className="text-sm font-semibold">Backup &amp; Restore</h2></CardHeader>
            <div className="p-5">
              <p className="text-xs text-[var(--color-text2)] mb-4">Download all your data as a JSON file or restore from a previous backup.</p>
              <div className="flex gap-2">
                <Button onClick={handleExport}>Full Backup</Button>
                <Button variant="orange" onClick={() => document.getElementById('restoreInput')?.click()}>Restore from Backup</Button>
                <input id="restoreInput" type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>
            </div>
          </Card>

          {/* Theme */}
          <Card id="settings-theme" data-section="theme">
            <CardHeader><h2 className="text-sm font-semibold">Theme</h2></CardHeader>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-sm">Dark Mode</span>
                <button onClick={toggleDark} className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${ui.dark ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${ui.dark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card id="settings-danger" data-section="danger" className="border-red/30 bg-red-bg/30">
            <CardHeader><h2 className="text-sm font-semibold text-red">Danger Zone</h2></CardHeader>
            <div className="p-5">
              <p className="text-xs text-[var(--color-text2)] mb-4">This will permanently delete all your companies, invoices, receipts, and quotations. This action cannot be undone.</p>
              <Button variant="danger" onClick={showResetModal}>Reset All Data</Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-3 pb-8">
            <Button onClick={handleSave}>Save Settings</Button>
            {status && <span className={`text-xs px-3 py-1 rounded-full ${statusType === 'ok' ? 'bg-green-bg text-green-dark' : 'bg-red-bg text-red'}`}>{status}</span>}
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      <Modal open={ui.resetModal} onClose={hideResetModal}>
        <div className="text-center">
          <Svg name="warning" className="text-red mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Reset All Data?</h2>
          <p className="text-xs text-[var(--color-text2)] mb-4">Type <strong>{co.name}</strong> to confirm.</p>
          <input value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} placeholder={co.name} className="w-full px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] mb-3" />
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={hideResetModal}>Cancel</Button>
            <Button variant="danger" disabled={resetConfirm !== co.name} onClick={handleReset}>Delete Everything</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
