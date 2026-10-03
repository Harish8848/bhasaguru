"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Globe, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[4.5rem]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shadow-sm shadow-teal-900/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="inline-flex items-center">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                BhasaGuru
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/lessons"
              className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors"
            >
              Lessons
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/culture"
              className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors"
            >
              Culture
            </Link>
            <Link
              href="/mock-tests"
              className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors"
            >
              Mock Test
            </Link>
            <Link
              href="/jobs"
              className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors"
            >
              Jobs
            </Link>

            <Link
              href="/address"
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Address
            </Link>

            <Link
              href="/chat"
              className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              AI Tutor
            </Link>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                <div className="w-16 h-4 bg-muted animate-pulse rounded"></div>
              </div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={
                        (session.user as any)?.profilePicture ||
                        session.user?.image ||
                        undefined
                      }
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="rounded-xl border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} className="lg:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100" onClick={toggleMenu}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-5 flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
            {/* Profile Avatar at Top - Mobile */}
            {session && (
              <div className="pt-2 pb-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer w-12 h-12">
                      <AvatarImage
                        src={
                          (session.user as any)?.profilePicture ||
                          session.user?.image ||
                          undefined
                        }
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg">
                        {session.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <DropdownMenuLabel className="text-center">
                      {session.user?.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="justify-center"
                      onSelect={() => router.push("/profile")}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="justify-center text-destructive"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Navigation Links */}
            <Link
              href="/lessons"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            >
              Lessons
            </Link>
            <Link
              href="/courses"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            >
              Courses
            </Link>
            <Link
              href="/culture"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            >
              Culture
            </Link>
            <Link
              href="/mock-tests"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            >
              Mock Test
            </Link>
            <Link
              href="/jobs"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            >
              Jobs
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
            >
              <Sparkles className="w-4 h-4" />
              AI Tutor
            </Link>
            <div className="flex gap-2 pt-3">
              {status === "loading" ? (
                <div className="w-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : session ? (
                <Button
                  size="sm"
                  className="w-full bg-accent"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-accent text-accent bg-transparent"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
