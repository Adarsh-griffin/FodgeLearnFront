import { useState } from "react";
import { Target, Clock } from "lucide-react";

const GOALS = [
  "Understand the topic deeply",
  "Prepare for an exam",
  "Quick revision",
  "Learn from scratch",
];

const TIME_OPTIONS = [15, 30, 45, 60];

export function OnboardingStep({ onComplete }: { onComplete: (goal: string, minutes: number) => void }) {
  const [goal, setGoal] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);

  const canContinue = !!goal && !!minutes;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pb-32 sm:pb-12 overflow-y-auto hide-scrollbar">
      <div className="max-w-lg w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">What's your goal?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`p-3.5 rounded-xl border-2 text-sm text-left transition-all ${
                  goal === g
                    ? "border-primary bg-secondary text-secondary-foreground"
                    : "border-border hover:border-primary/40 text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">How much time do you have?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIME_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  minutes === m
                    ? "border-primary bg-secondary text-secondary-foreground"
                    : "border-border hover:border-primary/40 text-foreground"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => canContinue && onComplete(goal, minutes)}
          disabled={!canContinue}
          className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold shadow-premium hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Start Diagnostic
        </button>
      </div>
    </div>
  );
}
