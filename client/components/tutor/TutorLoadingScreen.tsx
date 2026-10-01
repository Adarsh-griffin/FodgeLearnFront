import { useEffect, useState } from "react";
import { AILearningLoader } from "@/components/ui/AILearningLoader";

interface TutorLoadingScreenProps {
  message: string;
  /** Optional - cycles every ~1.8s, gives a long generation wait (plan/lesson)
      a sense of real progress instead of one static line the whole time. */
  subMessages?: string[];
  size?: "sm" | "md" | "lg";
}

/**
 * Creative AI Tutor loading screen replacing plain ring spinners with an interactive
 * CSS-animated floating robot, graduation hat, chemistry beaker, physics atom orbit,
 * and stacked books learning scene.
 */
export function TutorLoadingScreen({ message, subMessages, size = "md" }: TutorLoadingScreenProps) {
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    if (!subMessages || subMessages.length < 2) return;
    const interval = setInterval(() => {
      setSubIndex((i) => (i + 1) % subMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [subMessages]);

  const currentSubMessage = subMessages ? subMessages[subIndex] : undefined;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FAFAFC]/80 backdrop-blur-sm min-h-[320px]">
      <AILearningLoader
        size={size}
        message={message}
        subMessage={currentSubMessage}
      />
    </div>
  );
}
