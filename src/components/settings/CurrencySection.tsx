import { CUR_PRESETS } from '@/utils/currencyPresets'
import { Button } from '@/components/ui'

interface Props {
  form: Record<string, string>
  set: (field: string, value: string) => void
}

export function CurrencySection({ form, set }: Props) {
  const applyPreset = () => {
    const val = (document.getElementById('curPresetSelect') as HTMLSelectElement)?.value
    if (!val) return
    const cur = CUR_PRESETS[val as keyof typeof CUR_PRESETS]
    if (!cur) return
    set('curCode', cur.code)
    set('curSym', cur.symbol)
    set('curName', cur.name)
    set('curNamePl', cur.namePl)
    set('curSub', cur.sub)
    set('curSubPl', cur.subPl)
    set('curSubPer', String(cur.subPer))
  }

  return (
    <div id="settings-currency" data-section="currency">
      <h2 className="text-sm font-semibold mb-3">Currency</h2>
      <div className="space-y-3">
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
    </div>
  )
}
