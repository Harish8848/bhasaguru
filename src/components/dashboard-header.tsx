"use client"

import { Bell, Search, Settings, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppDispatch } from "@/lib/hooks"
import { toggleSidebar } from "@/lib/features/ui/uiSlice"

export function DashboardHeader() {
  const dispatch = useAppDispatch()

  return (
    <header className="sticky top-0 bg-card border-b border-border px-6 py-4 z-30">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="text-foreground hover:bg-secondary hidden md:flex"
        >
          <Menu size={20} />
        </Button>

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
            <Settings size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}
