import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  apiService,
  DiagnosticQuestion,
  DiagnosticStepResponse,
  DiagnosticResult,
  isDiagnosticDone,
} from "@/lib/api";

interface DiagnosticQuizProps {
  fileId: string;
  goal: string;
  getAuthHeaders: () => Promise<Record<string, string>>;
  onComplete: (result: DiagnosticResult) => void;
}

interface AnsweredState {
  selectedKey: string;
  correctKey?: string;
  correct?: boolean;
  misconception?: string | null;
  topicTitle?: string;
}

/**
 * The adaptive diagnostic quiz (Phase 2's backend, wired up here in Phase
 * 5). MCQ button-grid follows the same pattern as Study.tsx's
 * AssessmentTab, extended to reveal the correct answer (not just
 * right/wrong) once the student has answered - good tutoring practice.
 *
 * State machine: `question` is always the one currently on screen being
 * answered. Submitting an answer does NOT immediately replace it - the
 * server's response (which bundles both feedback on this answer AND the
 * next question) is held in `pendingNext` so the student can see the
 * revealed correct answer and click "Continue" before the next question
 * appears. Conflating the two (rendering the next question's options
 * against the previous answer's feedback) was a real bug caught before
 * this ever ran against a user.
 */
export function DiagnosticQuiz({ fileId, goal, getAuthHeaders, onComplete }: DiagnosticQuizProps) {
  const [question, setQuestion] = useState<DiagnosticQuestion | null>(null);
  const [answered, setAnswered] = useState<AnsweredState | null>(null);
  const [pendingNext, setPendingNext] = useState<DiagnosticStepResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getAuthHeaders()
      .then((headers) => apiService.startDiagnostic(fileId, goal, headers))
      .then((res) => {
        if (cancelled) return;
        if (isDiagnosticDone(res)) {
          // A document with only one topic can finish in zero questions.
          onComplete(res);
        } else {
          setQuestion(res);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to start the diagnostic");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const handleSelect = async (key: string) => {
    if (answered || isSubmitting || !question) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await apiService.answerDiagnostic(fileId, key, headers);
      setAnswered({
        selectedKey: key,
        correctKey: res.correct_key,
        correct: res.correct,
        misconception: res.misconception,
        topicTitle: res.answered_topic_title,
      });
      setPendingNext(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit the answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!pendingNext) return;
    if (isDiagnosticDone(pendingNext)) {
      onComplete(pendingNext);
      return;
    }
    setQuestion(pendingNext);
    setAnswered(null);
    setPendingNext(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const progress = Math.round((question.questions_asked / question.max_questions) * 100);

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-32 sm:pb-12 overflow-y-auto hide-scrollbar">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {question.questions_asked} of {question.max_questions}
            </span>
            <span className="truncate max-w-[50%]">{question.topic_title}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="h-2 rounded-full gradient-brand transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-premium border border-border p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-6 whitespace-pre-wrap">
            {question.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {question.options.map((opt) => {
              let className =
                "p-3.5 sm:p-4 rounded-xl border-2 text-left text-sm sm:text-base transition-all border-border hover:border-primary/40 hover:bg-secondary text-foreground";
              if (answered) {
                if (opt.key === answered.correctKey) {
                  className = "p-3.5 sm:p-4 rounded-xl border-2 text-left text-sm sm:text-base border-green-500 bg-green-50 text-green-900";
                } else if (opt.key === answered.selectedKey) {
                  className = "p-3.5 sm:p-4 rounded-xl border-2 text-left text-sm sm:text-base border-destructive bg-destructive/10 text-destructive";
                } else {
                  className = "p-3.5 sm:p-4 rounded-xl border-2 text-left text-sm sm:text-base border-border text-muted-foreground/60";
                }
              }
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  disabled={!!answered || isSubmitting}
                  className={className}
                >
                  <span className="font-semibold mr-2">{opt.key})</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
                answered.correct ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
              }`}
            >
              {answered.correct ? (
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>
                {answered.correct
                  ? "Correct!"
                  : `Not quite${answered.misconception ? ` - ${answered.misconception}` : ""}.`}
              </span>
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-4">{error}</p>}

          {answered && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleContinue}
                className="px-6 py-2.5 gradient-brand text-white rounded-xl font-semibold hover:opacity-95 active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
