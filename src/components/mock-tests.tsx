"use client"
import { BookOpen, Users, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockTests, testLevels } from "@/lib/data"

export default function MockTestsSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Mock Tests Offered */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-accent">Practice</span> with Mock Tests
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Prepare for your exams with our realistic mock tests for various languages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mockTests.map((test) => (
              <Card key={test.code} className="hover:shadow-lg transition-shadow border-border group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{test.icon}</span>
                    <Globe className="w-5 h-5 text-accent/60 group-hover:text-accent transition-colors" />
                  </div>
                  <CardTitle className="text-2xl">{test.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <span>{test.tests} Tests Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-accent" />
                      <span>{test.learners.toLocaleString()} Active Takers</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      Beginner
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Advanced
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Test Levels */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Test at <span className="text-accent">Your Level</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our tests are designed to match your proficiency level, from beginner to advanced.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testLevels.map((item, index) => (
              <Card key={item.level} className="border-border hover:border-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-accent">{item.label}</span>
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold text-base">{item.description}</h3>
                    <div className="flex gap-1 pt-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${i < index + 1 ? "bg-accent" : "bg-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
