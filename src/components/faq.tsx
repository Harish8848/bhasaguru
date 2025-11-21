"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { faqs } from "@/lib/data"

export default function FAQSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <section className="py-20 md:py-32 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Find answers to common questions about BhasaGuru courses, jobs, and certifications
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className="border-border overflow-hidden">
              <Button
                variant="ghost"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full justify-between items-start p-6 h-auto hover:bg-transparent hover:text-accent transition-colors group"
              >
                <span className="text-left font-semibold text-foreground group-hover:text-accent">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-accent shrink-0 transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`}
                />
              </Button>

              {expandedId === faq.id && (
                <CardContent className="px-6 pb-6 pt-0">
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
