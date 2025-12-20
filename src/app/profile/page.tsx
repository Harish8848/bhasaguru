import ProfilePage from "@/components/profile"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <ProfilePage />
      </main>
      <Footer />
    </div>
  )
}
