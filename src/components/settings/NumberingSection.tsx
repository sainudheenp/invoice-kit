interface Props {
  form: Record<string, string>
  set: (field: string, value: string) => void
}

export function NumberingSection({ form, set }: Props) {
  return (
    <div id="settings-documents" data-section="documents">
      <h2 className="text-sm font-semibold mb-3">Numbering &amp; Defaults</h2>
      <div className="space-y-4">
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
    </div>
  )
}
