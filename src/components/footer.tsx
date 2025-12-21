import { Globe, Mail, Phone } from "lucide-react";
import React from "react";

export default function Footer() {
  const currentYear = 2025;

  return (
    <footer className="bg-background border-t border-border flex-col justify-center items-center mx-auto py-4 ">
      <div className="max-w-7xl ">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-6 lg:gap-6   text-center ">
          {/* Brand Section */}

          <div className=" md:col-span-2 lg:col-span-2 space-y-4 flex flex-col justify-center items-center ">
            <div className=" flex items-center gap-2 ">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <a href="/" className="inline-flex justify-center items-center">
                <img src="/favicon.ico" alt="" />
                <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  BhasaGuru
                </span>
              </a>
            </div>
            <p className="text-md text-muted-foreground text-center ">
              Empowering Nepali speakers to master global languages and achieve
              international careers.
            </p>
            <div className="flex gap-4 pt-1 justify-center ">
              <a
                href="mailto:contact@bhasaguru.com"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="tel:+977-1-4234567"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Links */}
          <p className="  text-lg text-muted-foreground pb-4 md:pb-0  md:col-span-2 lg:col-span-2 ">
            {" "}
            &copy; {currentYear} BhasaGuru. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
