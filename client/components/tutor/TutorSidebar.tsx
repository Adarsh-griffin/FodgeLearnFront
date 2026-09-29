import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Library, 
  Upload, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  Circle, 
  FileCheck,
  RotateCcw
} from "lucide-react";
import { StudyPlan } from "@/lib/api";

interface TutorSidebarProps {
  activeTab: "upload" | "learning" | "assessment" | "tutor";
  handleTabChange: (tab: "upload" | "learning" | "assessment" | "tutor") => void;
  navigate: (path: string | number) => void;
  fileName: string | null;
  plan?: StudyPlan | null;
  currentTopicId?: string;
  onChangeDocument?: () => void;
  onSelectTopic?: (topicId: string) => void;
}

export function TutorSidebar({
  activeTab,
  handleTabChange,
  navigate,
  fileName,
  plan,
  currentTopicId,
  onChangeDocument,
}: TutorSidebarProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home, action: () => navigate("/") },
    { id: "learning", label: "My Learning", icon: BookOpen, action: () => handleTabChange("learning") },
    { id: "tutor", label: "AI Tutor", icon: GraduationCap, action: () => handleTabChange("tutor"), active: true },
    { id: "library", label: "Library", icon: Library, action: () => handleTabChange("learning") },
    { id: "upload", label: "Upload", icon: Upload, action: () => handleTabChange("upload") },
    { id: "assessment", label: "Assessments", icon: FileText, action: () => handleTabChange("assessment") },
    { id: "progress", label: "Progress", icon: BarChart3, action: () => handleTabChange("learning") },
  ];

  const currentIndex = plan?.steps.findIndex((s) => s.topic_id === currentTopicId) ?? -1;

  return (
    <aside className="hidden lg:flex w-56 sm:w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex-col h-full overflow-y-auto hide-scrollbar select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
        >
          <img src="/navbarlogo.png" alt="Learnfodge" className="h-7 w-auto object-contain" />
        </button>
      </div>

      {/* Main App Navigation */}
      <div className="px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "tutor" ? activeTab === "tutor" : false;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50/80 text-indigo-600 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="my-3 mx-4 border-t border-slate-150" />

      {/* Current Document Card */}
      <div className="px-4 py-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Current Document
        </p>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate" title={fileName || "Document"}>
                {fileName || "rag_topic.pdf"}
              </p>
              <p className="text-[11px] text-slate-400 font-normal">152 pages • PDF</p>
            </div>
          </div>
          {onChangeDocument && (
            <button
              onClick={onChangeDocument}
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline text-left pt-1"
            >
              Change document
            </button>
          )}
        </div>
      </div>

      {/* Topics Roadmap List */}
      {plan && plan.steps.length > 0 && (
        <div className="px-4 py-3 flex-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Topics
          </p>
          <div className="space-y-1">
            {plan.steps.map((step, i) => {
              const isCurrent = step.topic_id === currentTopicId;
              const isDone = currentIndex >= 0 && i < currentIndex;
              return (
                <div
                  key={step.topic_id}
                  className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all ${
                    isCurrent
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold border border-indigo-100/80 shadow-2xs"
                      : isDone
                      ? "text-slate-700 hover:bg-slate-50"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full border-2 border-indigo-600 flex-shrink-0 flex items-center justify-center bg-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    </span>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span className="truncate flex-1">{step.title}</span>
                  {(step as unknown as { is_remediation?: boolean }).is_remediation ? (
                    <span title="Prerequisite review">
                      <RotateCcw className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
