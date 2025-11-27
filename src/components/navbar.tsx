"use client"

import { useState } from "react"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
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
  const { data: session } = useSession()

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
            <a href="/" className="inline-flex">
            <img src="/favicon.ico" alt="" />
            <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
              BhasaGuru
            </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
          <a href="/lessons" className="text-sm font-medium hover:text-accent transition-colors">
              Lessons
            </a>
            <a href="/courses" className="text-sm font-medium hover:text-accent transition-colors">
              Courses
            </a>
            <a href="/jobs" className="text-sm font-medium hover:text-accent transition-colors">
              Jobs
            </a>
            <a href="/culture" className="text-sm font-medium hover:text-accent transition-colors">
              Culture
            </a>
            <a href="/mock-tests" className="text-sm font-medium hover:text-accent transition-colors">
              Mock Tests
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex  items-center gap-3 " >
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <a href="/profile">Profile</a>
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
          <div className="md:hidden pb-4 space-y-3">
            <a href="/courses" className="block text-sm font-medium hover:text-accent py-2">
              Courses
            </a>
            <a href="/jobs" className="block text-sm font-medium hover:text-accent py-2">
              Jobs
            </a>
            <a href="/culture" className="block text-sm font-medium hover:text-accent py-2">
              Culture
            </a>
            <a href="/blog" className="block text-sm font-medium hover:text-accent py-2">
              Blog
            </a>
            <a href="/tests" className="block text-sm font-medium hover:text-accent py-2">
              Tests
            </a>
            <div className="flex gap-2 pt-3">
              {session ? (
                <Button size="sm" className="w-full bg-gradient-accent" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full border-accent text-accent bg-transparent" onClick={() => signIn('google', { callbackUrl: '/' })}>
                  Sign In
                </Button>
              )}
              <Button size="sm" className="w-full bg-gradient-accent">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
