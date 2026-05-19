import dynamic from 'next/dynamic'
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero"
import StudentFeedbackSection from '@/components/student-feedback'

// Lazy load non-critical sections below the fold
const FeaturesSection = dynamic(() => import("@/components/features"), {
  loading: () => <div className="h-96 bg-background animate-pulse" />
})

const CoursesSection = dynamic(() => import("@/components/courses"), {
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
        <StudentFeedbackSection/>
        <StatsSection />
      </main>
      <Footer />
    </div>
  )
}
