import { Button } from '@/components/ui'

const TEMPLATE_OPTIONS = ['classic', 'modern', 'professional', 'minimal', 'elegant', 'bold', 'beirak']
const WATERMARK_OPTIONS = ['', 'Draft', 'Paid', 'Sample', 'Copy']

interface Props {
  form: Record<string, string>
  set: (field: string, value: string) => void
  setForm: React.Dispatch<React.SetStateAction<any>>
  formRef: React.MutableRefObject<any>
  autoSaveTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>
  setSaving: (v: boolean) => void
  doAutoSave: () => void
  handlePreview: (type: 'inv' | 'rec' | 'quot', tpl: string) => void
  handleSave: () => void
}

export function TemplatesSection({ form, set, setForm, formRef, autoSaveTimer, setSaving, doAutoSave, handlePreview, handleSave }: Props) {
  return (
    <div id="settings-templates" data-section="templates">
      <h2 className="text-sm font-semibold mb-3">Templates</h2>
      <div className="space-y-4">
        {(['inv', 'rec', 'quot'] as const).map((type) => {
          const label = type === 'inv' ? 'Invoice' : type === 'rec' ? 'Receipt' : 'Quotation'
          const field = type + 'Template'
          return (
            <div key={type}>
              <label className="text-xs font-medium text-[var(--color-text2)]">{label} Template</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {TEMPLATE_OPTIONS.map((t) => {
                  const sel = form[field] === t
                  return (
                    <button key={t} onClick={() => sel ? handlePreview(type, t) : set(field, t)}
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
          )
        })}

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium">Show Arabic Text</div>
            <div className="text-xs text-[var(--color-text3)]">Displays Arabic company name and labels in Classic templates</div>
          </div>
          <button
            onClick={() => {
              const next = !form.showArabic
              setForm((f: any) => f ? { ...f, showArabic: next } : f)
              formRef.current = { ...formRef.current, showArabic: next }
              if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
              setSaving(true)
              doAutoSave()
            }}
            type="button"
            role="switch"
            aria-checked={form.showArabic === 'true'}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${form.showArabic === 'true' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
          >
            <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.showArabic === 'true' ? 'translate-x-[18px]' : 'translate-x-0'}`} />
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
    </div>
  )
}
