"use client"

import { Bell, Search, Settings, Menu, UserPlus, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { toggleSidebar, markNotificationRead, markAllNotificationsRead, setNotifications } from "@/lib/features/ui/uiSlice"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import Link from "next/link"

export function DashboardHeader() {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const { unreadCount, notifications } = useAppSelector((state) => state.ui)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications")
      if (res.ok) {
        const data = await res.json()
        dispatch(setNotifications({
          notifications: data.notifications,
          unreadCount: data.unreadCount
        }))
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      dispatch(markAllNotificationsRead())
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleMarkOneRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      dispatch(markNotificationRead(id))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_USER_REGISTRATION":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "CONTACT_FORM_SUBMISSION":
        return <Mail className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

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
          {session?.user?.role === "ADMIN" && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2" onClick={handleMarkAllRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 cursor-pointer",
                          !notification.isRead && "bg-muted/50"
                        )}
                        onClick={() => !notification.isRead && handleMarkOneRead(notification.id)}
                      >
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", !notification.isRead && "text-foreground")}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center">
                      <Link href="/admin/notifications" className="text-sm text-primary">
                        View all notifications
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
            <Settings size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}