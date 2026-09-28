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

const PRIMARY_SWATCHES = ['#000000', '#1e3a5f', '#1f2937', '#8b6914', '#dc2626', '#065f46']
const ACCENT_SWATCHES = ['#616161', '#78716C', '#64748b', '#6b7280', '#D97706', '#57534e']

function SwatchGroup({
  label,
  colors,
  value,
  onChange,
}: {
  label: string
  colors: string[]
  value: string
  onChange: (c: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--color-text2)] mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((col) => {
          const active = value.toLowerCase() === col.toLowerCase()
          return (
            <button
              key={col}
              type="button"
              onClick={() => onChange(col)}
              title={col}
              className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm
                ${active
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-ring)] ring-offset-2 ring-offset-[var(--color-card)] scale-110'
                  : 'border-white/30 hover:scale-105 hover:border-white/60'
                }`}
              style={{ background: col }}
            >
              {active && (
                <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
        {/* Custom picker as extra swatch */}
        <div className="relative w-9 h-9 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center bg-[var(--color-input-bg)] overflow-hidden group hover:border-[var(--color-primary)]/50 transition-colors">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Custom color"
          />
          <span className="text-[10px] font-bold text-[var(--color-text3)] group-hover:text-[var(--color-primary)]">+</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-[var(--color-input-border)] cursor-pointer shrink-0"
        />
        <span className="text-xs font-mono px-2 py-1 rounded bg-[var(--color-input-bg)] border border-[var(--color-border)] text-[var(--color-text2)]">
          {value}
        </span>
        <span className="text-[11px] text-[var(--color-text3)]">Custom</span>
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
                  <span className="text-[10px]">JPG, PNG, SVG · Max 2MB</span>
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
                  <span className="text-xs text-[var(--color-text3)]">·</span>
                  <button onClick={() => set(field, '')} className="text-xs text-red hover:brightness-110 transition-colors cursor-pointer">Remove</button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Logo size note */}
        <div className="text-[11px] text-[var(--color-text3)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2">
          Logo displays at <strong>60px</strong> height (max-width 220px), Seal at <strong>150px</strong> with max-width 150px limit on documents.
        </div>

        <div className="space-y-5 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)]/50">
          <SwatchGroup
            label="Primary Color – 6 presets + custom"
            colors={PRIMARY_SWATCHES}
            value={form.pcolor}
            onChange={(c) => set('pcolor', c)}
          />
          <div className="h-px bg-[var(--color-border)]" />
          <SwatchGroup
            label="Accent Color – 6 presets + custom"
            colors={ACCENT_SWATCHES}
            value={form.acolor}
            onChange={(c) => set('acolor', c)}
          />
        </div>
      </div>
    </div>
  )
}
