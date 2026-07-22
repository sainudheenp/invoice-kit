import type { Company } from '@/types/company'

interface Props {
  form: Company
  set: (field: string, value: string) => void
}

export function CompanySection({ form, set }: Props) {
  return (
    <div id="settings-company" data-section="company">
      <h2 className="text-sm font-semibold mb-3">Company Details</h2>
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
  )
}
