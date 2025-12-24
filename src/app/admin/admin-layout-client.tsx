"use client"

import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAppSelector } from "@/lib/hooks"

export function AdminLayoutClient({
  children,
  role
}: {
  children: React.ReactNode
  role: "ADMIN" | "MODERATOR"
}) {
  const isOpen = useAppSelector((state) => state.ui.isSidebarOpen)

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role={role} />
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <DashboardHeader />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
