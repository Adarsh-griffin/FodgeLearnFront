import { useState } from "react";
import {
  Home,
  BookOpen,
  GraduationCap,
  Upload,
  FileText,
  CheckCircle2,
  Circle,
  FileCheck,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen
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
  // Collapse state is in-memory only: it sticks across tab switches within
  // this page session but resets on reload, since nothing in this app
  // persists to local storage.
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home, action: () => navigate("/") },
    { id: "upload", label: "Upload", icon: Upload, action: () => handleTabChange("upload") },
    { id: "tutor", label: "AI Tutor", icon: GraduationCap, action: () => handleTabChange("tutor") },
    { id: "learning", label: "Summary", icon: BookOpen, action: () => handleTabChange("learning") },
    { id: "assessment", label: "Assessments", icon: FileText, action: () => handleTabChange("assessment") },
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
    <aside
      className={`hidden lg:flex ${isCollapsed ? "w-16" : "w-56 sm:w-64"} flex-shrink-0 bg-white border-r border-slate-200/80 flex-col h-full overflow-y-auto hide-scrollbar select-none transition-[width] duration-200`}
    >
      {/* Brand Header + Collapse Toggle */}
      <div className={`p-4 sm:p-5 pb-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity min-w-0"
          >
            <img src="/navbarlogo.png" alt="LearnForge" className="h-7 w-auto object-contain" />
          </button>
        )}
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4.5 h-4.5" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Main App Navigation */}
      <div className="px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={item.action}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {isCollapsed ? null : (
        <>
      <div className="my-3 mx-4 border-t border-slate-150" />

      {/* Current Document / Topic Card - only when there's a real file to
          show; otherwise this would just be showing fake placeholder data. */}
      {fileName && (
      <div className="px-4 py-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {isTypedTopic ? "Current Topic" : "Current Document"}
        </p>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-2">
          {isTypedTopic ? (
            <p className="text-xs font-semibold text-slate-800 truncate" title={displayName || "Topic"}>
              {displayName}
            </p>
          ) : (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate" title={displayName || "Document"}>
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 font-normal">152 pages • PDF</p>
              </div>
            </div>
          )}
          {onChangeDocument && (
            <button
              onClick={onChangeDocument}
              className="text-[11px] font-medium text-primary hover:text-primary/80 hover:underline text-left pt-1"
            >
              Change document
            </button>
          )}
        </div>
      </div>
      )}

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
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-2xs"
                      : isDone
                      ? "text-slate-700 hover:bg-slate-50"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
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
        </>
      )}
    </aside>
  );
}
