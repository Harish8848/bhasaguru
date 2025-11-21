import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-linear-to-b from-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs md:text-sm font-medium text-accent">Master Global Languages</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-pretty">
                Transform Your Career Through{" "}
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Language Excellence
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
                Learn Japanese, Korean, English and more from expert instructors. Get certified, find international
                jobs, and unlock endless career opportunities abroad.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" className="bg-gradient-accent hover:opacity-90 text-accent-foreground font-semibold">
                Start Learning Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 font-semibold bg-transparent"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">50K+</div>
                <p className="text-xs md:text-sm text-muted-foreground">Active Learners</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">1000+</div>
                <p className="text-xs md:text-sm text-muted-foreground">Job Listings</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">98%</div>
                <p className="text-xs md:text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Animated circles */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-pulse" />
              <div className="absolute inset-8 rounded-full border-2 border-primary/30" />
              <div
                className="absolute inset-16 rounded-full border-2 border-accent/50 animate-spin"
                style={{ animationDuration: "8s" }}
              />

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-4xl md:text-5xl">🌍</div>
                  <h3 className="text-lg md:text-xl font-semibold">Global Language Learning</h3>
                  <p className="text-sm text-muted-foreground">Join a worldwide community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
