"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (typeof window !== "undefined") {
      setIsVisible(window.scrollY > 500)
    }
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return (
    <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-40">
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="rounded-full bg-accent hover:opacity-90 text-accent-foreground shadow-lg animate-fade-in"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
