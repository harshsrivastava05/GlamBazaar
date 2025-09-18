// app/components/admin/admin-logo.tsx
import Link from "next/link"
import { Gem } from "lucide-react"

export function AdminLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Gem className="h-6 w-6 text-primary" />
      <div>
        <span className="text-xl font-bold">GlamBazar</span>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>
    </Link>
  )
}