"use client"

import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth"

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider
      session={session}
      // Prevent session refetch on window focus to avoid flickering
      refetchOnWindowFocus={false}
      // Disable automatic session refresh to prevent UI flickering
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  )
}
