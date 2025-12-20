import LessonsComponent from "@/components/lessons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function LessonsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <LessonsComponent />
      </main>
      <Footer />
    </div>
  )
}
