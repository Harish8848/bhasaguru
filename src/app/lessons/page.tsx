import { Suspense } from "react"
import LessonsComponent from "@/components/lessons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function LessonsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">Loading...</div>}>
          <LessonsComponent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
