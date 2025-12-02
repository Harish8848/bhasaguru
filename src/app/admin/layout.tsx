"use client"

import type React from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { useState, useEffect } from "react"

function LayoutContent({ children, role }: { children: React.ReactNode; role: "ADMIN" | "MODERATOR" }) {
  const { isOpen } = useSidebar()

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<"ADMIN" | "MODERATOR" | null>(null)

  useEffect(() => {
    const userRole = (localStorage.getItem("userRole") || "ADMIN") as "ADMIN" | "MODERATOR"
    setRole(userRole)
  }, [])

  if (!role) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <SidebarProvider>
      <LayoutContent role={role}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  )
}
