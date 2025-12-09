import type React from "react"
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-middleware'
import { AdminLayoutClient } from './admin-layout-client'
import { UserRole } from '@/generated/prisma/client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await requireAdmin()
    const userRole = session.user.role === UserRole.ADMIN ? "ADMIN" : "MODERATOR"

    return <AdminLayoutClient role={userRole} children={children} />
  } catch (error) {
    // If authentication fails, redirect to login
    redirect('/auth')
  }
}
