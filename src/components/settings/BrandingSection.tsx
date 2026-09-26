import { resizeImage, IMAGE_MAX_SIZES } from '@/utils/image'

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

const COLOR_JODIS = [
  { name: 'Original Orange', primary: '#D97706', accent: '#78716C' },
  { name: 'Black & Gray', primary: '#000000', accent: '#616161' },
  { name: 'Charcoal & Slate', primary: '#1f2937', accent: '#64748b' },
  { name: 'Navy & Gray', primary: '#1e3a5f', accent: '#6b7280' },
  { name: 'Slate & Stone', primary: '#334155', accent: '#78716C' },
  { name: 'Dark & Medium', primary: '#111827', accent: '#4b5563' },
]

function JodiPicker({
  pcolor,
  acolor,
  set,
}: {
  pcolor: string
  acolor: string
  set: (field: string, value: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--color-text2)]">Color Templates (Jodi) – Matching Pairs</label>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {COLOR_JODIS.map((jodi) => {
          const active = pcolor.toLowerCase() === jodi.primary.toLowerCase() && acolor.toLowerCase() === jodi.accent.toLowerCase()
          return (
            <button
              key={jodi.name}
              type="button"
              onClick={() => {
                set('pcolor', jodi.primary)
                set('acolor', jodi.accent)
              }}
              className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer group ${
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] ring-2 ring-[var(--color-primary-ring)]'
                  : 'border-[var(--color-border)] bg-[var(--color-input-bg)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-card)]'
              }`}
            >
              <div className="flex gap-1.5 mb-1.5">
                <span className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ background: jodi.primary }} />
                <span className="w-6 h-6 rounded-full border border-white/20 shadow-sm -ml-2" style={{ background: jodi.accent }} />
                {active && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-[11px] font-medium text-[var(--color-text1)] leading-tight">{jodi.name}</div>
              <div className="text-[10px] font-mono text-[var(--color-text3)] mt-0.5">
                {jodi.primary} / {jodi.accent}
              </div>
            </button>
          )
        })}
        {/* Custom Both Card */}
        <div className="p-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-input-bg)]">
          <div className="text-[11px] font-medium text-[var(--color-text1)] mb-2">Custom Both</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={pcolor}
                onChange={(e) => set('pcolor', e.target.value)}
                className="w-6 h-6 rounded-full border border-[var(--color-input-border)] cursor-pointer"
                title="Primary custom"
              />
              <span className="text-[10px] font-mono text-[var(--color-text2)]">{pcolor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={acolor}
                onChange={(e) => set('acolor', e.target.value)}
                className="w-6 h-6 rounded-full border border-[var(--color-input-border)] cursor-pointer"
                title="Accent custom"
              />
              <span className="text-[10px] font-mono text-[var(--color-text2)]">{acolor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed custom pickers below for fine control */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)]">
        <div>
          <label className="text-[11px] font-medium text-[var(--color-text2)]">Primary Custom</label>
          <div className="mt-1 flex gap-2 items-center">
            <input type="color" value={pcolor} onChange={(e) => set('pcolor', e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--color-input-border)] cursor-pointer" />
            <span className="text-xs font-mono text-[var(--color-text2)]">{pcolor}</span>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-[var(--color-text2)]">Accent Custom</label>
          <div className="mt-1 flex gap-2 items-center">
            <input type="color" value={acolor} onChange={(e) => set('acolor', e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--color-input-border)] cursor-pointer" />
            <span className="text-xs font-mono text-[var(--color-text2)]">{acolor}</span>
          </div>
        </div>
      </div>
    </div>
  )
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
      const { w, h } = IMAGE_MAX_SIZES[field] || { w: 400, h: 400 }
      const resized = await resizeImage(dataUrl, w, h)
      set(field, resized)
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      formRef.current = { ...formRef.current, [field]: resized }
      setSaving(true)
      await doAutoSave()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div id="settings-branding" data-section="branding">
      <h2 className="text-sm font-semibold mb-3">Branding</h2>
      <div className="space-y-5">
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
                  <span className="text-[10px]">JPG, PNG, SVG &middot; Max 2MB</span>
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
        <JodiPicker pcolor={form.pcolor} acolor={form.acolor} set={set} />
      </div>
    </div>
  )
}
