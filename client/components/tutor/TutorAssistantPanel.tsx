import { useRef, useState } from "react";
import { 
  Mic, 
  Square, 
  Send, 
  Volume2, 
  Sparkles, 
  Target, 
  Play, 
  HelpCircle,
  Lightbulb,
  Maximize2,
  ArrowRight
} from "lucide-react";
import { apiService, StudyPlan, masteryBandClient } from "@/lib/api";
import { BAND_STYLES } from "./RoadmapView";

interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "Explain simply", action: "Can you explain this concept in very simple, beginner-friendly terms?" },
  { label: "Give an example", action: "Can you provide a clear, real-world worked example of this?" },
  { label: "Show diagram", action: "Can you describe the visual diagram or workflow for this topic step by step?" },
  { label: "Quiz me", action: "Can you ask me a quick quiz question to test my understanding?" },
  { label: "Explain differently", action: "I'm having trouble understanding this. Can you explain it differently using a new perspective?" },
  { label: "Real-world analogy", action: "Can you explain this using an easy-to-understand real-world analogy?" },
];

interface TutorAssistantPanelProps {
  fileName: string | null;
  plan: StudyPlan;
  currentTopicId?: string;
  currentTopicTitle?: string;
  currentExplanation?: string;
}

export function TutorAssistantPanel({
  fileName,
  plan,
  currentTopicId,
  currentTopicTitle,
  currentExplanation,
}: TutorAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const contextualize = (text: string) =>
    currentTopicTitle ? `Regarding "${currentTopicTitle}": ${text}` : text;

  const playUrl = (url: string, id: string | null = null) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setSpeakingId(id);
    audio.onended = () => setSpeakingId(null);
    audio.play().catch(() => setSpeakingId(null));
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const sendQuestion = async (rawText: string) => {
    if (!rawText.trim() || !fileName || isSending) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", content: rawText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);
    scrollToEnd();
    try {
      const res = await apiService.askTutorQuestion(contextualize(rawText), fileName);
      setMessages((prev) => [...prev, { id: `${Date.now()}-t`, role: "tutor", content: res.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-t`,
          role: "tutor",
          content: err instanceof Error ? err.message : "Sorry, I couldn't process that - please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      scrollToEnd();
    }
  };

  const handleSend = () => sendQuestion(input);

  const handleSpeakMessage = async (msg: ChatMessage) => {
    if (!fileName) return;
    setSpeakingId(msg.id);
    try {
      const url = await apiService.synthesizeTutorSpeech(msg.content, fileName);
      playUrl(url, msg.id);
    } catch {
      setSpeakingId(null);
    }
  };

  const handleListenExplanation = async () => {
    if (!currentExplanation || !fileName || isListening) return;
    setIsListening(true);
    try {
      const url = await apiService.synthesizeTutorSpeech(currentExplanation, fileName);
      playUrl(url, "explanation");
    } catch {
      // Fallback audio trigger
    } finally {
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    if (!fileName) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        setIsSending(true);
        try {
          const res = await apiService.askTutorVoice(blob, fileName);
          setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}-u`, role: "user", content: res.transcript },
            { id: `${Date.now()}-t`, role: "tutor", content: res.response },
          ]);
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-t`,
              role: "tutor",
              content: err instanceof Error ? err.message : "Sorry, I couldn't hear clearly - please try again.",
            },
          ]);
        } finally {
          setIsSending(false);
          scrollToEnd();
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const nextStep = (() => {
    const idx = plan.steps.findIndex((s) => s.topic_id === currentTopicId);
    return idx >= 0 ? plan.steps[idx + 1] : plan.steps[0];
  })();

  return (
    <aside className="hidden lg:flex w-80 sm:w-84 flex-shrink-0 border-l border-slate-200/80 bg-white flex-col h-full overflow-y-auto hide-scrollbar select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900 text-sm">AI Tutor</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
          Beta
        </span>
      </div>

      {/* AI Tutor Card */}
      <div className="p-4 border-b border-slate-100">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 border border-indigo-100/80 p-5 flex flex-col items-center text-center shadow-xs">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md mb-3">
            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              <img src="/animated-video.gif" alt="AI Tutor Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <p className="text-slate-900 font-bold text-sm">Your AI Tutor</p>
          <p className="text-slate-500 text-xs mt-0.5">Let's understand this concept step by step.</p>

          <button
            onClick={handleListenExplanation}
            disabled={!currentExplanation || isListening}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isListening ? "Loading audio..." : speakingId === "explanation" ? "Playing..." : "Watch explanation (5 min)"}
          </button>
        </div>
      </div>

      {/* Your Understanding Section */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <p className="text-xs font-bold text-slate-900">Your Understanding</p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer">
            View details →
          </span>
        </div>

        <div className="space-y-2">
          {plan.steps.map((step) => {
            const band = step.topic_id === currentTopicId ? step.band : masteryBandClient(step.mastery);
            const style = BAND_STYLES[band];
            const pct = Math.round(step.mastery * 100);
            
            // Custom colors for progress bars based on completion
            const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-indigo-500" : pct > 0 ? "bg-amber-400" : "bg-slate-200";

            return (
              <div key={step.topic_id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium truncate mr-2">{step.title}</span>
                  <span className="font-bold text-slate-700">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Focus Next Callout */}
        {nextStep && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-900">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs font-bold">Focus next: {nextStep.title}</p>
            </div>
            <p className="text-[11px] text-amber-800/80 leading-snug">
              {nextStep.reason || "Your diagnostic answers suggest this concept needs more practice."}
            </p>
          </div>
        )}
      </div>

      {/* Ask Your Tutor Section */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-900">Ask Your Tutor</p>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 space-y-2.5 min-h-0 text-xs">
          {messages.length === 0 && (
            <p className="text-[11px] text-slate-400 py-2">
              Ask any question about {currentTopicTitle ? `"${currentTopicTitle}"` : "this lesson"} — or tap a quick strategy below!
            </p>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 border border-slate-200/60 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "tutor" && (
                  <button
                    onClick={() => handleSpeakMessage(m)}
                    disabled={speakingId === m.id}
                    className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                  >
                    <Volume2 className="w-3 h-3" />
                    {speakingId === m.id ? "Playing..." : "Listen"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-3.5 py-2.5 border border-slate-200/60">
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 pb-2 flex flex-wrap gap-1.5 border-t border-slate-100">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => sendQuestion(item.action)}
              disabled={isSending}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all disabled:opacity-40"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 pt-0 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isSending || isRecording}
            placeholder="Ask anything about this topic..."
            className="flex-1 min-w-0 border border-slate-200 rounded-full px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60"
          />

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isSending}
              className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
              title="Speak"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-8 h-8 flex-shrink-0 rounded-full bg-rose-600 text-white flex items-center justify-center animate-pulse"
              title="Stop"
            >
              <Square className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isRecording}
            className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
