import { useState } from "react";
import { Sparkles, Compass, GraduationCap, Zap, BookOpen, Target, Clock, ArrowRight } from "lucide-react";

const GOALS = [
  {
    value: "Understand the topic deeply",
    title: "Deep Understanding",
    description: "Master core concepts and mental models",
    icon: Compass,
  },
  {
    value: "Prepare for an exam",
    title: "Exam Preparation",
    description: "Targeted problem solving & recall practice",
    icon: GraduationCap,
  },
  {
    value: "Quick revision",
    title: "Quick Refresher",
    description: "Fast summary and high-yield facts",
    icon: Zap,
  },
  {
    value: "Learn from scratch",
    title: "Start From Scratch",
    description: "Step-by-step foundational lessons",
    icon: BookOpen,
  },
];

const TIME_OPTIONS = [
  { minutes: 15, label: "Quick Sprint" },
  { minutes: 30, label: "Standard" },
  { minutes: 45, label: "Focused" },
  { minutes: 60, label: "Deep Dive" },
];

export function OnboardingStep({ onComplete }: { onComplete: (goal: string, minutes: number) => void }) {
  const [goal, setGoal] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);

  const canContinue = !!goal && !!minutes;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pb-32 sm:pb-12 overflow-y-auto hide-scrollbar bg-[#FAFAFC]">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-primary" />

        <div className="p-6 sm:p-9">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-[11px] font-bold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI Session Planner
            </span>
            <h1 className="text-h1 text-slate-900">
              Customize Your{" "}
              <span className="text-primary">
                Learning Path
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-3 max-w-sm leading-relaxed">
              Tell your AI tutor how you learn best. We'll calibrate the questions and pace specifically for you.
            </p>
          </div>

          {/* Goal Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">What is your primary goal?</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Select one</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map(({ value, title, description, icon: Icon }) => {
                const isSelected = goal === value;
                return (
                  <button
                    key={value}
                    onClick={() => setGoal(value)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-200 hover:border-primary/40 bg-white"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">How much time do you have?</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Session duration</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_OPTIONS.map(({ minutes: m, label }) => {
                const isSelected = minutes === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMinutes(m)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-200 hover:border-primary/40 bg-white"
                    }`}
                  >
                    <p className="text-lg font-extrabold text-slate-900">
                      {m}
                      <span className="text-xs font-semibold text-slate-400 ml-0.5">min</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => canContinue && onComplete(goal, minutes)}
            disabled={!canContinue}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Start Diagnostic Session
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">
            Choose your goal and time to start your adaptive test
          </p>
        </div>
      </div>
    </div>
  );
}
