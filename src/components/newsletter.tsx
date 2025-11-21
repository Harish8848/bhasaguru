"use client"
import { useState } from "react"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="flex justify-center">
              <Mail className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Get <span className="text-accent">Weekly Tips</span> & Opportunities
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
              Subscribe to our newsletter for language learning tips, job opportunities, and career insights delivered
              to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background/80 border-border"
              required
            />
            <Button
              type="submit"
              className="bg-gradient-accent hover:opacity-90 text-accent-foreground font-semibold whitespace-nowrap"
            >
              Subscribe
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {submitted && (
            <p className="text-sm text-accent font-medium">Thank you! Check your email for confirmation.</p>
          )}

          <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime. We respect your privacy.</p>
        </div>
      </div>
    </section>
  )
}
