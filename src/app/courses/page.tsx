import CoursesSection from "@/components/courses"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function CoursesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <CoursesSection />
      </main>
      <Footer />
    </div>
  )
}
