"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, BarChart3, Briefcase, FileText, Users, LogOut, Video } from "lucide-react"
import { useSidebar } from "@/components/sidebar-context"

interface DashboardSidebarProps {
  role: "ADMIN" | "MODERATOR"
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { isOpen } = useSidebar()

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/lessons", label: "Lessons", icon: Video },
    { href: "/admin/mock-tests", label: "Mock Tests", icon: BarChart3 },
    { href: "/admin/jobs", label: "Jobs Board", icon: Briefcase },
    { href: "/admin/culture", label: "Culture Posts", icon: FileText },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  const moderatorLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/mock-tests", label: "Mock Tests", icon: BarChart3 },
    { href: "/admin/jobs", label: "Jobs Board", icon: Briefcase },
    { href: "/admin/culture", label: "Culture Posts", icon: FileText },
  ]

  const links = role === "ADMIN" ? adminLinks : moderatorLinks

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-6 gap-8">
          {/* Logo */}
          <div className="text-2xl font-bold text-sidebar-primary">BhasaGuru</div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="space-y-3 border-t border-sidebar-border pt-4">
            <div className="px-4">
              <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
              <p className="text-sm font-medium text-sidebar-foreground">
                {role === "ADMIN" ? "Administrator" : "Moderator"}
              </p>
            </div>
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => {}} />}
    </>
  )
}
