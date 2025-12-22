"use client"

import { useState } from "react"
import { Menu, X, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  // Use both session data and status to properly handle loading states
  // This prevents flickering by showing appropriate UI during session validation
  const { data: session, status } = useSession()

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <Link href="/" className="inline-flex fixed left-0.5">
            <img src="/favicon.ico" alt="" />
            <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
              BhasaGuru
            </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
          <Link href="/lessons" className="text-sm font-medium hover:text-accent transition-colors">
              Lessons
            </Link>
            <Link href="/courses" className="text-sm font-medium hover:text-accent transition-colors">
              Courses
            </Link>
            <Link href="/jobs" className="text-sm font-medium hover:text-accent transition-colors">
              Jobs
            </Link>
            <Link href="/culture" className="text-sm font-medium hover:text-accent transition-colors">
              Culture
            </Link>
            <Link href="/mock-tests" className="text-sm font-medium hover:text-accent transition-colors">
              Mock Tests
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex  items-center gap-3 " >
            {status === "loading" ? (
              // Loading skeleton while session is being determined
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                <div className="w-16 h-4 bg-muted animate-pulse rounded"></div>
              </div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={(session.user as any)?.profilePicture || session.user?.image || undefined} className="object-cover"/>
                    <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="border-accent  hover:bg-blue-400 bg-white text-stone-900" onClick={() => signIn('google', { callbackUrl: '/' })}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={toggleMenu}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4  flex flex-col justify-center  items-center bg-accent/10 rounded-lg">
             <Link href="/lessons" className="block text-md font-medium hover:text-accent py-1 text-blue-600 ">
              Lessons
            </Link>
            <Link href="/courses" className="block text-md font-medium hover:text-accent py-1 text-blue-600 ">
              Courses
            </Link>
            <Link href="/jobs" className="block text-md font-medium hover:text-accent py-1 text-blue-600 ">
              Jobs
            </Link>
            <Link href="/culture" className="block text-md font-medium hover:text-accent py-1 text-blue-600 ">
              Culture
            </Link>
           
            <Link href="/mock-tests" className="block text-md font-medium hover:text-accent py-1 text-blue-600 ">
              Mock Tests
            </Link>
            <div className="flex gap-2 pt-3">
              {status === "loading" ? (
                <div className="w-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : session ? (
                <Button size="sm" className="w-full bg-accent" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full border-accent text-accent bg-transparent" onClick={() => signIn('google', { callbackUrl: '/' })}>
                  Sign In
                </Button>
              )}

            </div>
          </div>
        )}
      </div>
    </nav>
  )
}