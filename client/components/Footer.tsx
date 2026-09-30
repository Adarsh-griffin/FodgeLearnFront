import { Instagram, Twitter, Linkedin, Youtube, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-0">
      {/* Full-width gradient background */}
      <div className="w-full gradient-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Top row: logo + nav + socials */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide">LearnFordge</span>
            </div>

            {/* Nav */}
            <nav className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-xs">
              <a className="hover:text-white transition-colors" href="#">Home</a>
              <a className="hover:text-white transition-colors" href="#">How it Works</a>
              <a className="hover:text-white transition-colors" href="#">Core Features</a>
              <a className="hover:text-white transition-colors" href="#">Integrations</a>
              <a className="hover:text-white transition-colors" href="#">Testimonials</a>
            </nav>

            {/* Socials using lucide-react icons */}
            <div className="flex items-center gap-3">
              <a aria-label="Instagram" href="#" className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </a>
              <a aria-label="X" href="#" className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition flex items-center justify-center">
                <Twitter className="w-4 h-4" />
              </a>
              <a aria-label="LinkedIn" href="#" className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition flex items-center justify-center">
                <Linkedin className="w-4 h-4" />
              </a>
              <a aria-label="YouTube" href="#" className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition flex items-center justify-center">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 border-t border-white/20"></div>

          {/* Bottom row: legal */}
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/80">
            <p>© {new Date().getFullYear()} LearnFordge. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a className="hover:text-white underline-offset-2 hover:underline" href="#">Privacy Policy</a>
              <a className="hover:text-white underline-offset-2 hover:underline" href="#">Terms of Use</a>
              <a className="hover:text-white underline-offset-2 hover:underline" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
