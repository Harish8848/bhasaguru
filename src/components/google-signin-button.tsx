"use client"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export function GoogleSigninButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    )
  }

  if (session) {
    return null
  }

  return (
    <Button onClick={() => signIn("google")} className="w-full">
      Sign in with Google
    </Button>
  )
}