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
    <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-[#FAFAFC] px-8 text-center">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      <div className="space-y-1.5 min-h-[2.5rem]">
        <p className="text-sm font-semibold text-foreground">{message}</p>
        {subMessages && (
          <p key={subIndex} className="text-xs text-muted-foreground animate-in fade-in duration-500">
            {subMessages[subIndex]}
          </p>
        )}
      </div>
    </div>
  );
}
