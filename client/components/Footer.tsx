import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full bg-[#F5F8FF] border-t border-indigo-100/70 py-3.5 px-4 sm:px-6 lg:px-8 text-slate-600 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Text Branding Only */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
            Learn<span className="text-indigo-600">Forge</span>
          </span>
        </Link>

        {/* Legal Links (Desktop & Mobile) */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <Link to="/privacy" className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/terms" className="hover:text-indigo-600 transition-colors">
            Terms & Conditions
          </Link>
        </div>

        {/* Rights Reserved by Adarsh Dhawale */}
        <p className="text-center sm:text-right text-slate-500 font-medium tracking-tight text-xs">
          © {new Date().getFullYear()} LearnForge. All rights reserved by Adarsh Dhawale.
        </p>
      </div>
    </footer>
  );
}
