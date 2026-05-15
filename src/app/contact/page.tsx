import ContactSection from "@/components/contact"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
