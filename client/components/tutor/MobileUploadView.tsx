import { useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  CheckCircle,
  Check
} from "lucide-react";

interface MobileUploadViewProps {
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTopicNameSubmit: (topicName: string) => void;
  isSubmittingTopic: boolean;
  handleTabChange: (tab: "upload" | "learning" | "assessment" | "tutor") => void;
  files: File[];
  uploadProgress: Record<string, number>;
  processingStatus: Record<string, any>;
  successMessages: Record<string, boolean>;
  removeFile: (fileName: string) => void;
}

export function MobileUploadView({
  handleDragOver,
  handleDragLeave,
  handleDrop,
  isDragging,
  fileInputRef,
  handleFileSelect,
  handleTopicNameSubmit,
  isSubmittingTopic,
  handleTabChange,
  files,
  uploadProgress,
  successMessages,
  removeFile,
}: MobileUploadViewProps) {
  const [topicInput, setTopicInput] = useState("");

  const onTopicFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isSubmittingTopic) return;
    handleTopicNameSubmit(topicInput.trim());
  };

  const isTopicButtonDisabled = !topicInput.trim() || isSubmittingTopic;

  // Blocks the screen with a translucent processing state until the FIRST
  // file/topic finishes - once anything is ready, this clears so the
  // sticky "Continue" bar below takes over instead of a modal.
  const isProcessing = files.length > 0 && !files.some((f) => successMessages[f.name]);
  const hasCompletedFile = files.some((f) => successMessages[f.name]);

  return (
    <div className="flex-1 flex min-h-0 bg-[#FAFAFC] overflow-hidden select-none w-full relative">
      {/* Translucent Processing Overlay - shown from the moment a file/topic
          is submitted until the first one completes, so the user isn't
          staring at an unchanged form wondering if anything happened. */}
      {isProcessing && (
        <div className="fixed inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <div className="w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900">Preparing your learning module...</p>
            <p className="text-sm text-slate-500">Analyzing content and building your AI Tutor session.</p>
          </div>
        </div>
      )}

      {/* Sticky Continue Bar - fixed above the bottom nav so it's visible
          the instant something's ready, with no scrolling required. */}
      {hasCompletedFile && (
        <div className="fixed bottom-20 inset-x-4 z-30">
          <button
            onClick={() => handleTabChange("tutor")}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-xl text-sm font-extrabold shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Continue to AI Tutor</span>
            <Sparkles className="w-4 h-4 fill-current text-amber-300" />
          </button>
        </div>
      )}

      {/* Main Content View with optimal edge padding & vertical fill */}
      <main className="flex-1 min-h-0 overflow-y-auto hide-scrollbar bg-[#FAFAFC] px-3.5 sm:px-6 py-6 space-y-7 pb-28">
        
        {/* Dominant Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-7 sm:p-9 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/70 ring-4 ring-primary/20"
              : "border-primary/20 bg-primary/25 hover:border-primary/70 hover:bg-primary/40"
          }`}
        >
          {/* Prominent Upload Icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/70 text-primary flex items-center justify-center shadow-xs">
              <Upload className={`w-9 h-9 ${isDragging ? "text-primary scale-110" : "text-primary"}`} />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
            Drop your files here
          </h3>

          <p className="text-sm text-slate-500 font-normal mb-6">
            or click to browse from your computer
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.epub"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-[165px] h-[48px] mx-auto rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm uppercase tracking-wider shadow-md flex items-center justify-center transition-all active:scale-95"
          >
            SELECT FILES
          </button>
        </div>

        {/* OR LEARN BY TOPIC NAME Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FAFAFC] px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              OR LEARN BY TOPIC NAME
            </span>
          </div>
        </div>

        {/* Topic-Learning Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-2xs">
          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Don't have a PDF? Type a Topic Name
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-normal">
              Instantly create a personalized learning path for any concept, subject, or question.
            </p>
          </div>

          <form onSubmit={onTopicFormSubmit} className="space-y-3.5 pt-1">
            <div className="relative">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="📖 e.g. Quantum Computing, Photosynthesis"
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-slate-50/60 font-medium"
              />
            </div>

            {/* Dynamic Active / Disabled Topic Button */}
            <button
              type="submit"
              disabled={isTopicButtonDisabled}
              className={`w-full py-3.5 px-5 rounded-xl text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isTopicButtonDisabled
                  ? "bg-primary/90 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-primary hover:bg-primary/90 text-white cursor-pointer active:scale-98"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isSubmittingTopic ? "GENERATING..." : "START LEARNING"}
            </button>
          </form>
        </div>

        {/* Supported Formats Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-2xs">
          <h5 className="text-sm font-bold text-slate-900">Supported Formats</h5>
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-primary flex-shrink-0 stroke-[2.5]" />
              <span>PDF files</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-primary flex-shrink-0 stroke-[2.5]" />
              <span>Max 50MB per file</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-primary flex-shrink-0 stroke-[2.5]" />
              <span>Multiple files allowed</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-primary flex-shrink-0 stroke-[2.5]" />
              <span>TXT, DOCX, EPUB</span>
            </div>
          </div>
        </div>

        {/* Uploaded Files Progress List */}
        {files.length > 0 && (
          <div className="space-y-3.5 pt-2">
            <h5 className="text-sm font-bold text-slate-900">
              Uploaded Files ({files.length})
            </h5>
            <div className="space-y-3">
              {files.map((file) => {
                const progress = uploadProgress[file.name] || 0;
                const showSuccess = successMessages[file.name];

                return (
                  <div
                    key={file.name}
                    className={`rounded-xl p-4 border transition-all text-xs sm:text-sm ${
                      showSuccess
                        ? "bg-emerald-50/80 border-emerald-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {showSuccess ? (
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {showSuccess ? "Ready for AI learning" : `${Math.round(progress)}% uploaded`}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>

                    {showSuccess && (
                      <button
                        onClick={() => handleTabChange("tutor")}
                        className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-extrabold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Start AI Lesson Now →</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
