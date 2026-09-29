import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, ArrowDown } from "lucide-react";
import { StudyPlan, StudyPlanStep, MasteryBand } from "@/lib/api";

// Exported so LessonView/TutorTopicsPanel (the lesson-delivery screen) can
// use the exact same band/mode vocabulary as the roadmap - one source of
// truth for how a mastery band or delivery mode is labeled/colored.
export const BAND_STYLES: Record<MasteryBand, { label: string; bg: string; text: string; bar: string }> = {
  teach: { label: "Not yet learned", bg: "bg-red-50", text: "text-red-700", bar: "bg-red-400" },
  practice: { label: "Developing", bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" },
  apply: { label: "Almost there", bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-400" },
  review: { label: "Already strong", bg: "bg-green-50", text: "text-green-700", bar: "bg-green-400" },
};

export const MODE_LABELS: Record<string, string> = {
  worked_example: "Worked examples",
  socratic: "Guided questions",
  direct_explanation: "Direct explanation",
  review: "Quick refresher",
};

function StepCard({ step, index }: { step: StudyPlanStep; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const style = BAND_STYLES[step.band];

  return (
    <div className="bg-card rounded-xl shadow-premium border border-border p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {step.estimated_minutes} min
            </span>
            <span>{MODE_LABELS[step.delivery_mode] || step.delivery_mode}</span>
            <span>{Math.round(step.mastery * 100)}% mastery</span>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 mb-3">
            <div
              className={`h-1.5 rounded-full ${style.bar}`}
              style={{ width: `${Math.max(4, Math.round(step.mastery * 100))}%` }}
            />
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
          >
            Why this order?
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {expanded && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.reason}</p>}
        </div>
      </div>
    </div>
  );
}

export function RoadmapView({ plan, onStart }: { plan: StudyPlan; onStart: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-4 sm:p-8 pb-32 sm:pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Your Learning Path</h1>
          <p className="text-sm text-muted-foreground">
            {plan.steps.length} topic{plan.steps.length === 1 ? "" : "s"} - about {plan.total_minutes} minutes, built
            from your diagnostic results.
          </p>
        </div>

        <div className="space-y-3">
          {plan.steps.map((step, i) => (
            <div key={step.topic_id}>
              <StepCard step={step} index={i} />
              {i < plan.steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-border" />
                </div>
              )}
            </div>
          ))}
        </div>

        {plan.deferred_topics.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-xl text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Not in this session (didn't fit your time budget): </span>
            {plan.deferred_topics.map((t) => t.title).join(", ")}
          </div>
        )}

        <div className="mt-8 mb-6 flex justify-center">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
