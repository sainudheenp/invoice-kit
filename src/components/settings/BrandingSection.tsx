import { Button } from '@/components/ui'

interface Props {
  form: Record<string, string>
  set: (field: string, value: string) => void
  setUploadField: (field: 'logo' | 'seal' | 'signature') => void
  dragOverField: string | null
  setDragOverField: (field: string | null) => void
  showToast: (msg: string, type?: string) => void
  autoSaveTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>
  formRef: React.MutableRefObject<Record<string, string>>
  setSaving: (v: boolean) => void
  doAutoSave: () => void
}

export function BrandingSection({ form, set, setUploadField, dragOverField, setDragOverField, showToast, autoSaveTimer, formRef, setSaving, doAutoSave }: Props) {
  const handleDrop = (field: string, e: React.DragEvent) => {
    e.preventDefault()
    setDragOverField(null)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB.', 'err'); return }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      set(field, dataUrl)
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      formRef.current = { ...formRef.current, [field]: dataUrl }
      setSaving(true)
      await doAutoSave()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div id="settings-branding" data-section="branding">
      <h2 className="text-sm font-semibold mb-3">Branding</h2>
      <div className="space-y-4">
        {(['logo', 'seal', 'signature'] as const).map((field) => (
          <div key={field}>
            <label className="text-xs font-medium text-[var(--color-text2)] capitalize mb-1.5 block">{field}</label>
            <div
              onClick={() => setUploadField(field)}
              onDragOver={(e) => { e.preventDefault(); setDragOverField(field) }}
              onDragLeave={() => setDragOverField(null)}
              onDrop={(e) => handleDrop(field, e)}
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
    </div>
  )
}
