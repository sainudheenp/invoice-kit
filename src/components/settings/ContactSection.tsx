interface ContactForm {
  tel: string
  fax: string
  mob: string
  email: string
  cr: string
  pobox: string
  loc: string
  website: string
}

interface Props {
  form: ContactForm
  set: (field: string, value: string) => void
}

export function ContactSection({ form, set }: Props) {
  return (
    <div id="settings-contact" data-section="contact">
      <h2 className="text-sm font-semibold mb-3">Contact Information</h2>
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
  )
}
