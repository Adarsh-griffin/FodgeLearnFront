import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { CheckCircle, XCircle, BookOpen, RotateCcw } from "lucide-react";
import { apiService, LessonStep, CheckpointResult, isLessonComplete } from "@/lib/api";

interface LessonViewProps {
  fileId: string;
  getAuthHeaders: () => Promise<Record<string, string>>;
  onAllDone: () => void;
}

const NEXT_ACTION_NOTE: Record<string, string> = {
  advance: "Moving on to the next topic.",
  advance_forced: "Moving on for now - you can revisit this topic later.",
  reteach_different_strategy: "Let's try a different approach for this one.",
  remediate_prerequisite: "Reviewing a prerequisite concept first.",
};

/**
 * Phase 4's Teach -> Check -> Adapt loop, rendered. `lesson` always holds
 * the CURRENT unanswered lesson; submitting a checkpoint shows `feedback`
 * over it without replacing the lesson content (so the student can still
 * see what they were taught while reading the feedback) until "Continue"
 * explicitly fetches whatever comes next - which per lesson.py's adapt
 * logic could be the next planned topic, a reteach of this same topic
 * with a new strategy, or an inserted prerequisite remediation.
 */
export function LessonView({ fileId, getAuthHeaders, onAllDone }: LessonViewProps) {
  const [lesson, setLesson] = useState<LessonStep | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<CheckpointResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLesson = () => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    setAnswer("");
    getAuthHeaders()
      .then((headers) => apiService.getNextLesson(fileId, headers))
      .then((res) => {
        if (isLessonComplete(res)) {
          onAllDone();
        } else {
          setLesson(res);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load the lesson"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting || feedback) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await apiService.submitCheckpoint(fileId, answer, headers);
      setFeedback(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit your answer");
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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            Step {lesson.step_index + 1} of {lesson.total_steps}
          </span>
          {lesson.is_remediation && (
            <span className="flex items-center gap-1 text-gold font-medium">
              <RotateCcw className="w-3.5 h-3.5" />
              Prerequisite review
            </span>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-premium border border-border p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">{lesson.topic_title}</h1>
          </div>

          <p className="text-sm text-muted-foreground italic mb-4">{lesson.objective}</p>

          <div className="prose prose-sm max-w-none text-foreground/90 mb-4">
            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
              {lesson.explanation}
            </ReactMarkdown>
          </div>

          {lesson.example && (
            <div className="bg-secondary rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Example</p>
              <div className="prose prose-sm max-w-none text-foreground/90">
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {lesson.example}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-premium border border-border p-4 sm:p-6">
          <p className="font-medium text-foreground mb-3">{lesson.checkpoint_question}</p>

          {!feedback ? (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                placeholder="Explain your answer in your own words..."
                className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 bg-background"
              />
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 gradient-brand text-white rounded-xl font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Submit Answer
                </button>
              </div>
            </>
          ) : (
            <div>
              <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground mb-3 italic">"{answer}"</div>
              <div
                className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                  feedback.understood ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
                }`}
              >
                {feedback.understood ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{feedback.feedback}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {NEXT_ACTION_NOTE[feedback.next_action] || feedback.reason}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleContinue}
                  className="w-full sm:w-auto px-6 py-2.5 gradient-brand text-white rounded-xl font-semibold hover:opacity-95 active:scale-[0.98] transition-all"
                >
                  {feedback.done ? "Finish" : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
