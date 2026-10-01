import React from "react";

interface AILearningLoaderProps {
  /** Size variant: "sm" (compact inline), "md" (standard card), "lg" (full screen) */
  size?: "sm" | "md" | "lg";
  /** Main loading message */
  message?: string;
  /** Sub-messages cycling text */
  subMessage?: string;
  className?: string;
}

export function AILearningLoader({
  size = "md",
  message,
  subMessage,
  className = "",
}: AILearningLoaderProps) {
  // Scaling factors based on size
  const containerClasses = {
    sm: "w-44 h-32 scale-90",
    md: "w-72 h-52 scale-100",
    lg: "w-96 h-64 scale-110",
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Main Illustration Graphic Stage */}
      <div className={`relative flex items-center justify-center ${containerClasses}`}>
        {/* 1. Soft Gradient Morphing Aura Blob Background */}
        <div className="absolute inset-2 bg-gradient-to-tr from-indigo-200/60 via-purple-200/50 to-pink-200/60 blur-xl opacity-80 animate-ai-blob" />

        {/* 2. Floating AI Tutor Scene Wrapper */}
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Decorative Sparkles & Glowing Particles */}
          <div className="absolute top-2 left-6 text-amber-400 animate-ai-sparkle-1 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
          <div className="absolute top-4 right-8 text-indigo-400 animate-ai-sparkle-2 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 9.41L12 0Z" />
            </svg>
          </div>
          <div className="absolute bottom-6 left-10 text-pink-400 animate-ai-sparkle-3 pointer-events-none">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>

          <div className="relative flex items-end justify-center gap-2">
            {/* --- AI TUTOR ROBOT (LEFT) --- */}
            <div className="relative flex flex-col items-center">
              {/* Animated Floating Robot Body */}
              <div className="animate-ai-float z-10 flex flex-col items-center">
                {/* Robot Graduation Hat / Mortarboard */}
                <div className="relative z-20 -mb-2.5 flex flex-col items-center">
                  <div className="w-12 h-2.5 bg-slate-900 rounded-sm transform -rotate-3 shadow-md relative">
                    <div className="absolute top-[-5px] left-[18px] w-5 h-2.5 bg-indigo-900 rounded-t-sm" />
                    {/* Swing Tassel */}
                    <div className="absolute top-1 left-2 w-1 h-5 bg-amber-400 rounded-full animate-ai-tassel">
                      <div className="absolute bottom-0 left-[-2px] w-2 h-2 bg-amber-400 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Robot Head */}
                <div className="w-16 h-14 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-3xl p-1.5 shadow-lg border-2 border-indigo-300 relative flex items-center justify-center">
                  {/* Digital Face Screen */}
                  <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center gap-2 px-2 border border-indigo-400/40 relative overflow-hidden shadow-inner">
                    {/* Cheerful Animated Eyes */}
                    <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-ai-blink flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full translate-x-[-1px] translate-y-[-1px]" />
                    </div>
                    <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-ai-blink flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full translate-x-[-1px] translate-y-[-1px]" />
                    </div>
                    {/* Cute Smiling Mouth */}
                    <div className="absolute bottom-1.5 w-3 h-1.5 border-b-2 border-cyan-300 rounded-b-full" />
                  </div>

                  {/* Cute Ear Nubs */}
                  <div className="absolute -left-1.5 top-5 w-2 h-4 bg-indigo-400 rounded-l-md" />
                  <div className="absolute -right-1.5 top-5 w-2 h-4 bg-indigo-400 rounded-r-md" />
                </div>

                {/* Robot Neck & Torso */}
                <div className="relative mt-0.5 flex flex-col items-center">
                  <div className="w-3 h-1 bg-indigo-300 rounded-full" />
                  <div className="w-12 h-10 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-2xl shadow-md border border-indigo-300 flex items-center justify-center relative">
                    {/* Glowing Core Gem */}
                    <div className="w-3 h-3 bg-cyan-300 rounded-full shadow-[0_0_10px_#67e8f9] animate-pulse" />
                    
                    {/* Waving Right Hand */}
                    <div className="absolute -left-3 top-1 animate-ai-wave">
                      <div className="w-3.5 h-3.5 bg-indigo-400 rounded-full border border-indigo-200 shadow-sm" />
                    </div>
                    {/* Resting Left Hand */}
                    <div className="absolute -right-2.5 top-2">
                      <div className="w-3 h-3 bg-indigo-400 rounded-full border border-indigo-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Ground Shadow (Pulsing in Sync) */}
              <div className="w-10 h-2 bg-indigo-950/20 rounded-full blur-[2px] mt-1 animate-ai-shadow" />
            </div>

            {/* --- DIGITAL LEARNING SCREEN & SCIENCE NODES (RIGHT) --- */}
            <div className="relative flex flex-col items-center">
              {/* Learning Window */}
              <div className="w-36 h-28 bg-white/90 backdrop-blur-md rounded-xl border-2 border-purple-300 shadow-xl overflow-hidden flex flex-col">
                {/* Window Top Bar */}
                <div className="h-5 bg-gradient-to-r from-purple-600 to-indigo-600 px-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                </div>

                {/* Window Main Canvas with Interactive Science Icons */}
                <div className="flex-1 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 p-2 flex items-center justify-around relative overflow-hidden">
                  {/* Subtle Grid Pattern Background */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:8px_8px]" />

                  {/* Science Icon 1: Chemistry Flask / Beaker */}
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 shadow-md flex items-center justify-center border border-white/60">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55A1 1 0 0 0 5.608 22h12.784a1 1 0 0 0 .888-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
                      <path d="M8.5 2h7" />
                      <path d="M7 16h10" />
                    </svg>
                    {/* Animated Flask Bubbles */}
                    <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-white rounded-full animate-ai-bubble-1" />
                    <div className="absolute bottom-2 right-3 w-1 h-1 bg-white rounded-full animate-ai-bubble-2" />
                  </div>

                  {/* Science Icon 2: Atom Physics Orbit */}
                  <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-md flex items-center justify-center border border-white/60">
                    {/* Rotating Orbital Ring 1 */}
                    <div className="absolute inset-1 rounded-full border border-cyan-300/80 border-t-transparent animate-ai-orbit-1" />
                    {/* Rotating Orbital Ring 2 */}
                    <div className="absolute inset-1 rounded-full border border-pink-300/80 border-b-transparent animate-ai-orbit-2" />
                    {/* Atom Nucleus Center */}
                    <div className="w-3 h-3 bg-amber-300 rounded-full shadow-[0_0_6px_#fde047]" />
                  </div>
                </div>
              </div>

              {/* Stack of Books Base */}
              <div className="relative -mt-2 w-40 flex flex-col items-end">
                {/* Top Book (Purple) */}
                <div className="w-36 h-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-sm border border-purple-400 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-4 w-3 h-full bg-amber-400" />
                </div>
                {/* Bottom Book (Pink/Rose) */}
                <div className="w-40 h-3.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-b-md border border-pink-400 shadow-md relative overflow-hidden -mt-0.5">
                  {/* Hanging Bookmark Ribbon */}
                  <div className="absolute top-0 left-8 w-2.5 h-5 bg-amber-400 rounded-b-sm shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shimmering Progress Bar */}
      <div className="w-48 h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner">
        <div className="absolute inset-y-0 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-ai-shimmer" />
      </div>

      {/* Message and Sub-messages */}
      {(message || subMessage) && (
        <div className="space-y-1 text-center max-w-sm px-4">
          {message && (
            <p className="text-sm font-semibold text-slate-800 tracking-wide">
              {message}
            </p>
          )}
          {subMessage && (
            <p className="text-xs text-slate-500 font-medium animate-in fade-in duration-300">
              {subMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
