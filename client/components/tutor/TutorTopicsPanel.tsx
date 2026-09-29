import { FileText, CheckCircle2, Circle } from "lucide-react";
import { StudyPlan } from "@/lib/api";

interface TutorTopicsPanelProps {
  fileName: string | null;
  plan: StudyPlan;
  currentTopicId?: string;
}

/**
 * The left-hand "Current Document + Topics" column on the lesson-delivery
 * screen. Read-only by design: lesson/next always serves whatever the
 * backend's plan pointer says is current (see lesson.py's adapt logic),
 * there's no "jump to any topic" endpoint - so topics here are a progress
 * map, not navigation.
 */
export function TutorTopicsPanel({ fileName, plan, currentTopicId }: TutorTopicsPanelProps) {
  const currentIndex = plan.steps.findIndex((s) => s.topic_id === currentTopicId);

  return (
    <div className="hidden lg:flex w-64 flex-shrink-0 border-r border-border bg-card/40 flex-col overflow-y-auto">
      <div className="p-4 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Current Document</p>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary">
          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm text-foreground truncate">{fileName || "Document"}</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Topics</p>
        <div className="space-y-1">
          {plan.steps.map((step, i) => {
            const isCurrent = step.topic_id === currentTopicId;
            const isDone = currentIndex >= 0 && i < currentIndex;
            return (
              <div
                key={step.topic_id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${
                  isCurrent ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <span className="w-4 h-4 rounded-full border-2 border-primary flex-shrink-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </span>
                ) : (
                  <Circle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="truncate">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
