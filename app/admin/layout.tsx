// app/admin/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminLayoutClient } from '@/app/components/admin/admin-layout-client'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/admin')
  
  const role = session.user?.role
  if (role !== 'ADMIN' && role !== 'MANAGER') redirect('/')
  
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}