import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero"
import FeaturesSection from "@/components/features"
import CoursesSection from "@/components/courses"
import JobsSection from "@/components/jobs"
import StatsSection from "@/components/stats"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <JobsSection />
      <StatsSection />
      <Footer />
    </main>
  )
}
