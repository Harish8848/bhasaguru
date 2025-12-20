import CultureSection from "@/components/culture"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function CulturePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <CultureSection />
      </main>
      <Footer />
    </div>
  )
}
