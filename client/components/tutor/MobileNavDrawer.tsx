import {
  X,
  Home,
  BookOpen,
  GraduationCap,
  Upload,
  FileText,
  CheckCircle2,
  Circle,
  FileCheck,
  RotateCcw
} from "lucide-react";
import { StudyPlan } from "@/lib/api";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "upload" | "learning" | "assessment" | "tutor";
  handleTabChange: (tab: "upload" | "learning" | "assessment" | "tutor") => void;
  navigate: (path: string | number) => void;
  fileName: string | null;
  plan?: StudyPlan | null;
  currentTopicId?: string;
  onChangeDocument?: () => void;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  activeTab,
  handleTabChange,
  navigate,
  fileName,
  plan,
  currentTopicId,
  onChangeDocument,
}: MobileNavDrawerProps) {
  if (!isOpen) return null;

  const navItems = [
    { id: "home", label: "Home", icon: Home, action: () => { navigate("/"); onClose(); } },
    { id: "upload", label: "Upload", icon: Upload, action: () => { handleTabChange("upload"); onClose(); } },
    { id: "tutor", label: "AI Tutor", icon: GraduationCap, action: () => { handleTabChange("tutor"); onClose(); } },
    { id: "learning", label: "Summary", icon: BookOpen, action: () => { handleTabChange("learning"); onClose(); } },
    { id: "assessment", label: "Assessments", icon: FileText, action: () => { handleTabChange("assessment"); onClose(); } },
  ];

  const currentIndex = plan?.steps.findIndex((s) => s.topic_id === currentTopicId) ?? -1;

  // Typed-topic sessions are backed by a synthetic placeholder PDF
  // (see `createMinimalPdfBlob` in Study.tsx, named "<topic>_topic.pdf")
  // rather than a real uploaded file - don't show a PDF icon/page count
  // for something the user never actually uploaded.
  const isTypedTopic = !!fileName?.endsWith("_topic.pdf");
  const displayName = isTypedTopic
    ? fileName!.replace(/_topic\.pdf$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : fileName;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Panel */}
      <aside className="relative w-4/5 max-w-xs bg-white h-full flex flex-col z-10 shadow-2xl overflow-y-auto hide-scrollbar animate-in slide-in-from-left duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <img src="/navbarlogo.png" alt="LearnForge" className="h-7 w-auto object-contain" />
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/5 text-primary shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="my-2 mx-4 border-t border-slate-150" />

        {/* Current Document / Topic */}
        <div className="px-4 py-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isTypedTopic ? "Current Topic" : "Current Document"}
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-2">
            {isTypedTopic ? (
              <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
            ) : (
              <div className="flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{displayName || "rag_topic.pdf"}</p>
                  <p className="text-[11px] text-slate-400">152 pages • PDF</p>
                </div>
              </div>
            )}
            {onChangeDocument && (
              <button
                onClick={() => { onChangeDocument(); onClose(); }}
                className="text-[11px] font-semibold text-primary hover:underline text-left pt-1"
              >
                Change document
              </button>
            )}
          </div>
        </div>

        {/* Topics Roadmap List */}
        {plan && plan.steps.length > 0 && (
          <div className="px-4 py-3 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Topics Roadmap</p>
            <div className="space-y-1">
              {plan.steps.map((step, i) => {
                const isCurrent = step.topic_id === currentTopicId;
                const isDone = currentIndex >= 0 && i < currentIndex;
                return (
                  <div
                    key={step.topic_id}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? "bg-primary/5 text-primary font-semibold border border-primary/10"
                        : isDone
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-4 h-4 rounded-full border-2 border-primary flex-shrink-0 flex items-center justify-center bg-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="truncate flex-1">{step.title}</span>
                    {(step as unknown as { is_remediation?: boolean }).is_remediation ? (
                      <RotateCcw className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
