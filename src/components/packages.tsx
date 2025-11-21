"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { plans } from "@/lib/data"


export default function PricingSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Simple, Transparent <span className="text-accent">Pricing</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Choose the plan that fits your learning goals and budget
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-border relative flex flex-col transition-all ${
                plan.highlighted ? "md:scale-105 shadow-xl border-accent" : ""
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-accent text-accent-foreground">
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4 space-y-1">
                  <div className="text-4xl font-bold">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                <Button
                  className={`w-full ${plan.highlighted ? "bg-gradient-accent hover:opacity-90 text-accent-foreground" : "border-accent text-accent bg-transparent hover:bg-accent/10"}`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
