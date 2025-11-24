"use client"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { GoogleSigninButton } from "@/components/google-signin-button"

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to BhasaGuru</CardTitle>
              <CardDescription>Sign in with Google to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleSigninButton />
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}