import Chatbot from "@/components/chatbot";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "AI Language Tutor - BhasaGuru",
  description: "Learn English, Japanese, and Korean with our AI-powered language tutor.",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="grow">
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
}
