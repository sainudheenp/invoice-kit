import { useApp } from '@/store/AppContext'
import { Card, CardHeader, Button } from '@/components/ui'

interface Props {
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfilesSection({ onExport, onImport }: Props) {
  const { state, getCo, setActive, deleteCompany, saveCompany, showToast } = useApp()
  const co = getCo()

  const handleNewCompany = async () => {
    const { defCompany } = await import('@/utils/defCompany')
    const c = defCompany('New Company ' + (state.companies.length + 1))
    await saveCompany(c)
    setActive(c.id)
    showToast('Company created.')
  }

  const handleDeleteCompany = async () => {
    if (!co) return
    if (state.companies.length < 2) { showToast('Need at least one company.', 'err'); return }
    if (!confirm(`Delete "${co.name}" and all its documents?`)) return
    const { deleteCompany: del } = await import('@/store/AppContext').then(() => ({ deleteCompany: useApp().deleteCompany }))
    await del(co.id)
    setActive(state.companies.find((c) => c.id !== co.id)?.id || '')
    showToast('Company deleted.')
  }

  return (
    <Card id="settings-profiles" data-section="profiles">
      <CardHeader><h2 className="text-sm font-semibold">Company Profiles</h2></CardHeader>
      <div className="p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={co?.id || ''}
            onChange={(e) => { setActive(e.target.value) }}
            className="px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
          >
            {state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button size="sm" onClick={handleNewCompany}>+ New</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteCompany}>Delete</Button>
          <Button size="sm" variant="info" onClick={onExport}>Export</Button>
          <Button size="sm" variant="orange" onClick={() => document.getElementById('importFileInput')?.click()}>Import</Button>
          <input id="importFileInput" type="file" accept=".json" className="hidden" onChange={onImport} />
        </div>
      </div>
    </Card>
  )
}
