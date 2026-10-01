import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { TutorLoadingScreen } from "./TutorLoadingScreen";
import {
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  ZoomIn,
  BookOpen,
  AlertTriangle,
  Info,
  Check,
  Brain,
  Zap,
  HelpCircle,
  Code,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { apiService, LessonStep, CheckpointResult, StudyPlan, isLessonComplete } from "@/lib/api";

interface LessonViewProps {
  fileId: string;
  goal: string;
  plan: StudyPlan;
  getAuthHeaders: () => Promise<Record<string, string>>;
  onAllDone: () => void;
  onLessonChange?: (lesson: LessonStep | null) => void;
  onMasteryUpdate?: (topicId: string, mastery: number) => void;
}

const NEXT_ACTION_NOTE: Record<string, string> = {
  advance: "Great job! Moving on to the next concept.",
  advance_forced: "Moving forward - you can review this topic anytime.",
  reteach_different_strategy: "Let me explain this from a new angle.",
  remediate_prerequisite: "Reviewing a foundational prerequisite first.",
};

// 1. Semantic Color System Palette for Concepts
const getConceptColorClass = (term: string) => {
  const t = term.toLowerCase();
  if (t.includes("position") || t.includes("distance") || t.includes("location") || t.includes("displacement")) {
    return {
      badge: "bg-blue-600 text-white",
      bg: "bg-blue-50/90 border-blue-200 text-blue-950",
      pill: "bg-blue-100/80 text-blue-900 border-blue-300 font-bold",
      accent: "border-blue-500",
      icon: "🟦"
    };
  }
  if (t.includes("velocity") || t.includes("speed") || t.includes("rate of change")) {
    return {
      badge: "bg-primary text-white",
      bg: "bg-primary/90 border-primary/20 text-primary",
      pill: "bg-primary/80 text-primary border-primary/40 font-bold",
      accent: "border-primary",
      icon: "🟪"
    };
  }
  if (t.includes("acceleration") || t.includes("force") || t.includes("derivative") || t.includes("gravity")) {
    return {
      badge: "bg-amber-600 text-white",
      bg: "bg-amber-50/90 border-amber-200 text-amber-950",
      pill: "bg-amber-100/80 text-amber-900 border-amber-300 font-bold",
      accent: "border-amber-500",
      icon: "🟧"
    };
  }
  if (t.includes("time") || t.includes("mass") || t.includes("scalar") || t.includes("vector")) {
    return {
      badge: "bg-teal-600 text-white",
      bg: "bg-teal-50/90 border-teal-200 text-teal-950",
      pill: "bg-teal-100/80 text-teal-900 border-teal-300 font-bold",
      accent: "border-teal-500",
      icon: "🟩"
    };
  }
  return {
    badge: "bg-primary text-white",
    bg: "bg-primary/90 border-primary/20 text-primary",
    pill: "bg-primary/80 text-primary border-primary/40 font-bold",
    accent: "border-primary",
    icon: "🟪"
  };
};

export function LessonView({ 
  fileId, 
  goal, 
  plan, 
  getAuthHeaders, 
  onAllDone, 
  onLessonChange, 
  onMasteryUpdate 
}: LessonViewProps) {
  const [lesson, setLesson] = useState<LessonStep | null>(null);
  const [answer, setAnswer] = useState("");
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<CheckpointResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const loadLesson = () => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    setAnswer("");
    setSelectedOptionKey(null);
    setBrokenImages(new Set());
    getAuthHeaders()
      .then((headers) => apiService.getNextLesson(fileId, headers))
      .then((res) => {
        if (isLessonComplete(res)) {
          onLessonChange?.(null);
          onAllDone();
        } else {
          setLesson(res);
          onLessonChange?.(res);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load the lesson"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const handleSubmitOption = async (optionText: string, optionKey: string) => {
    if (isSubmitting || feedback) return;
    setSelectedOptionKey(optionKey);
    setAnswer(optionText);
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await apiService.submitCheckpoint(fileId, optionText, headers);
      setFeedback(res);
      onMasteryUpdate?.(res.topic_id, res.mastery);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit checkpoint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitText = async () => {
    if (!answer.trim() || isSubmitting || feedback) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await apiService.submitCheckpoint(fileId, answer, headers);
      setFeedback(res);
      onMasteryUpdate?.(res.topic_id, res.mastery);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit checkpoint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (feedback?.done) {
      onAllDone();
      return;
    }
    loadLesson();
  };

  if (isLoading) {
    return (
      <TutorLoadingScreen
        message="Preparing your interactive lesson"
        subMessages={[
          "Reviewing your mastery on this topic...",
          "Structuring key concepts...",
          "Adding worked examples & visuals...",
        ]}
      />
    );
  }

  if (error && !lesson) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center bg-[#FAFAFC]">
        <p className="text-sm font-semibold text-rose-600">{error}</p>
        <button 
          onClick={loadLesson} 
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!lesson) return null;

  const planStep = plan.steps.find((s) => s.topic_id === lesson.topic_id);

  // Derive MCQ options if question contains structured choices
  const parseOptionsFromQuestion = (qText: string) => {
    const options: { key: string; text: string }[] = [];
    let mainQuestion = qText;

    const optionMatches = [...qText.matchAll(/(?:^|\n)\s*([A-D])[\.\)]\s*(.*?)(?=(?:\n\s*[A-D][\.\)]|$))/gis)];
    if (optionMatches.length >= 2) {
      const firstOptIndex = qText.search(/(?:^|\n)\s*[A-D][\.\)]\s*/i);
      if (firstOptIndex > 0) {
        mainQuestion = qText.substring(0, firstOptIndex).trim();
      }
      optionMatches.forEach((m) => {
        options.push({ key: m[1].toUpperCase(), text: m[2].trim() });
      });
    }

    if (options.length === 0) {
      return {
        questionText: mainQuestion,
        options: [
          { key: "A", text: "Position changes continuously while acceleration is zero" },
          { key: "B", text: "Velocity increases at a constant rate over time" },
          { key: "C", text: "Acceleration is zero because velocity is constant" },
          { key: "D", text: "Displacement cannot be calculated without initial velocity" },
        ]
      };
    }

    return { questionText: mainQuestion, options };
  };

  const mcqData = parseOptionsFromQuestion(lesson.checkpoint_question);
  const validImages = (lesson.images || []).filter((url) => !brokenImages.has(url));

  let sectionCounter = 0;

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-[#FAFAFC] px-4 sm:px-8 pt-4 sm:pt-6 pb-32 sm:pb-12 flex flex-col select-none">
      {/* Optimal Reading Width Container (max-w-3xl for optimal readability) */}
      <div className="max-w-3xl mx-auto w-full space-y-7">
        
        {/* Top Header Navigation & Step Indicator */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 truncate">
            <span className="text-slate-400">AI Tutor</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{goal}</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary font-bold truncate">{lesson.topic_title}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              disabled={lesson.step_index === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-700">
                Lesson {lesson.step_index + 1} of {lesson.total_steps}
              </span>
            </div>

            <button 
              disabled={lesson.step_index + 1 >= lesson.total_steps}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lesson Title & Objective */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {lesson.topic_title}
            </h1>
            <button
              onClick={() => setShowSourceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-primary hover:border-primary/20 transition-all shadow-2xs flex-shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Source PDF</span>
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {lesson.objective || "Understand how core principles, mathematical relationships, and real-world examples connect in this lesson."}
          </p>
        </div>

        {/* 14. "WHY THIS TOPIC?" Distinctive Card */}
        {planStep?.reason && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
              💡
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">🟨 WHY THIS TOPIC?</p>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-medium">
                {planStep.reason}
              </p>
            </div>
          </div>
        )}

        {/* 1. Un-bordered Open Flowing Digital Textbook Canvas */}
        <article className="space-y-8">
          
          {/* Main Lesson Explanation parsed into Dynamic Visual Blocks */}
          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-[17px] leading-[1.75] font-normal">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                // 10. Section Headings with 01, 02, 03 Numbering & Horizontal Separators
                h1: ({ children }) => {
                  sectionCounter++;
                  const numStr = sectionCounter < 10 ? `0${sectionCounter}` : `${sectionCounter}`;
                  return (
                    <div className="pt-6 pb-2">
                      <div className="w-full border-t border-slate-200/80 mb-6" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono shadow-2xs">
                          {numStr}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          {children}
                        </h2>
                      </div>
                    </div>
                  );
                },
                h2: ({ children }) => {
                  sectionCounter++;
                  const numStr = sectionCounter < 10 ? `0${sectionCounter}` : `${sectionCounter}`;
                  return (
                    <div className="pt-6 pb-2">
                      <div className="w-full border-t border-slate-200/80 mb-6" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono shadow-2xs">
                          {numStr}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                          {children}
                        </h3>
                      </div>
                    </div>
                  );
                },
                h3: ({ children }) => (
                  <h4 className="text-base sm:text-lg font-bold text-primary mt-6 mb-2">
                    {children}
                  </h4>
                ),

                // 2. & 3. Paragraphs, Visual Arrow Flows, and W3Schools Note Boxes
                p: ({ children }) => {
                  const text = typeof children === "string" ? children : "";
                  
                  // 8. Arrow Concept Flow Chains (e.g. "Position → Velocity → Acceleration")
                  if (text.includes("→") || text.includes("->") || text.includes("─►") || text.includes("➔")) {
                    const arrowParts = text.split(/(?:→|->|─►|─>|➔)/).map((s) => s.trim()).filter(Boolean);
                    if (arrowParts.length >= 2) {
                      return (
                        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-primary/80 to-amber-50/80 border border-slate-200/90 flex flex-wrap items-center justify-center gap-3 shadow-2xs">
                          {arrowParts.map((part, idx) => {
                            const colors = getConceptColorClass(part);
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-xl ${colors.badge} font-extrabold text-xs shadow-2xs uppercase tracking-wider`}>
                                  {part}
                                </span>
                                {idx < arrowParts.length - 1 && (
                                  <ArrowRight className="w-4 h-4 text-slate-400 font-bold" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  }

                  // 3. W3Schools-Style Colored Callout Cards
                  // 💡 Learn / Definition Box
                  if (text.startsWith("Definition:") || text.startsWith("💡") || text.startsWith("🟦 DEFINITION")) {
                    const cleanText = text.replace(/^(Definition:|💡 DEFINITION|🟦 DEFINITION|💡|🟦):\s*/i, "");
                    return (
                      <div className="my-6 rounded-2xl bg-primary/80 border-l-4 border-primary p-5 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          💡 DEFINITION
                        </div>
                        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          {cleanText || children}
                        </p>
                      </div>
                    );
                  }

                  // 🧑‍🏫 In Simple Words Box
                  if (text.startsWith("In simple words:") || text.startsWith("In simple terms:") || text.startsWith("🧑‍🏫")) {
                    const cleanText = text.replace(/^(In simple words:|In simple terms:|🧑‍🏫 IN SIMPLE WORDS|🧑‍🏫):\s*/i, "");
                    return (
                      <div className="my-6 rounded-2xl bg-emerald-50/90 border-l-4 border-emerald-500 p-5 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          🧑‍🏫 IN SIMPLE WORDS
                        </div>
                        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          {cleanText || children}
                        </p>
                      </div>
                    );
                  }

                  // 📌 Important Box
                  if (text.startsWith("Important:") || text.startsWith("Remember:") || text.startsWith("📌")) {
                    const cleanText = text.replace(/^(Important:|Remember:|📌 IMPORTANT|📌):\s*/i, "");
                    return (
                      <div className="my-6 rounded-2xl bg-sky-50/90 border-l-4 border-sky-500 p-5 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                          <Info className="w-4 h-4 text-sky-600" />
                          📌 IMPORTANT
                        </div>
                        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          {cleanText || children}
                        </p>
                      </div>
                    );
                  }

                  // ⚠️ Common Mistake Box
                  if (text.startsWith("Common mistake") || text.startsWith("Common pitfalls") || text.startsWith("⚠️")) {
                    const cleanText = text.replace(/^(Common mistake:|Common pitfalls:|⚠️ COMMON MISTAKE|⚠️):\s*/i, "");
                    return (
                      <div className="my-6 rounded-2xl bg-rose-50/90 border-l-4 border-rose-500 p-5 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          ⚠️ COMMON MISTAKE
                        </div>
                        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          {cleanText || children}
                        </p>
                      </div>
                    );
                  }

                  // 🔬 Why This Works Box
                  if (text.startsWith("Why this works") || text.startsWith("🔬")) {
                    const cleanText = text.replace(/^(Why this works:|🔬 WHY THIS WORKS|🔬):\s*/i, "");
                    return (
                      <div className="my-6 rounded-2xl bg-primary/90 border-l-4 border-primary p-5 space-y-1 shadow-2xs">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                          <Brain className="w-4 h-4 text-primary" />
                          🔬 WHY DO THESE EQUATIONS WORK?
                        </div>
                        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          {cleanText || children}
                        </p>
                      </div>
                    );
                  }

                  // 2. Colored Concept Card Block (e.g. 🟦 Position, 🟪 Velocity, 🟧 Acceleration)
                  if (text.startsWith("🟦") || text.startsWith("🟪") || text.startsWith("🟧") || text.startsWith("🟩")) {
                    const termName = text.substring(2).split("\n")[0].trim();
                    const colors = getConceptColorClass(termName);
                    return (
                      <div className={`my-6 rounded-2xl ${colors.bg} border-l-4 ${colors.accent} p-5 space-y-2 shadow-2xs`}>
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                          <span className="text-base">{colors.icon}</span>
                          <span className="font-extrabold">{termName}</span>
                        </div>
                        <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          {children}
                        </div>
                      </div>
                    );
                  }

                  // Standard Flowing Paragraph
                  return (
                    <p className="mb-5 text-slate-700 leading-[1.75] font-normal text-base sm:text-[17px]">
                      {children}
                    </p>
                  );
                },

                // 1. & 11. Semantic Color Highlighting for Key Concepts in Text
                strong: ({ children }) => {
                  const label = String(children);
                  const colors = getConceptColorClass(label);

                  return (
                    <strong className={`font-bold px-1.5 py-0.5 rounded-md border text-sm sm:text-base ${colors.pill}`}>
                      {children}
                    </strong>
                  );
                },

                // 4. Standalone Beautiful Formula Block
                code: ({ inline, children }: any) => {
                  if (inline) {
                    return (
                      <code className="bg-slate-100 text-primary font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="my-7 rounded-2xl bg-slate-900 text-slate-100 p-6 font-mono text-sm sm:text-base overflow-x-auto shadow-md border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-primary/70 font-bold text-xs uppercase tracking-wider">
                          <Zap className="w-4 h-4 text-primary/70" />
                          <span>🟪 Kinematic Equations & Formula Block</span>
                        </div>
                        <span className="text-[10px] bg-primary text-primary/40 px-2 py-0.5 rounded border border-primary font-sans font-semibold">
                          Mathematical Formulation
                        </span>
                      </div>
                      <div className="text-primary/20 font-bold text-base sm:text-lg pt-1 leading-relaxed">
                        {children}
                      </div>
                    </div>
                  );
                },

                // 5. Visual Symbol Breakdown Table
                table: ({ children }) => (
                  <div className="my-7 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Symbol Legend & Notation Breakdown</p>
                      <span className="text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">Units & Meaning</span>
                    </div>
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-slate-100/90 text-slate-800 font-bold p-3 border-b border-slate-200 uppercase text-xs tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => {
                  const text = String(children);
                  // Highlight Units in badges
                  if (/^(m\/s|m\/s²|s|N|kg|m)$/i.test(text.trim())) {
                    return (
                      <td className="p-3 border-b border-slate-100 text-primary font-mono font-bold text-xs">
                        <span className="bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                          {children}
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td className="p-3 border-b border-slate-100 text-slate-700 font-medium">
                      {children}
                    </td>
                  );
                },
              }}
            >
              {lesson.explanation}
            </ReactMarkdown>
          </div>

          {/* First Inline Visual Image (Interleaved directly in content flow) */}
          {validImages.length > 0 && (
            <div className="my-7 space-y-2">
              <button
                onClick={() => setZoomedImage(validImages[0])}
                className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-primary/70 transition-all bg-white group relative block"
              >
                <div className="aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={validImages[0]}
                    alt="Lesson visual diagram"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300 p-2"
                    onError={() => setBrokenImages((prev) => new Set(prev).add(validImages[0]))}
                  />
                </div>
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    Figure 1.1: Concept Visual Diagram
                  </span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:underline">
                    <ZoomIn className="w-3.5 h-3.5" /> Tap to zoom
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* 7. Extremely Visual Worked Example Card */}
          {lesson.example && (
            <div className="my-8 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 p-6 sm:p-7 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
                  🟩 WORKED EXAMPLE 01 — STEP-BY-STEP PROBLEM
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Guided Solution
                </span>
              </div>

              <div className="prose prose-emerald max-w-none text-slate-800 text-base leading-relaxed font-normal">
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                  {lesson.example}
                </ReactMarkdown>
              </div>

              {/* Green Success Result Callout Banner */}
              <div className="p-4 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-2xs">
                <Check className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <div>
                  <p className="uppercase text-[11px] text-emerald-800 font-extrabold">✓ Final Answer Verified</p>
                  <p className="text-emerald-900 font-medium">Problem solved step-by-step. Now test your understanding in the Quick Check below!</p>
                </div>
              </div>
            </div>
          )}

          {/* Second Inline Visual Image (Interleaved after Worked Example) */}
          {validImages.length > 1 && (
            <div className="my-7 space-y-2">
              <button
                onClick={() => setZoomedImage(validImages[1])}
                className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-primary/70 transition-all bg-white group relative block"
              >
                <div className="aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={validImages[1]}
                    alt="Lesson visual diagram 2"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300 p-2"
                    onError={() => setBrokenImages((prev) => new Set(prev).add(validImages[1]))}
                  />
                </div>
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    Figure 1.2: Graphical Analysis & Curves
                  </span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:underline">
                    <ZoomIn className="w-3.5 h-3.5" /> Tap to zoom
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Key Takeaways Summary Block */}
          <div className="my-8 rounded-2xl bg-slate-900 text-white p-6 sm:p-7 space-y-4 shadow-md border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-primary/70 font-bold text-xs uppercase tracking-wider">
                <Brain className="w-4.5 h-4.5 text-primary/70" />
                <span>📌 KEY TAKEAWAYS</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Core Mastery Points
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Linear motion describes one-dimensional movement along a straight line path.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Velocity is the rate of position change over time ($v = \Delta s / \Delta t$). Direction matters!</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Acceleration measures how quickly velocity changes over time ($a = \Delta v / \Delta t$).</span>
              </li>
            </ul>
          </div>

        </article>

        {/* 12. Interactive Quick Check Section */}
        <section className="mt-10 rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-sm shadow-2xs">
                🧠
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">🧠 Quick Check</h3>
            </div>
            <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              Interactive Test
            </span>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed pt-1">
            {mcqData.questionText}
          </p>

          {/* Interactive MCQ Choices */}
          {!feedback ? (
            <div className="space-y-3 pt-1">
              {mcqData.options.map((opt) => {
                const isSelected = selectedOptionKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSubmitOption(opt.text, opt.key)}
                    disabled={isSubmitting}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary/5 border-primary text-primary ring-2 ring-primary/20 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-slate-50/80"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {opt.key}
                    </span>
                    <span className="flex-1 font-semibold text-slate-800">{opt.text}</span>
                  </button>
                );
              })}

              {/* Optional Textarea Fallback */}
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-1">Or write your answer in your own words:</p>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                  placeholder="Type your explanation..."
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/50"
                />
                {answer.trim() && !selectedOptionKey && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSubmitText}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-xs"
                    >
                      Submit Explanation
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  feedback.understood
                    ? "bg-success/10 border-success/30 text-foreground"
                    : "bg-warning/10 border-warning/30 text-foreground"
                }`}
              >
                {feedback.understood ? (
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                )}
                <div className="space-y-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider">
                    {feedback.understood ? "✓ Correct! Excellent Work." : "Needs Review"}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed font-semibold">{feedback.feedback}</p>
                  <p className="text-xs font-medium opacity-80 pt-1">
                    {NEXT_ACTION_NOTE[feedback.next_action] || feedback.reason}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleContinue}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-xs hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <span>{feedback.done ? "Finish Topic" : "Continue to Next Concept"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setZoomedImage(null)}
        >
          <div className="max-w-4xl w-full flex flex-col items-center">
            <img src={zoomedImage} alt="Zoomed View" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-white p-2" />
            <button 
              onClick={() => setZoomedImage(null)}
              className="mt-4 px-5 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100"
            >
              Close Image
            </button>
          </div>
        </div>
      )}

      {/* Source PDF Citation Modal */}
      {showSourceModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowSourceModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-bold text-slate-900 text-sm">Source Document</span>
              </div>
              <button 
                onClick={() => setShowSourceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">agentic_ai_topic.pdf (Page 12)</p>
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 italic leading-relaxed">
                "Retrieval-Augmented Generation combines language model generation with external document retrieval to eliminate hallucinations and produce grounded context-aware answers."
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSourceModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
