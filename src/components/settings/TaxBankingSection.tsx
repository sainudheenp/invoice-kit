interface Props {
  form: Record<string, string>
  set: (field: string, value: string) => void
}

export function TaxBankingSection({ form, set }: Props) {
  return (
    <div id="settings-tax" data-section="tax">
      <h2 className="text-sm font-semibold mb-3">Tax &amp; Banking</h2>
      <div className="space-y-4">
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
    </div>
  )
}
