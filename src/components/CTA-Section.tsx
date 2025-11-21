"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-linear-to-r from-primary/5 via-accent/5 to-primary/5 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Limited Time Offer</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-pretty">
              Start Your Global Career Journey{" "}
              <span className="bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">Today</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Join 50,000+ learners mastering languages and landing international careers. Get 30% off your first course
              with BhasaGuru Pro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" className="bg-gradient-accent hover:opacity-90 text-accent-foreground font-semibold">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 font-semibold bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
