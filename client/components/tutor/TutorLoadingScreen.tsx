import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface TutorLoadingScreenProps {
  message: string;
  /** Optional - cycles every ~1.8s, gives a long generation wait (plan/lesson)
      a sense of real progress instead of one static line the whole time. */
  subMessages?: string[];
}

/**
 * Shared "something's happening" screen for every AI Tutor wait state
 * (initial load, diagnostic questions, plan generation, lesson generation)
 * - replaces four separate plain spinner+text blocks that all looked like
 * the page had stalled, per user feedback on how flat they read.
 */
export function TutorLoadingScreen({ message, subMessages }: TutorLoadingScreenProps) {
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    if (!subMessages || subMessages.length < 2) return;
    const interval = setInterval(() => {
      setSubIndex((i) => (i + 1) % subMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [subMessages]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-[#FAFAFC] px-8 text-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 opacity-25 animate-ping" />
        <span className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 opacity-30 blur-md animate-pulse" />
        <span className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </span>
      </div>

      <div className="space-y-2 min-h-[2.5rem]">
        <p className="text-sm font-bold text-slate-800">{message}</p>
        {subMessages && (
          <p key={subIndex} className="text-xs text-slate-400 font-medium animate-in fade-in duration-500">
            {subMessages[subIndex]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
