import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useUI } from '@/store/UIContext'
import { Card, CardHeader, Button, Modal } from '@/components/ui'
import { Svg } from '@/icons'
import { CUR_PRESETS } from '@/utils/currencyPresets'
import { defCompany } from '@/utils/defCompany'
import { exportBackupData, validateBackupFile, createLocalSnapshot, listLocalSnapshots, deleteLocalSnapshot, type BackupPayload } from '@/utils/backup'
import { requestGoogleAccessToken, uploadToAppDataFolder, listAppDataBackups, downloadAppDataFile, deleteAppDataFile, type CloudBackupFile } from '@/utils/googleDrive'
import type { LocalSnapshot } from '@/db'
import { sampleInvData, sampleRecData, sampleQuotData, INV_TEMPLATES, REC_TEMPLATES, QUOT_TEMPLATES, applyWatermark } from '@/templates'
import { resizeImage, IMAGE_MAX_SIZES } from '@/utils/image'
import type { Company } from '@/types/company'

const SECTIONS = [
  { id: 'profiles', label: 'Profiles' },
  { id: 'company', label: 'Company' },
  { id: 'contact', label: 'Contact' },
  { id: 'branding', label: 'Branding' },
  { id: 'currency', label: 'Currency' },
  { id: 'tax', label: 'Tax & Banking' },
  { id: 'documents', label: 'Numbering' },
  { id: 'templates', label: 'Templates' },
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

const TEMPLATE_OPTIONS = ['classic', 'modern', 'professional', 'minimal', 'elegant', 'bold', 'beirak']
const WATERMARK_OPTIONS = ['', 'Draft', 'Paid', 'Sample', 'Copy']

const IMAGE_INFO = {
  logo: { dim: '200\u00D7200px', desc: 'Square, transparent background', note: 'Displays at 80\u00D780px on documents' },
  seal: { dim: '300\u00D7300px', desc: 'Square, transparent background', note: 'Displays at 120\u00D7120px on documents' },
  signature: { dim: '400\u00D7150px', desc: 'Wide, transparent background', note: 'Displays at 140\u00D770px on documents' },
} as const

export default function Settings() {
  const { state, getCo, saveCompany, deleteCompany, setActive, resetAll, restoreBackup } = useApp()
  const { ui, toggleDark, showToast, showResetModal, hideResetModal, showPreview } = useUI()
  const co = getCo()
  const [activeSection, setActiveSection] = useState('profiles')
  const [resetConfirm, setResetConfirm] = useState('')
  const [uploadField, setUploadField] = useState<'logo' | 'seal' | 'signature' | null>(null)
  const [restoreData, setRestoreData] = useState<BackupPayload | null>(null)
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const [cloudBackups, setCloudBackups] = useState<CloudBackupFile[] | null>(null)
  const [loadingCloud, setLoadingCloud] = useState(false)
  const [localSnapshots, setLocalSnapshots] = useState<LocalSnapshot[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const refreshSnapshots = useCallback(async () => {
    const list = await listLocalSnapshots()
    setLocalSnapshots(list)
  }, [])

  useEffect(() => {
    refreshSnapshots()
  }, [refreshSnapshots])

  const handleConnectGoogleDrive = () => {
    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || localStorage.getItem('ik_google_client_id') || ''
    if (!clientId.trim()) {
      showToast('Google Client ID is not configured.', 'err')
      return
    }
    requestGoogleAccessToken(
      clientId.trim(),
      async (token) => {
        setGoogleToken(token)
        showToast('Connected to Google Drive!')
        await handleFetchCloudBackups(token)
      },
      (err) => showToast('Google Connection failed: ' + err, 'err')
    )
  }

  const handleUploadCloudBackup = async () => {
    if (!googleToken) {
      handleConnectGoogleDrive()
      return
    }
    setLoadingCloud(true)
    try {
      const jsonStr = exportBackupData(state)
      await uploadToAppDataFolder(googleToken, jsonStr)
      showToast('Backup saved to Google Drive!')
      await handleFetchCloudBackups(googleToken)
    } catch (err: any) {
      showToast('Cloud backup failed: ' + (err?.message || 'Unknown error'), 'err')
    } finally {
      setLoadingCloud(false)
    }
  }

  const handleFetchCloudBackups = async (token: string) => {
    setLoadingCloud(true)
    try {
      const files = await listAppDataBackups(token)
      setCloudBackups(files)
    } catch (err: any) {
      showToast('Failed to list cloud backups: ' + (err?.message || 'Unknown error'), 'err')
    } finally {
      setLoadingCloud(false)
    }
  }

  const handleRestoreCloudFile = async (fileId: string) => {
    if (!googleToken) return
    setLoadingCloud(true)
    try {
      const jsonStr = await downloadAppDataFile(googleToken, fileId)
      const res = validateBackupFile(jsonStr)
      if (!res.valid || !res.payload) {
        showToast(res.error || 'Invalid cloud backup file.', 'err')
        return
      }
      setRestoreData(res.payload)
    } catch (err: any) {
      showToast('Failed to download cloud backup: ' + (err?.message || 'Unknown error'), 'err')
    } finally {
      setLoadingCloud(false)
    }
  }

  const handleDeleteCloudFile = async (fileId: string) => {
    if (!googleToken) return
    if (!confirm('Are you sure you want to delete this cloud backup?')) return
    setLoadingCloud(true)
    try {
      await deleteAppDataFile(googleToken, fileId)
      showToast('Cloud backup deleted.')
      await handleFetchCloudBackups(googleToken)
    } catch (err: any) {
      showToast('Failed to delete cloud backup: ' + (err?.message || 'Unknown error'), 'err')
    } finally {
      setLoadingCloud(false)
    }
  }

  const handleCreateLocalSnapshot = async () => {
    await createLocalSnapshot(`Manual Snapshot ${new Date().toLocaleTimeString()}`, state)
    await refreshSnapshots()
    showToast('Local snapshot created!')
  }

  const handleDeleteLocalSnapshot = async (id: string) => {
    await deleteLocalSnapshot(id)
    await refreshSnapshots()
    showToast('Snapshot deleted.')
  }

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

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((f) => f ? { ...f, [field]: value } : f)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setSaving(true)
    autoSaveTimer.current = setTimeout(doAutoSave, 500)
  }

  const handleSave = async () => {
    if (!form || !co) return
    if (!form.name.trim()) { showToast('Company name is required.', 'err'); return }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast('Invalid email format.', 'err'); return }
    const subPer = parseInt(form.curSubPer) || 0
    if (subPer < 1) { showToast('Sub-units per unit must be at least 1.', 'err'); return }
    await saveCompany(buildCompany(form, co))
    showToast('Settings saved.')
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

  const formRef = useRef(form)
  formRef.current = form
  const coRef = useRef(co)
  coRef.current = co
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [saving, setSaving] = useState(false)

  const buildCompany = (f: typeof form, c: Company): Company => ({
    ...c,
    name: f.name, nameAr: f.nameAr, sub: f.sub, subAr: f.subAr,
    tel: f.tel, fax: f.fax, mob: f.mob, email: f.email, cr: f.cr, pobox: f.pobox, loc: f.loc, website: f.website,
    pcolor: f.pcolor, acolor: f.acolor,
    currency: {
      code: f.curCode, symbol: f.curSym, name: f.curName, namePl: f.curNamePl,
      sub: f.curSub, subPl: f.curSubPl, subPer: parseInt(f.curSubPer) || 0,
    },
    vatReg: f.vatReg, vatPct: parseFloat(f.vatPct) || 0,
    bankName: f.bankName, bankAccName: f.bankAccName, bankAcc: f.bankAcc, bankIban: f.bankIban, bankSwift: f.bankSwift, bankBranch: f.bankBranch,
    invPref: f.invPref, invNext: parseInt(f.invNext) || 1, recPref: f.recPref, recNext: parseInt(f.recNext) || 1,
    quotPref: f.quotPref, quotNext: parseInt(f.quotNext) || 1,
    invNotes: f.invNotes, invTerms: f.invTerms, invFooter: f.invFooter, recBeing: f.recBeing,
    invTemplate: f.invTemplate, recTemplate: f.recTemplate, quotTemplate: f.quotTemplate, watermark: f.watermark,
    showArabic: f.showArabic,
    logo: f.logo, seal: f.seal, signature: f.signature,
    updatedAt: Date.now(),
  })

  const doAutoSave = useCallback(async () => {
    const f = formRef.current
    const c = coRef.current
    if (!f || !c) return
    const subPer = parseInt(f.curSubPer) || 0
    if (subPer < 1) return
    await saveCompany(buildCompany(f, c))
    setSaving(false)
    showToast('Saved', 'ok', 1500)
  }, [saveCompany, showToast])

  const [dragOverField, setDragOverField] = useState<'logo' | 'seal' | 'signature' | null>(null)

  const handleUpload = (field: 'logo' | 'seal' | 'signature') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'err'); return }
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        const { w, h } = IMAGE_MAX_SIZES[field]
        const resized = await resizeImage(dataUrl, w, h)
        set(field, resized)
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        formRef.current = { ...formRef.current, [field]: resized }
        setSaving(true)
        await doAutoSave()
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
    const jsonStr = exportBackupData(state)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `open_invoice_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded successfully!')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = validateBackupFile(reader.result as string)
      if (!res.valid || !res.payload) {
        showToast(res.error || 'Invalid backup file.', 'err')
        return
      }
      setRestoreData(res.payload)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirmRestore = async (mode: 'merge' | 'replace') => {
    if (!restoreData) return
    try {
      const counts = await restoreBackup(restoreData, mode)
      setRestoreData(null)
      showToast(
        `Restored: ${counts.companies} companies, ${counts.invoices} invoices, ${counts.receipts} receipts, ${counts.quotations} quotations, ${counts.customers} customers, ${counts.products} products`
      )
    } catch (err: any) {
      showToast('Restore failed: ' + (err?.message || 'Unknown error'), 'err')
    }
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
    if (form) { sampleCo.showArabic = form.showArabic; sampleCo.watermark = form.watermark }

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
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--color-text2)]">Manage your company and preferences.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text3)] shrink-0 mt-1">
          <span className={`w-2 h-2 rounded-full transition-colors ${saving ? 'bg-amber-400' : 'bg-green'}`} />
          {saving ? 'Saving...' : 'Saved'}
        </div>
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
                <div key={field}>
                  <label className="text-xs font-medium text-[var(--color-text2)] capitalize mb-1.5 block">{field}</label>
                    <div
                    onClick={() => setUploadField(field)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverField(field) }}
                    onDragLeave={() => setDragOverField(null)}
                    onDrop={async (e) => {
                      e.preventDefault()
                      setDragOverField(null)
                      const file = e.dataTransfer.files?.[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'err'); return }
                      const reader = new FileReader()
                      reader.onload = async () => {
                        const dataUrl = reader.result as string
                        const { w, h } = IMAGE_MAX_SIZES[field]
                        const resized = await resizeImage(dataUrl, w, h)
                        set(field, resized)
                        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
                        formRef.current = { ...formRef.current, [field]: resized }
                        setSaving(true)
                        await doAutoSave()
                      }
                      reader.readAsDataURL(file)
                    }}
                    className={`relative w-full h-28 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-[var(--color-input-bg)] cursor-pointer transition-all duration-200 ${
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
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span className="text-xs">Click or drop an image</span>
                        <span className="text-[10px]">PNG, JPG, SVG &middot; Max 2MB</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {field === 'logo' && (
                      <button
                        onClick={() => {
                          const svg = prompt('Paste SVG code:')
                          if (svg) set('logo', 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))))
                        }}
                        className="text-xs text-[var(--color-text3)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                      >Paste SVG</button>
                    )}
                    {form[field] && (
                      <>
                        <span className="text-xs text-[var(--color-text3)]">&middot;</span>
                        <button onClick={() => set(field, '')} className="text-xs text-red hover:brightness-110 transition-colors cursor-pointer">Remove</button>
                      </>
                    )}
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

          {/* Numbering & Defaults */}
          <Card id="settings-documents" data-section="documents">
            <CardHeader><h2 className="text-sm font-semibold">Numbering &amp; Defaults</h2></CardHeader>
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
            </div>
          </Card>

          {/* Templates */}
          <Card id="settings-templates" data-section="templates">
            <CardHeader><h2 className="text-sm font-semibold">Templates</h2></CardHeader>
            <div className="p-5 space-y-4">
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
                  onClick={() => {
                    const next = !form.showArabic
                    setForm((f) => f ? { ...f, showArabic: next } : f)
                    formRef.current = { ...formRef.current, showArabic: next }
                    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
                    setSaving(true)
                    doAutoSave()
                  }}
                  type="button"
                  role="switch"
                  aria-checked={form.showArabic}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${form.showArabic ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
                >
                  <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.showArabic ? 'translate-x-[18px]' : 'translate-x-0'}`} />
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
            <div className="p-5 space-y-6">
              {/* Local File Backup */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text1)] mb-1">Local File Backup</h3>
                <p className="text-xs text-[var(--color-text2)] mb-3">Download all your data (companies, invoices, receipts, quotations, customers, products) as a JSON file.</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleExport}>Full Backup (.json)</Button>
                  <Button variant="orange" onClick={() => document.getElementById('restoreInput')?.click()}>Restore from Backup File</Button>
                  <input id="restoreInput" type="file" accept=".json" className="hidden" onChange={handleImport} />
                </div>
              </div>

              <div className="h-px bg-[var(--color-border)]" />

              {/* Google Drive Cloud Backup */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold text-[var(--color-text1)] flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 87.3 78" fill="currentColor">
                      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.55z" fill="#0066da"/>
                      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.45-1.2 3-1.2 4.55h27.5z" fill="#00ac47"/>
                      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65c.8-1.45 1.2-3 1.2-4.55h-27.5l13.75 23.8z" fill="#ea4335"/>
                      <path d="m43.65 25 13.75-23.8c-1.4-.8-2.95-1.2-4.55-1.2h-18.4c-1.6 0-3.15.4-4.55 1.2z" fill="#00832d"/>
                      <path d="m59.8 53h27.5c0-1.55-.4-3.1-1.2-4.55l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8z" fill="#ffba00"/>
                    </svg>
                    Google Drive Cloud Backup
                  </h3>
                  {googleToken && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Connected ✓
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--color-text2)] mb-3">
                  Safely store and restore your application backups in Google Drive.
                </p>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!googleToken ? (
                      <Button onClick={handleConnectGoogleDrive} className="text-xs py-2">
                        Connect Google Drive
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleUploadCloudBackup}
                          disabled={loadingCloud}
                          className="text-xs py-2"
                        >
                          {loadingCloud ? 'Processing...' : 'Backup to Google Drive'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleFetchCloudBackups(googleToken)}
                          disabled={loadingCloud}
                          className="text-xs py-2"
                        >
                          Refresh Cloud List
                        </Button>
                      </>
                    )}
                  </div>

                  {cloudBackups && cloudBackups.length > 0 && (
                    <div className="mt-3 border border-[var(--color-border)] rounded-lg overflow-hidden">
                      <div className="bg-[var(--color-input-bg)] px-3 py-2 text-xs font-semibold border-b border-[var(--color-border)] text-[var(--color-text1)]">
                        Cloud Backups ({cloudBackups.length})
                      </div>
                      <div className="divide-y divide-[var(--color-border)] max-h-48 overflow-y-auto">
                        {cloudBackups.map((cb) => (
                          <div key={cb.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-[var(--color-input-bg)] transition-colors">
                            <div className="font-medium text-[var(--color-text1)]">{cb.name}</div>
                            <div className="flex gap-2">
                              <Button variant="orange" size="sm" onClick={() => handleRestoreCloudFile(cb.id)} className="text-[11px] px-2 py-1">Restore</Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteCloudFile(cb.id)} className="text-[11px] px-2 py-1">Delete</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[var(--color-border)]" />

              {/* Local Snapshots Vault */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold text-[var(--color-text1)]">Local Automatic Snapshots Vault</h3>
                  <Button size="sm" variant="outline" onClick={handleCreateLocalSnapshot} className="text-xs py-1">
                    + Create Snapshot Now
                  </Button>
                </div>
                <p className="text-xs text-[var(--color-text2)] mb-3">Automatic local backups stored in IndexedDB for quick 1-click rollback.</p>

                {localSnapshots.length === 0 ? (
                  <p className="text-xs text-[var(--color-text3)] italic">No local snapshots created yet.</p>
                ) : (
                  <div className="border border-[var(--color-border)] rounded-lg overflow-hidden divide-y divide-[var(--color-border)] max-h-44 overflow-y-auto">
                    {localSnapshots.map((snap) => (
                      <div key={snap.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-[var(--color-input-bg)] transition-colors">
                        <div>
                          <div className="font-medium text-[var(--color-text1)]">{snap.name}</div>
                          <div className="text-[10px] text-[var(--color-text3)]">{new Date(snap.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="orange"
                            size="sm"
                            onClick={async () => {
                              const res = validateBackupFile(snap.payloadJson)
                              if (res.valid && res.payload) setRestoreData(res.payload)
                            }}
                            className="text-[11px] px-2 py-1"
                          >
                            Restore
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteLocalSnapshot(snap.id)}
                            className="text-[11px] px-2 py-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Theme */}
          <Card id="settings-theme" data-section="theme">
            <CardHeader><h2 className="text-sm font-semibold">Theme</h2></CardHeader>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-sm">Dark Mode</span>
                <button onClick={toggleDark} type="button" role="switch" aria-checked={ui.dark} className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${ui.dark ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                  <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${ui.dark ? 'translate-x-[18px]' : 'translate-x-0'}`} />
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

        </div>
      </div>

      {/* Image Upload Modal */}
      <Modal open={uploadField !== null} onClose={() => setUploadField(null)} maxW="540px">
        {uploadField && (() => {
          const info = IMAGE_INFO[uploadField]
          const full = [co.name, co.sub].filter(Boolean).join(' — ')
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

      {/* Restore Modal */}
      <Modal open={restoreData !== null} onClose={() => setRestoreData(null)} maxW="500px">
        {restoreData && (
          <div>
            <h2 className="text-lg font-bold mb-1">Restore Backup</h2>
            <p className="text-xs text-[var(--color-text2)] mb-4">
              {restoreData.metadata?.exportedAt
                ? `Exported on ${new Date(restoreData.metadata.exportedAt).toLocaleString()}`
                : 'Backup file selected'}
            </p>

            <div className="bg-[var(--color-input-bg)] p-3 rounded-lg border border-[var(--color-border)] mb-4 text-xs">
              <div className="font-semibold text-[var(--color-text1)] mb-2">Backup Contents Overview:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[var(--color-text2)]">
                <div>Companies: <strong className="text-[var(--color-text1)]">{restoreData.companies.length}</strong></div>
                <div>Invoices: <strong className="text-[var(--color-text1)]">{restoreData.invoices.length}</strong></div>
                <div>Receipts: <strong className="text-[var(--color-text1)]">{restoreData.receipts.length}</strong></div>
                <div>Quotations: <strong className="text-[var(--color-text1)]">{restoreData.quotations.length}</strong></div>
                <div>Customers: <strong className="text-[var(--color-text1)]">{restoreData.customers.length}</strong></div>
                <div>Products: <strong className="text-[var(--color-text1)]">{restoreData.products.length}</strong></div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-text1)]">Choose Restore Mode:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleConfirmRestore('merge')}
                  className="justify-center py-2.5 text-xs"
                >
                  Merge with Existing
                </Button>
                <Button
                  variant="orange"
                  onClick={() => handleConfirmRestore('replace')}
                  className="justify-center py-2.5 text-xs"
                >
                  Replace All Data
                </Button>
              </div>
              <p className="text-[11px] text-[var(--color-text3)] text-center">
                <strong>Merge</strong> adds or updates records without deleting present data.<br />
                <strong>Replace All</strong> wipes existing local database clean before restoring.
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => setRestoreData(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

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
