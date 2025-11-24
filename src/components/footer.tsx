import { Globe, Mail, Phone } from "lucide-react"
import React from "react"
import { footerLinks } from "@/lib/data"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex justify-center align-items-center flex-col">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8 md:mb-12 ">
          {/* Brand Section */}
         
          <div className="md:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                BhasaGuru
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Nepali speakers to master global languages and achieve international careers.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="mailto:contact@bhasaguru.com"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a href="tel:+977-1-4234567" className="text-muted-foreground hover:text-accent transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Links */}
          {footerLinks.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              
            </div>
          ))}
                  <p>&copy; {currentYear} BhasaGuru. All rights reserved.</p>

        </div>

      </div>
    </footer>
  )
}
