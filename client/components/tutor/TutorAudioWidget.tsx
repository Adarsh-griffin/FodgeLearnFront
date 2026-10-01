import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";

const POSITION_STORAGE_KEY = "learnforge_tutor_audio_widget_pos";
const WIDGET_WIDTH = 224; // w-56
const WIDGET_DEFAULT_HEIGHT = 240;
const EDGE_MARGIN = 16;

interface TutorAudioWidgetProps {
  hasAudio: boolean;
  isSynthesizing: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onGenerateAndPlay: () => void;
  onTogglePlay: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePlaybackRate: () => void;
  formatTime: (secs: number) => string;
}

/**
 * "A digital teacher is teaching me this concept" - a premium flat-vector
 * teacher sticker illustration standing beside a small chalkboard with a
 * generic (topic-agnostic) concept-flow diagram, floating on a soft cream
 * card with no hard rectangular border around the figure itself. Replaces
 * the earlier dark "audio player" banner style entirely. Motion is limited
 * to slow, professional cues (breathing, blinking, a pointer gliding
 * between diagram nodes) - never a full cartoon loop.
 *
 * Freely draggable (pointer events on the wrapper, ignoring clicks that
 * land on the play button/scrubber/speed control) so the learner can park
 * it wherever it doesn't block the lesson text; position is clamped to the
 * viewport and remembered per-browser in localStorage.
 */
