import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ActiveCompany } from '@/components/dashboard/ActiveCompany'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--color-text2)]">Overview of your invoicing activity.</p>
      </div>
      <StatsGrid />
      <QuickActions />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <div className="md:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <ActiveCompany />
        </div>
      </div>
    </div>
  )
}
