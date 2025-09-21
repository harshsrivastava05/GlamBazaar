// app/admin/page.tsx
import { Suspense } from "react"
import { DashboardStats } from "@/app/components/admin/dashboard/dashboard-stats"
import { DashboardLoadingSkeleton } from "@/app/components/admin/dashboard/loading-skeleton"

export default function AdminDashboard() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome to your GlamBazar admin dashboard
        </p>
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  )
}