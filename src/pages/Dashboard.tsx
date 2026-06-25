import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ActiveCompany } from '@/components/dashboard/ActiveCompany'

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--color-text2)]">Overview of your invoicing activity.</p>
      </div>
      <StatsGrid />
      <QuickActions />
      <ActiveCompany />
    </div>
  )
}
