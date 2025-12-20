import dynamic from 'next/dynamic'
import Navbar from "@/components/navbar"

// Lazy load components with loading fallbacks
const HeroSection = dynamic(() => import("@/components/hero"), {
  loading: () => <div className="h-screen bg-background animate-pulse" />
})

const FeaturesSection = dynamic(() => import("@/components/features"), {
  loading: () => <div className="h-96 bg-background animate-pulse" />
})

const CoursesSection = dynamic(() => import("@/components/courses"), {
  loading: () => <div className="h-96 bg-background animate-pulse" />
})

const JobsSection = dynamic(() => import("@/components/jobs"), {
  loading: () => <div className="h-96 bg-background animate-pulse" />
})

const StatsSection = dynamic(() => import("@/components/stats"), {
  loading: () => <div className="h-96 bg-background animate-pulse" />
})

const Footer = dynamic(() => import("@/components/footer"), {
  loading: () => <div className="h-32 bg-background animate-pulse" />
})

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <HeroSection />
        <FeaturesSection />
        <CoursesSection />
        <JobsSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  )
}
