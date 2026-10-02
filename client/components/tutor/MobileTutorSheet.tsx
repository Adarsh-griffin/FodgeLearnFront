import { useRef, useState } from "react";
import { 
  Sparkles, 
  X, 
  History, 
  Send, 
  Mic, 
  Square, 
  Volume2, 
  BookOpen, 
  Zap, 
  Image as ImageIcon, 
  FileCheck, 
  Layers, 
  Globe, 
  Plus
} from "lucide-react";
import { apiService } from "@/lib/api";
import { ChatMarkdown } from "./ChatMarkdown";
import { useLiveSpeechPreview } from "@/hooks/useLiveSpeechPreview";
import { useToast } from "@/lib/ToastContext";

interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  content: string;
}

interface MobileTutorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  currentTopicTitle?: string;
  currentExplanation?: string;
}

const STRATEGY_CARDS = [
  { label: "Explain simply", icon: BookOpen, prompt: "Can you explain this concept in very simple, beginner-friendly terms?" },
  { label: "Give an example", icon: Zap, prompt: "Can you provide a clear, real-world worked example of this?" },
  { label: "Show diagram", icon: ImageIcon, prompt: "Can you describe the visual diagram or workflow for this topic step by step?" },
  { label: "Quiz me", icon: FileCheck, prompt: "Can you ask me a quick quiz question to test my understanding?" },
  { label: "Compare", icon: Layers, prompt: "Can you compare and contrast this with related concepts?" },
  { label: "Real-world use", icon: Globe, prompt: "What are the practical real-world applications of this concept?" },
];

const FOLLOWUP_CHIPS = [
  "Explain simpler",
  "Give a real example",
  "Show math",
  "How it helps in RAG",
];

export function MobileTutorSheet({
  isOpen,
  onClose,
  fileName,
  currentTopicTitle,
}: MobileTutorSheetProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveSpeechPreview = useLiveSpeechPreview((text) => setInput(text));

  if (!isOpen) return null;

  const contextualize = (text: string) =>
    currentTopicTitle ? `Regarding "${currentTopicTitle}": ${text}` : text;

  const playUrl = (url: string, id: string | null = null) => {
    if (audioRef.current) audioRef.current.pause();
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
          content: err instanceof Error ? err.message : "Sorry, I couldn't answer that - try again?",
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
              content: err instanceof Error ? err.message : "Sorry, I couldn't hear clearly - try again?",
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

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs select-none">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet Content Container */}
      <div className="w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col max-h-[88vh] h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base">AI Tutor</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheet Body (State 1: Cards or State 2: Messages) */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-5 min-h-0">
          {messages.length === 0 ? (
            <div className="space-y-5">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Ask anything about <span className="font-bold text-slate-800">"{currentTopicTitle || "this topic"}"</span>. I'll help you understand with simple explanations, examples, and diagrams.
              </p>

              {/* 6 Strategy Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {STRATEGY_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.label}
                      onClick={() => sendQuestion(card.prompt)}
                      disabled={isSending}
                      className="p-4 rounded-2xl bg-primary/40 border border-primary/80 hover:border-primary/40 hover:bg-primary/5 text-left flex flex-col items-start gap-2.5 transition-all shadow-2xs group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white text-primary flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{card.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-br-none shadow-xs"
                        : "bg-slate-50 text-slate-800 border border-slate-200/70 rounded-bl-none shadow-2xs"
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
                        className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {speakingId === m.id ? "Playing..." : "Listen"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200/70">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}

              {/* Follow-up Chips */}
              {!isSending && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Follow up</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FOLLOWUP_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendQuestion(chip)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors border border-slate-200/60"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <Plus className="w-5 h-5" />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isSending || isRecording}
            placeholder="Ask a question about this topic..."
            className="flex-1 min-w-0 border border-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50/60"
          />

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isSending}
              className="p-2.5 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="p-2.5 bg-rose-600 text-white rounded-full animate-pulse"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isRecording}
            className="w-9 h-9 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
