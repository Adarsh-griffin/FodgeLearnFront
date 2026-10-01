import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full bg-[#DFE6F5] border-t border-[#C5D5ED] py-3.5 px-4 sm:px-6 lg:px-8 text-slate-700 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm">
        {/* Text Branding Only */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
            Learn<span className="text-[#5146E5]">Forge</span>
          </span>
        </Link>

        {/* Rights Reserved by Adarsh Dhawale */}
        <p className="text-center sm:text-right text-slate-700 font-medium tracking-tight">
          © {new Date().getFullYear()} LearnForge. All rights reserved by Adarsh Dhawale.
        </p>
      </div>
    </footer>
  );
}
