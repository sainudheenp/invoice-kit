import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { HeroBanner } from '@/components/dashboard/HeroBanner'
import { ActiveCompany } from '@/components/dashboard/ActiveCompany'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default function Dashboard() {
  return (
    <div className="page-enter">
      <HeroBanner />
      <StatsGrid />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <div className="md:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-5">
          <ActiveCompany />
        </div>
      </div>
    </div>
  )
}