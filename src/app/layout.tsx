import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
import favicon from "@/public/favicon.ico";
import { SessionProvider } from "next-auth/react";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "@/public/bhasaguru.png",
  },
  title: "BhasaGuru",
  description: "Learn Japanese(N5, N4, N3, N2), Korean(TOPIC I, TOPIC II), English(IELTS, TOEFL, PTE) and more. Connect with job opportunities abroad and advance your career globally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