export function TutorAudioWidget({
  hasAudio,
  isSynthesizing,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onGenerateAndPlay,
  onTogglePlay,
  onSeek,
  onTogglePlaybackRate,
  formatTime,
}: TutorAudioWidgetProps) {
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const widgetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const clamp = useCallback((x: number, y: number) => {
    const el = widgetRef.current;
    const w = el?.offsetWidth ?? WIDGET_WIDTH;
    const h = el?.offsetHeight ?? WIDGET_DEFAULT_HEIGHT;
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - w - EDGE_MARGIN);
    const maxY = Math.max(EDGE_MARGIN, window.innerHeight - h - EDGE_MARGIN);
    return { x: Math.min(Math.max(x, EDGE_MARGIN), maxX), y: Math.min(Math.max(y, EDGE_MARGIN), maxY) };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          setPosition(clamp(parsed.x, parsed.y));
          return;
        }
      }
    } catch {
      // ignore - fall through to default position
    }
    setPosition(
      clamp(
        EDGE_MARGIN,
        window.innerHeight - WIDGET_DEFAULT_HEIGHT - EDGE_MARGIN,
      ),
    );
  }, [clamp]);

  useEffect(() => {
    const onResize = () => setPosition((pos) => (pos ? clamp(pos.x, pos.y) : pos));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input")) return;
    const el = widgetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragState.current = { dragging: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    setPosition(clamp(e.clientX - dragState.current.offsetX, e.clientY - dragState.current.offsetY));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const el = widgetRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    setPosition((pos) => {
      if (pos) {
        try {
          localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
        } catch {
          // ignore - position just won't persist across reloads
        }
      }
      return pos;
    });
  };

  if (!position) return null;

  return (
    <div
      ref={widgetRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="hidden lg:block fixed z-30 w-56 cursor-grab active:cursor-grabbing select-none"
      style={{ left: position.x, top: position.y, touchAction: "none" }}
    >
      {/* Illustration - teacher + chalkboard, floating directly on the page, no card/background */}
      <div className="relative w-full h-40 flex items-center justify-center">
        <svg
          viewBox="0 0 440 260"
          className="w-auto h-full max-w-full"
          style={{ filter: "drop-shadow(0 10px 18px rgba(23,59,43,0.18))" }}
        >
          {/* ground shadow */}
          <ellipse cx="220" cy="246" rx="130" ry="10" fill="#173B2B" opacity="0.07" />

          {/* ===== Chalkboard ===== */}
          <g transform="translate(18,34) rotate(-1.5)">
            {/* gold frame */}
            <rect x="0" y="0" width="230" height="160" rx="10" fill="#C9954F" />
            {/* board surface */}
            <rect x="7" y="7" width="216" height="146" rx="6" fill="#1F4635" />

            {/* chalk "title" lines */}
            <rect x="24" y="24" width="86" height="5" rx="2.5" fill="#FBF7ED" opacity="0.8" />
            <rect x="24" y="36" width="54" height="5" rx="2.5" fill="#FBF7ED" opacity="0.5" />

            {/* generic 3-node concept-flow diagram */}
            <g transform="translate(24,72)">
              <line x1="16" y1="24" x2="168" y2="24" stroke="#FBF7ED" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="3 4" />

              <g className="animate-chalk-node-pulse">
                <circle cx="16" cy="24" r="15" fill="none" stroke="#E87568" strokeWidth="2.5" />
                <circle cx="16" cy="24" r="4" fill="#E87568" />
              </g>
              <g className="animate-chalk-node-pulse-mid">
                <circle cx="92" cy="24" r="15" fill="none" stroke="#C9954F" strokeWidth="2.5" />
                <circle cx="92" cy="24" r="4" fill="#C9954F" />
              </g>
              <g className="animate-chalk-node-pulse-last">
                <circle cx="168" cy="24" r="15" fill="none" stroke="#FBF7ED" strokeWidth="2.5" />
                <circle cx="168" cy="24" r="4" fill="#FBF7ED" />
              </g>

              {/* arrowheads between nodes */}
              <path d="M34 24 L46 24 M42 20 L46 24 L42 28" stroke="#FBF7ED" strokeOpacity="0.5" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M110 24 L122 24 M118 20 L122 24 L118 28" stroke="#FBF7ED" strokeOpacity="0.5" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />

              {/* gliding chalk pointer (tip) tracking the active node */}
              <g className="animate-chalk-pointer-glide">
                <path d="M16 46 L16 56" stroke="#FBF7ED" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="59" r="2.3" fill="#FBF7ED" />
              </g>
            </g>

            {/* a short underlined keyword, generic across subjects */}
            <rect x="24" y="118" width="60" height="5" rx="2.5" fill="#FBF7ED" opacity="0.65" />
            <rect x="24" y="127" width="60" height="1.6" fill="#C9954F" />
          </g>

          {/* ===== Teacher figure ===== */}
          <g className="animate-boy-idle-sway" style={{ transformOrigin: "320px 246px" }}>
            <g className="animate-boy-breathe" style={{ transformOrigin: "320px 170px" }}>
              {/* legs */}
              <rect x="300" y="208" width="14" height="38" rx="5" fill="#173B2B" />
              <rect x="330" y="208" width="14" height="38" rx="5" fill="#173B2B" />
              {/* shoes */}
              <rect x="296" y="242" width="22" height="7" rx="3.5" fill="#0F2A1F" />
              <rect x="326" y="242" width="22" height="7" rx="3.5" fill="#0F2A1F" />

              {/* blazer body */}
              <path
                d="M292 150 Q292 128 322 126 Q352 128 352 150 L358 212 Q322 224 286 212 Z"
                fill="#4F7960"
              />
              {/* shirt */}
              <path d="M312 134 L322 150 L332 134 L326 128 L318 128 Z" fill="#FBF7ED" />
              {/* tie */}
              <path d="M320 140 L324 140 L327 158 L322 166 L317 158 Z" fill="#C9954F" />

              {/* pointing arm + stick, slow sway toward the board */}
              <g className="animate-arm-sway" style={{ transformOrigin: "298px 146px" }}>
                <path d="M298 146 L250 118" stroke="#4F7960" strokeWidth="13" strokeLinecap="round" />
                <path d="M250 118 L226 104" stroke="#8A6A3E" strokeWidth="3" strokeLinecap="round" />
              </g>
              {/* other arm, resting */}
              <path d="M346 150 L362 182" stroke="#4F7960" strokeWidth="13" strokeLinecap="round" />
              <circle cx="364" cy="188" r="7" fill="#F2C9A4" />

              {/* neck + head */}
              <rect x="313" y="110" width="18" height="16" rx="6" fill="#F2C9A4" />
              <circle cx="322" cy="96" r="24" fill="#F2C9A4" />

              {/* hair */}
              <path
                d="M298 92 Q296 68 322 66 Q348 68 346 92 Q346 78 322 80 Q300 79 298 92 Z"
                fill="#173B2B"
              />

              {/* glasses, reads as "educator" */}
              <circle cx="314" cy="97" r="6" fill="none" stroke="#173B2B" strokeWidth="1.6" />
              <circle cx="330" cy="97" r="6" fill="none" stroke="#173B2B" strokeWidth="1.6" />
              <line x1="320" y1="97" x2="324" y2="97" stroke="#173B2B" strokeWidth="1.6" />

              {/* eyes (blink) */}
              <g className="animate-boy-natural-blink">
                <circle cx="314" cy="97" r="1.5" fill="#173B2B" />
                <circle cx="330" cy="97" r="1.5" fill="#173B2B" />
              </g>

              {/* smile */}
              <path d="M314 106 Q322 111 330 106" stroke="#173B2B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </svg>
      </div>

      {/* Minimal media control */}
      {hasAudio ? (
        <div className="mt-2 sm:mt-3 space-y-1.5">
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-[#173B2B] hover:bg-[#0F2A1F] text-[#FBF7ED] flex items-center justify-center transition-colors active:scale-95"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={onSeek}
              className="flex-1 h-1 rounded-full cursor-pointer accent-[#173B2B]"
              style={{
                background: `linear-gradient(to right, #4F7960 ${progressPct}%, #E4DCC8 ${progressPct}%)`,
              }}
            />
            <button
              onClick={onTogglePlaybackRate}
              className="text-xs font-semibold text-[#4F7960] hover:text-[#173B2B] transition-colors flex-shrink-0"
              title="Playback speed"
            >
              {playbackRate}×
            </button>
          </div>
          <p className="text-center text-[11px] font-medium text-[#8A9A90]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
      ) : (
        <div className="mt-2 sm:mt-3 flex justify-center">
          <button
            onClick={onGenerateAndPlay}
            disabled={isSynthesizing}
            className="flex items-center gap-2 text-sm font-semibold text-[#173B2B] hover:text-[#0F2A1F] transition-colors disabled:opacity-60"
          >
            {isSynthesizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isSynthesizing ? "Preparing explanation..." : "Listen to explanation"}
          </button>
        </div>
      )}
    </div>
  );
}
