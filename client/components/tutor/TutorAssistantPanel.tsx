import { useRef, useState } from "react";
import { 
  Mic, 
  Square, 
  Send, 
  Volume2,
  Sparkles,
  GraduationCap,
  Target,
  Play, 
  HelpCircle,
  Lightbulb,
  Maximize2,
  ArrowRight,
  Search
} from "lucide-react";
import { apiService, StudyPlan, masteryBandClient } from "@/lib/api";
import { BAND_STYLES } from "./RoadmapView";
import { useToast } from "@/lib/ToastContext";
import { ChatMarkdown } from "./ChatMarkdown";
import { useLiveSpeechPreview } from "@/hooks/useLiveSpeechPreview";

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
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveSpeechPreview = useLiveSpeechPreview((text) => setInput(text));

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
      setInput("");
      setIsRecording(true);
      liveSpeechPreview.start();
    } catch {
      showToast("Could not access microphone.", "error");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    liveSpeechPreview.stop();
    setIsRecording(false);
    setInput("");
  };

  const nextStep = (() => {
    const idx = plan.steps.findIndex((s) => s.topic_id === currentTopicId);
    return idx >= 0 ? plan.steps[idx + 1] : plan.steps[0];
  })();

  return (
    <aside className="hidden lg:flex w-80 lg:w-80 xl:w-[340px] flex-shrink-0 border-l border-slate-200/80 bg-white flex-col h-full min-h-0 overflow-y-auto hide-scrollbar select-none">
      {/* Top Header */}
      <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="font-extrabold text-slate-900 text-sm">AI Tutor</span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
          Beta
        </span>
      </div>

      <div className="p-3.5 space-y-4 flex-1 flex flex-col">
        {/* AI Tutor Hero Graphic Card with Full-Fitting Big Image */}
        <div className="rounded-2xl bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-slate-50 border border-slate-200/80 p-3.5 flex flex-col items-center text-center shadow-2xs space-y-2.5">
          <div className="w-full h-44 sm:h-48 overflow-hidden rounded-xl bg-amber-50/40 border border-amber-200/40 flex items-center justify-center p-1">
            <img
              src={encodeURI("/ai tutor image for right side pannel.png")}
              alt="Your AI Tutor"
              className="w-full h-full object-contain mx-auto rounded-lg drop-shadow-xs"
            />
          </div>

          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Your AI Tutor
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed px-1">
              Ask anything about this topic. Get clear explanations, examples, diagrams, and more.
            </p>
          </div>
        </div>

        {/* CHATBOT SEARCH INPUT BOX (SHIFTED COMPLETELY UP RIGHT AFTER HERO) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">Ask Your Tutor</p>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 p-2 shadow-2xs focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-1.5 flex-shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isSending || isRecording}
                placeholder="Ask a question about this topic..."
                className="flex-1 py-1 px-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-medium"
              />

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isSending}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer"
                  title="Speak"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center animate-pulse flex-shrink-0 cursor-pointer"
                  title="Stop"
                >
                  <Square className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending || isRecording}
                className="w-7 h-7 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center disabled:opacity-40 transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Strategy Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.label}
                onClick={() => sendQuestion(item.action)}
                disabled={isSending}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-2xs cursor-pointer disabled:opacity-40"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHATBOT MESSAGES OUTPUT AREA BELOW SEARCH BAR */}
        <div className="space-y-2.5 min-h-[140px] text-xs">
          {messages.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700">
                Ask any question about {currentTopicTitle ? `"${currentTopicTitle}"` : "this lesson"} — or tap a strategy button above!
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-none font-medium"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-none"
                  }`}
                >
                  {m.role === "tutor" ? (
                    <ChatMarkdown content={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  {m.role === "tutor" && (
                    <button
                      onClick={() => handleSpeakMessage(m)}
                      disabled={speakingId === m.id}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                    >
                      <Volume2 className="w-3 h-3" />
                      {speakingId === m.id ? "Playing..." : "Listen"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-slate-200 shadow-2xs flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="text-[11px] text-slate-500 font-medium ml-1">AI Tutor is answering...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Your Understanding Mastery Bars (SHIFTED BELOW CHAT) */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-slate-900">Your Understanding</p>
            </div>
            <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
              View details →
            </span>
          </div>

          <div className="space-y-2">
            {plan.steps.map((step) => {
              const band = step.topic_id === currentTopicId ? step.band : masteryBandClient(step.mastery);
              const pct = Math.round(step.mastery * 100);
              const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-primary" : pct > 0 ? "bg-amber-400" : "bg-slate-200";

              return (
                <div key={step.topic_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium truncate mr-2">{step.title}</span>
                    <span className="font-bold text-slate-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
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
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-900">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-xs font-bold">Focus next: {nextStep.title}</p>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-snug">
                {nextStep.reason || "Your diagnostic answers suggest this concept needs more practice."}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
