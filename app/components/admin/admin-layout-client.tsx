// app/components/admin/admin-layout-client.tsx (Updated)
"use client"

import { useState } from 'react'
import { useMobile } from "@/hooks/use-mobile"
import { AdminSidebar } from './admin-sidebar'
import { AdminMobileSidebar } from './admin-mobile-sidebar'
import { AdminHeader } from './admin-header'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile(768)

  const closeSidebar = () => setSidebarOpen(false)
  const openSidebar = () => setSidebarOpen(true)

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="hidden md:flex">
          <AdminSidebar />
        </div>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <AdminMobileSidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <AdminHeader onMenuClick={openSidebar} />
        )}
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}