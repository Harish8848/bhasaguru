import JobsSection from "@/components/jobs"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <JobsSection />
      </main>
      <Footer />
    </div>
  )
}
