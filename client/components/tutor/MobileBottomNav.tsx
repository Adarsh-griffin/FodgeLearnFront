import { Home, BookOpen, Sparkles, FileText, ClipboardCheck } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "upload" | "learning" | "assessment" | "tutor" | "home";
  handleTabChange: (tab: "upload" | "learning" | "assessment" | "tutor") => void;
  navigate: (path: string | number) => void;
  onOpenTutorSheet: () => void;
}

export function MobileBottomNav({
  activeTab,
  handleTabChange,
  navigate,
  onOpenTutorSheet,
}: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 select-none shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Home */}
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            activeTab === "home" ? "text-primary font-extrabold" : "text-slate-500 hover:text-primary"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* Learn - opens the actual AI Tutor lesson page (the tutor tab
            itself), same tab as the elevated center button, but WITHOUT
            popping the chat sheet - that sheet is a separate quick-ask
            overlay that only the center button should open. Distinct from
            "Summary" below (the Learning Hub / video+summary page). */}
        <button
          onClick={() => handleTabChange("tutor")}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            activeTab === "tutor" ? "text-primary font-extrabold" : "text-slate-500 hover:text-primary"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Learn</span>
        </button>

        {/* Elevated Floating AI Tutor Button */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={() => {
              handleTabChange("tutor");
              onOpenTutorSheet();
            }}
            className="w-13 h-13 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all ring-4 ring-white"
            title="AI Tutor Assistant"
          >
            <Sparkles className="w-6 h-6 fill-current text-white" />
          </button>
          <span className={`block text-[10px] font-bold text-center mt-0.5 ${
            activeTab === "tutor" ? "text-primary font-extrabold" : "text-primary font-bold"
          }`}>
            AI Tutor
          </span>
        </div>

        {/* Summary - the Learning Hub page (video explanation + AI summary
            + reference links). Was "Library", pointing at the Upload tab;
            renamed and repointed here since that's what the label means. */}
        <button
          onClick={() => handleTabChange("learning")}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            activeTab === "learning" ? "text-primary font-extrabold" : "text-slate-500 hover:text-primary"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Summary</span>
        </button>

        {/* Assessment - was mislabeled "Profile" with a User icon, but
            already navigated to the assessment tab; just the label/icon
            were wrong. */}
        <button
          onClick={() => handleTabChange("assessment")}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            activeTab === "assessment" ? "text-primary font-extrabold" : "text-slate-500 hover:text-primary"
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Assessment</span>
        </button>
      </div>
    </nav>
  );
}
