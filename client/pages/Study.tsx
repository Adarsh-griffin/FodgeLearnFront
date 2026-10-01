import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, BookOpen, FileText, RotateCcw, Home, XCircle, Eye, EyeOff, Sparkles, GraduationCap, HelpCircle, BarChart3, ArrowRight, Lightbulb, Library, UploadCloud, Presentation, FileType } from "lucide-react";
import { TutorTab } from "@/components/tutor/TutorTab";
import { UserMenu } from "@/components/UserMenu";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { MobileUploadView } from "@/components/tutor/MobileUploadView";
import { MobileBottomNav } from "@/components/tutor/MobileBottomNav";
import { MobileTutorSheet } from "@/components/tutor/MobileTutorSheet";
import { apiService, UploadResponse, ReferenceLink, ProcessingStatus, AssessmentQuestion, AssessmentFeedback } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Mic, Square } from "lucide-react";


type AssessmentState = 'welcome' | 'question' | 'answer' | 'feedback';



const AssessmentTab = ({ handleTabChange, navigate }: { handleTabChange: (tab: "upload" | "learning" | "assessment" | "tutor") => void, navigate: (path: string | number) => void }) => {
  const [currentState, setCurrentState] = useState<AssessmentState>('welcome');
  const [question, setQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  // State for MCQ
  const [mcqData, setMcqData] = useState<{
    question: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    hint: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // State for Text/Audio
  const [isLoading, setIsLoading] = useState(false); // Used for submission
  const [generatingType, setGeneratingType] = useState<'theoretical' | 'mcq' | null>(null); // Track which button is loading
  const [error, setError] = useState<string>('');

  // Parse MCQ text
  const parseMCQ = (text: string) => {
    try {
      // Regex to allow optional "Question:" prefix and be case-insensitive/flexible
      const questionMatch = text.match(/^(?:Question:\s*)?(.*?)(?=\s*A\))/si);
      const optionsMatch = text.match(/A\)\s*(.*?)\s*B\)\s*(.*?)\s*C\)\s*(.*?)\s*D\)\s*(.*?)(?=\s*(?:Correct Answer:|Answer:))/si);
      const correctMatch = text.match(/(?:Correct Answer:|Answer:)\s*(.*?)(?=\s*Explanation:)/si);
      const explanationMatch = text.match(/Explanation:\s*(.*?)(?=\s*Hint:|$)/si);
      const hintMatch = text.match(/Hint:\s*(.*)/si);

      if (questionMatch && optionsMatch && correctMatch) {
        return {
          question: questionMatch[1].trim(),
          options: [
            { key: 'A', text: optionsMatch[1].trim() },
            { key: 'B', text: optionsMatch[2].trim() },
            { key: 'C', text: optionsMatch[3].trim() },
            { key: 'D', text: optionsMatch[4].trim() },
          ],
          // Normalize answer to just the letter (e.g. "Option D" -> "D", "D." -> "D")
          correctAnswer: correctMatch[1].trim().replace(/^Option\s+/, '').replace(/\.$/, '').toUpperCase(),
          explanation: explanationMatch ? explanationMatch[1].trim() : '',
          hint: hintMatch ? hintMatch[1].trim() : '',
        };
      }
      return null;
    } catch (e) {
      console.error("Failed to parse MCQ", e);
      return null;
    }
  };

  const generateQuestion = async (type: 'theoretical' | 'mcq') => {
    setGeneratingType(type);
    setError('');
    // Reset MCQ state
    setMcqData(null);
    setSelectedOption(null);
    setShowHint(false);
    setIsCorrect(null);
    setShowExplanation(false);

    try {
      const response: AssessmentQuestion = await apiService.generateAssessment(type);

      if (type === 'mcq') {
        const parsed = parseMCQ(response.question);
        if (parsed) {
          setMcqData(parsed);
          setQuestion(parsed.question); // Fallback / Display
        } else {
          // Fallback if parsing fails (shouldn't happen with strict prompt)
          setQuestion(response.question);
        }
      } else {
        setQuestion(response.question);
      }

      setCurrentState('question');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question');
    } finally {
      setGeneratingType(null);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please enter an answer before submitting');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response: AssessmentFeedback = await apiService.submitAssessment(question, userAnswer);
      setFeedback(response.feedback);
      setCurrentState('feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssessment = () => {
    setQuestion('');
    setUserAnswer('');
    setFeedback('');
    setError('');
    setCurrentState('welcome');
  };

  const startAnswering = () => {
    setCurrentState('answer');
  };

  return (
    <div className="h-full w-full flex flex-col min-h-0">
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:flex w-16 sm:w-20 bg-secondary flex-col items-center py-4 gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleTabChange("tutor")}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
            title="AI Tutor"
          >
            <GraduationCap className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleTabChange("learning")}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
            title="Learning Hub"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleTabChange("upload")}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
            title="Upload Documents"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleTabChange("assessment")}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors bg-primary/10 text-primary"
            title="Assessment"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-8 overflow-y-auto min-h-0 hide-scrollbar pb-24 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-destructive" />
                  <p className="text-destructive font-medium">Error</p>
                </div>
                <p className="text-destructive/90 mt-1">{error}</p>
              </div>
            )}

            {/* Welcome State */}
            {currentState === 'welcome' && (
              <>
                {/* Desktop welcome card */}
                <div className="hidden lg:block bg-white rounded-xl shadow-lg p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready for Assessment?</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                      Test your understanding with AI-generated questions based on your latest uploaded document.
                      Get personalized feedback and improve your learning.
                    </p>

                    <div className="space-y-4">
                      <div className="flex gap-4 max-w-2xl mx-auto">
                        <button
                          onClick={() => generateQuestion('theoretical')}
                          disabled={generatingType !== null}
                          className="flex-1 px-6 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {generatingType === 'theoretical' ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <FileText size={20} />
                              Generate Theoretical Question
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => generateQuestion('mcq')}
                          disabled={generatingType !== null}
                          className="flex-1 px-6 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {generatingType === 'mcq' ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Generate MCQ
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-gray-500">
                        Questions are generated from your most recently uploaded document
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile welcome screen */}
                <div className="lg:hidden">
                  {/* Decorative header illustration */}
                  <div className="relative h-40 flex items-center justify-center mb-6 select-none">
                    <div className="relative w-24 h-28 bg-white rounded-2xl shadow-md border border-border flex flex-col items-center justify-center gap-2 p-3 rotate-[-4deg]">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="w-full space-y-1.5">
                        <div className="h-1.5 bg-muted rounded-full w-full" />
                        <div className="h-1.5 bg-muted rounded-full w-4/5" />
                        <div className="h-1.5 bg-muted rounded-full w-full" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-8 w-11 h-11 rounded-2xl bg-primary shadow-md flex items-center justify-center rotate-[-8deg]">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-6 right-6 w-11 h-11 rounded-2xl bg-warning shadow-md flex items-center justify-center rotate-[8deg]">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h2 className="text-h1 text-center text-slate-900">
                    Ready for <span className="text-primary">Assessment?</span>
                  </h2>
                  <p className="text-sm text-slate-500 text-center leading-relaxed mt-3 mb-7 px-2">
                    Test your understanding with AI-generated questions based on your latest uploaded document. Get
                    personalized feedback and improve your learning.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => generateQuestion('theoretical')}
                      disabled={generatingType !== null}
                      className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-primary/70 border border-primary/10 text-left disabled:opacity-60 transition-colors hover:bg-primary/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-xs flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm">Generate Theoretical Question</p>
                        <p className="text-xs text-slate-500 mt-0.5">Get concept-based questions to test your understanding.</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center flex-shrink-0">
                        {generatingType === 'theoretical' ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => generateQuestion('mcq')}
                      disabled={generatingType !== null}
                      className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-primary/70 border border-primary/10 text-left disabled:opacity-60 transition-colors hover:bg-primary/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-xs flex-shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm">Generate MCQ</p>
                        <p className="text-xs text-slate-500 mt-0.5">Get multiple choice questions from your uploaded document.</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center flex-shrink-0">
                        {generatingType === 'mcq' ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-800 font-medium">
                        Questions are generated from your most recently uploaded document.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Assessment Tab */}
            {currentState !== 'welcome' && (
              (() => {
                // Helper to improve LaTeX rendering and clean artifacts
                // Helper to improve LaTeX rendering and clean artifacts
                const formatContent = (content: string) => {
                  if (!content) return '';
                  // Remove leading/trailing artifacts like "**", "Question:", "Hint:"
                  // Also remove trailing ** which sometimes appears
                  let clean = content
                    .replace(/^\s*(\*\*|Question:|Hint:|Explanation:|\*\*Question:)\s*/i, '')
                    .replace(/\*\*\s*$/, '') // Remove trailing **
                    .replace(/^\*\*/, '') // Remove leading **
                    .replace(/\*\*/g, ''); // Remove ALL ** if user wants them gone from math. But usually bold is fine. 
                  // User complained about "2 stars", likely artifacts. Safe to remove bolding markers for cleaner math if they are interfering.

                  // Fix LaTeX delimiters for ReactMarkdown/RemarkMath
                  // \[ ... \] -> $$ ... $$
                  // \( ... \) -> $ ... $
                  clean = clean.replace(/\\\[/g, '$$$').replace(/\\\]/g, '$$$')
                    .replace(/\\\(/g, '$').replace(/\\\)/g, '$');

                  // Heuristic for (Q = ...) -> $(Q = ...)$ from previous logic
                  clean = clean.replace(/\(([^)\n]*\\[^)\n]*)\)/g, '$$$1$$')
                    .replace(/\(([^)\n]*=[^)\n]*)\)/g, '$$$1$$');

                  return clean;
                };

                return (
                  <>
                    {/* Question State */}
                    {currentState === 'question' && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                              1
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Generated Question</h2>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-primary">
                            <div className="text-lg text-gray-800 leading-relaxed prose prose-indigo max-w-none">
                              <div className="response-container">
                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                  {formatContent(question)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>

                          {/* MCQ Logic */}
                          {mcqData ? (
                            <div className="mt-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mcqData.options.map((opt) => (
                                  <button
                                    key={opt.key}
                                    onClick={() => {
                                      setSelectedOption(opt.key);
                                      const correct = opt.key === mcqData.correctAnswer.charAt(0) || mcqData.correctAnswer.includes(opt.key); // Loose match
                                      setIsCorrect(correct);
                                      setShowExplanation(!correct); // Show explanation if wrong
                                    }}
                                    disabled={isCorrect === true}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedOption === opt.key
                                      ? isCorrect
                                        ? 'border-success bg-success/10 text-foreground'
                                        : 'border-destructive bg-destructive/10 text-foreground'
                                      : 'border-border hover:border-primary/40 hover:bg-primary/5 text-foreground'
                                      }`}
                                  >
                                    <span className="font-bold mr-2 text-lg align-top">{opt.key})</span>
                                    <div className="inline-block prose prose-sm max-w-none">
                                      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                        {formatContent(opt.text)}
                                      </ReactMarkdown>
                                    </div>
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                {mcqData.hint && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setShowHint(!showHint)}
                                      className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                                    >
                                      {showHint ? <EyeOff size={16} /> : <Eye size={16} />}
                                      {showHint ? 'Hide Hint' : 'Need a Hint?'}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {showHint && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
                                  <strong>Hint:</strong>
                                  <div className="mt-1 prose prose-sm max-w-none text-yellow-900">
                                    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                      {formatContent(mcqData.hint)}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}

                              {selectedOption && (
                                <div className={`p-4 rounded-lg border flex items-start gap-3 ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/5 border-destructive/20'}`}>
                                  {isCorrect ? <CheckCircle className="text-success shrink-0 mt-1" /> : <XCircle className="text-destructive shrink-0 mt-1" />}
                                  <div className="w-full">
                                    <p className={`font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                                      {isCorrect ? 'Correct Answer!' : 'Incorrect'}
                                    </p>
                                    {(!isCorrect && showExplanation) && (
                                      <div className="text-destructive mt-2 text-sm">
                                        <strong>Explanation:</strong>
                                        <div className="mt-1 prose prose-sm max-w-none text-destructive/90">
                                          <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                            {formatContent(mcqData.explanation)}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => generateQuestion('mcq')}
                                  disabled={generatingType === 'mcq'}
                                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                  {generatingType === 'mcq' ? (
                                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <RotateCcw size={20} />
                                  )}
                                  New Question
                                </button>
                              </div>

                            </div>
                          ) : (
                            // Standard Theoretical UI Buttons
                            <div className="flex gap-4">
                              <button
                                onClick={startAnswering}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle size={20} />
                                Start Answering
                              </button>
                              <button
                                onClick={resetAssessment}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <RotateCcw size={20} />
                                New Question
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Answer State */}
                    {currentState === 'answer' && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                              2
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Your Answer</h2>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-primary">
                            <p className="text-sm text-gray-600 mb-2">Question:</p>
                            <div className="text-gray-800 prose prose-sm max-w-none">
                              <div className="response-container">
                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                  {formatContent(question)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="block">
                              <span className="text-sm font-medium text-gray-700 mb-2 block">Your Answer:</span>
                              <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full p-4 border border-gray-300 rounded-lg text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows={6}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={submitAnswer}
                            disabled={isLoading || !userAnswer.trim()}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={20} />
                                Submit Answer
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setCurrentState('question')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Back to Question
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Feedback State */}
                    {currentState === 'feedback' && (() => {
                      // Helper to determine feedback status
                      const getFeedbackStatus = (text: string) => {
                        const lowerText = text.toLowerCase();
                        if (lowerText.includes('status: incorrect') || lowerText.includes('status**: incorrect') || lowerText.includes('status:** incorrect')) return 'incorrect';
                        if (lowerText.includes('status: partially correct') || lowerText.includes('status**: partially correct')) return 'partial';
                        if (lowerText.includes('status: correct') || lowerText.includes('status**: correct')) return 'correct';
                        if (lowerText.includes('incorrect')) return 'incorrect';
                        if (lowerText.includes('partially correct')) return 'partial';
                        if (lowerText.includes('correct')) return 'correct';
                        return 'correct';
                      };

                      const status = getFeedbackStatus(feedback);

                      const statusStyles = {
                        correct: {
                          bg: 'bg-success/10',
                          border: 'border-success',
                          icon: <CheckCircle size={24} className="text-success mt-1" />,
                          title: 'text-success',
                        },
                        incorrect: {
                          bg: 'bg-destructive/5',
                          border: 'border-destructive',
                          icon: <XCircle size={24} className="text-destructive mt-1" />,
                          title: 'text-destructive',
                        },
                        partial: {
                          bg: 'bg-warning/10',
                          border: 'border-warning',
                          icon: <CheckCircle size={24} className="text-warning mt-1" />,
                          title: 'text-warning',
                        }
                      };

                      const currentStyle = statusStyles[status];

                      return (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <div className={`w-8 h-8 ${status === 'incorrect' ? 'bg-destructive' : 'bg-success'} text-white rounded-full flex items-center justify-center font-bold`}>
                                3
                              </div>
                              <h2 className="text-xl font-semibold text-gray-800">Assessment Feedback</h2>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-primary">
                              <p className="text-sm text-gray-600 mb-2">Question:</p>
                              <div className="text-gray-800 mb-4 prose prose-sm max-w-none">
                                <div className="response-container">
                                  <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {formatContent(question)}
                                  </ReactMarkdown>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                              <p className="text-gray-800">{userAnswer}</p>
                            </div>

                            <div className={`${currentStyle.bg} rounded-lg p-6 border-l-4 ${currentStyle.border}`}>
                              <div className="flex items-start gap-3 mb-4">
                                {currentStyle.icon}
                                <h3 className={`text-lg font-semibold ${currentStyle.title}`}>AI Tutor Feedback</h3>
                              </div>
                              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                                <div className={`response-container ${status}`}>
                                  <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                    {formatContent(feedback)}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={resetAssessment}
                              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                              <RotateCcw size={20} />
                              New Assessment
                            </button>
                            <button
                              onClick={() => setCurrentState('answer')}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                );
              })()
            )}

          </div >
        </div>
      </div>
    </div>
  );
};

/**
 * Its own local `topicName` state, not lifted to StudyPage. Lifting it used
 * to make StudyPage re-render on every keystroke, which redefined the
 * inline UploadTab function (its identity changes every StudyPage render)
 * and made React remount the whole tab - including this input - after
 * every single character, dropping focus each time. Keeping the fast-
 * changing state local to this stable, top-level component avoids that
 * entirely; it only calls up to StudyPage via onSubmit, once, on submit.
 */
function TopicInputForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (topicName: string) => void;
  isSubmitting: boolean;
}) {
  const [topicName, setTopicName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = topicName.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit(trimmed);
    setTopicName("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/70">
          <BookOpen className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g. Quantum Computing, Photosynthesis, Neural Networks..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!topicName.trim() || isSubmitting}
        className="px-6 py-3 bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Creating Module...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Start Learning</span>
          </>
        )}
      </button>
    </form>
  );
}

export function StudyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upload" | "learning" | "assessment" | "tutor">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: ProcessingStatus }>({});
  const [successMessages, setSuccessMessages] = useState<{ [key: string]: boolean }>({});
  const [isMobileTutorSheetOpen, setIsMobileTutorSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Topic Learning State
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  const createMinimalPdfBlob = (topicName: string): File => {
    const safeTitle = topicName.replace(/[()\\]/g, '');
    const content = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length 140>> stream
BT
/F1 18 Tf
50 700 Td
(Topic: ${safeTitle}) Tj
/F1 12 Tf
0 -30 Td
(Comprehensive AI Learning Module for ${safeTitle}) Tj
ET
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000246 00000 n
0000000436 00000 n
trailer <</Size 6 /Root 1 0 R>>
startxref
515
%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const fileName = `${topicName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}_topic.pdf`;
    return new File([blob], fileName, { type: 'application/pdf' });
  };

  // Takes the topic name as a parameter (from TopicInputForm's own local
  // state) rather than reading lifted state - see TopicInputForm's comment
  // for why: keystroke state living here caused UploadTab (an inline
  // function redefined on every StudyPage render) to remount on every
  // character typed, dropping input focus each time.
  const handleTopicNameSubmit = async (topicName: string) => {
    if (isSubmittingTopic) return;

    try {
      setIsSubmittingTopic(true);
      const topicFile = createMinimalPdfBlob(topicName);
      await processFiles([topicFile]);
      // Auto-transition immediately to AI Tutor so user never has to scroll down!
      handleTabChange("tutor");
    } catch (err) {
      console.error("Failed to generate topic module:", err);
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // Resize functionality
  const [sectionWidths, setSectionWidths] = useState([33.33, 33.33, 33.34]); // Video, AI Tutor, AI Summary
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['upload', 'learning', 'assessment', 'tutor'].includes(tab)) {
      setActiveTab(tab as "upload" | "learning" | "assessment" | "tutor");
    }
  }, [searchParams]);

  // Clear cache when switching to learning tab to ensure fresh data
  const handleTabChange = (tab: "upload" | "learning" | "assessment" | "tutor") => {
    if (tab === "learning") {
      // Clear cache when switching to learning tab to get fresh data
      localStorage.removeItem('neurolearn_summary_text');
      localStorage.removeItem('neurolearn_text_timestamp');
      localStorage.removeItem('neurolearn_reference_links');
      localStorage.removeItem('neurolearn_links_timestamp');
    }
    setActiveTab(tab);
  };

  // Test backend connection one time on component mount
  useEffect(() => {
    let isMounted = true;
    const testConnection = async () => {
      try {
        const connected = await apiService.testConnection();
        if (isMounted) {
          setBackendConnected(connected);
          console.log(`[FE-DEBUG] Backend Connection Status: ${connected ? 'CONNECTED (Green)' : 'DISCONNECTED (Red)'}`);
        }
      } catch (error) {
        if (isMounted) {
          console.warn('[FE-DEBUG] Backend connection check failed:', error);
          setBackendConnected(false);
        }
      }
    };

    testConnection();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      await processFiles(selectedFiles);
    }
  };

  const processFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);

      for (const file of validFiles) {
        try {
          // Show upload progress
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const current = prev[file.name] || 0;
              if (current >= 90) {
                clearInterval(progressInterval);
                return { ...prev, [file.name]: 90 };
              }
              return { ...prev, [file.name]: current + 10 };
            });
          }, 200);

          // Upload to backend
          const response: UploadResponse = await apiService.uploadFile(file);

          // Complete progress
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          // Clear cache when new document is uploaded
          localStorage.removeItem('neurolearn_summary_text');
          localStorage.removeItem('neurolearn_text_timestamp');
          localStorage.removeItem('neurolearn_reference_links');
          localStorage.removeItem('neurolearn_links_timestamp');
          localStorage.removeItem('neurolearn_available_files');
          localStorage.removeItem('neurolearn_files_timestamp');

          // Point the AI Tutor tab at THIS document (overwrites its cached
          // selection) - otherwise TutorTab restores whatever was last
          // studied and silently ignores that a new file was just uploaded,
          // e.g. typing a fresh topic name then getting quizzed on an
          // unrelated PDF from a previous session.
          if (response.fileId) {
            localStorage.setItem('neurolearn_tutor_file_id', response.fileId);
            localStorage.setItem('neurolearn_tutor_file_name', file.name);
          }

          // Start polling for processing status
          if (response.filename) {
            setProcessingStatus(prev => ({
              ...prev,
              [file.name]: {
                status: 'processing',
                message: 'Processing started...'
              }
            }));
            pollProcessingStatus(response.filename);
          }
        } catch (error) {
          console.error('Upload failed:', error);
          // Handle error (show toast, etc.)
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        }
      }
    }
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
    setProcessingStatus((prev) => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
    setSuccessMessages((prev) => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };

  // Poll for processing status
  const pollProcessingStatus = async (filename: string) => {
    try {
      const status = await apiService.checkProcessingStatus(filename);
      setProcessingStatus(prev => ({ ...prev, [filename]: status }));

      if (status.status === 'completed') {
        setSuccessMessages(prev => ({ ...prev, [filename]: true }));

        localStorage.removeItem('neurolearn_summary_text');
        localStorage.removeItem('neurolearn_text_timestamp');
        localStorage.removeItem('neurolearn_reference_links');
        localStorage.removeItem('neurolearn_links_timestamp');
      } else if (status.status === 'processing') {
        // Continue polling every 3 seconds
        setTimeout(() => pollProcessingStatus(filename), 3000);
      }
    } catch (error) {
      console.error(`Failed to check processing status for ${filename}:`, error);
      // Retry after 5 seconds on error
      setTimeout(() => pollProcessingStatus(filename), 5000);
    }
  };

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidths = [...sectionWidths];

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;

      const newWidths = [...startWidths];
      newWidths[index] = Math.max(10, Math.min(80, startWidths[index] + deltaPercent));
      newWidths[index + 1] = Math.max(10, Math.min(80, startWidths[index + 1] - deltaPercent));

      setSectionWidths(newWidths);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sectionWidths]);

  const UploadTab = () => (
    <div className="h-full w-full flex flex-col">
      {/* Mobile Upload Composition (< lg) */}
      <div className="lg:hidden flex-1 flex min-h-0 w-full">
        <MobileUploadView
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleTopicNameSubmit={handleTopicNameSubmit}
          isSubmittingTopic={isSubmittingTopic}
          handleTabChange={handleTabChange}
          files={files}
          uploadProgress={uploadProgress}
          processingStatus={processingStatus}
          successMessages={successMessages}
          removeFile={removeFile}
        />
      </div>

      {/* Desktop Upload Composition (>= lg) */}
      <div className="hidden lg:flex flex-1 min-h-0 w-full bg-[#FAFAFC]">
        <div className="w-60 bg-white border-r border-slate-200/80 flex flex-col py-6 px-4 gap-1 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Home className="w-[18px] h-[18px]" />
            Home
          </button>
          <button
            onClick={() => handleTabChange("learning")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <BookOpen className="w-[18px] h-[18px]" />
            Summary
          </button>
          <button
            onClick={() => handleTabChange("tutor")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <GraduationCap className="w-[18px] h-[18px]" />
            AI Tutor
          </button>
          <button
            onClick={() => handleTabChange("upload")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary transition-colors"
          >
            <Upload className="w-[18px] h-[18px]" />
            Upload
          </button>
          <button
            onClick={() => handleTabChange("assessment")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <FileText className="w-[18px] h-[18px]" />
            Assessments
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload Documents</h1>
            <p className="text-sm text-slate-500 mb-8">
              Upload your study material and let LearnForge turn it into a personalized learning experience.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-14 text-center transition-colors ${isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 bg-secondary/30"
                }`}
            >
              {/* Decorative floating file-type chips */}
              <div className="hidden sm:flex absolute top-8 left-10 w-11 h-11 rounded-xl bg-white shadow-md border border-rose-100 items-center justify-center -rotate-6">
                <FileText className="w-5 h-5 text-rose-500" />
              </div>
              <div className="hidden sm:flex absolute bottom-10 left-20 w-11 h-11 rounded-xl bg-white shadow-md border border-blue-100 items-center justify-center rotate-6">
                <FileType className="w-5 h-5 text-blue-500" />
              </div>
              <div className="hidden sm:flex absolute top-10 right-12 w-11 h-11 rounded-xl bg-white shadow-md border border-amber-100 items-center justify-center rotate-6">
                <Presentation className="w-5 h-5 text-amber-500" />
              </div>
              <div className="hidden sm:flex absolute bottom-8 right-20 w-11 h-11 rounded-xl bg-white shadow-md border border-primary/10 items-center justify-center -rotate-6">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/80 text-primary flex items-center justify-center mx-auto">
                  <UploadCloud className={`w-8 h-8 ${isDragging ? "text-primary" : "text-primary"}`} />
                </div>
              </div>
              <h3 className="relative text-xl font-bold text-slate-900 mb-1">
                Drop your files here
              </h3>
              <p className="relative text-sm text-slate-500 mb-6">
                or click to browse from your computer
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Select Files
              </button>
              <p className="relative text-xs text-slate-400 mt-4">You can upload multiple files at once</p>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FAFAFC] px-4 text-slate-400 font-semibold tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Topic Input Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Don't have a PDF? Type a Topic Name</h3>
                  <p className="text-xs text-slate-500">Instant AI learning module generation for any concept, subject, or question.</p>
                </div>
              </div>

              <TopicInputForm onSubmit={handleTopicNameSubmit} isSubmitting={isSubmittingTopic} />
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Uploaded Files ({files.length})
                </h3>
                <div className="space-y-4">
                  {files.map((file) => {
                    const progress = uploadProgress[file.name] || 0;
                    const isUploadComplete = progress >= 100;
                    const status = processingStatus[file.name];
                    const isProcessingComplete = status?.status === 'completed';
                    const showSuccess = successMessages[file.name];

                    return (
                      <div
                        key={file.name}
                        className={`rounded-lg p-4 border transition-colors ${showSuccess
                          ? "bg-green-50 border-green-200 hover:border-green-300"
                          : "bg-muted/30 border-border hover:border-primary/30"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {showSuccess ? (
                                <CheckCircle size={20} className="text-green-600" />
                              ) : isUploadComplete ? (
                                <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                              )}
                              <span className="font-medium text-foreground break-all">
                                {file.name}
                              </span>
                            </div>

                            {showSuccess ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                  <CheckCircle size={16} />
                                  <span>Processing completed successfully!</span>
                                </div>
                                <div className="text-xs text-green-600">
                                  Your document has been analyzed and is ready for learning.
                                </div>
                              </div>
                            ) : isUploadComplete ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                  <span>Processing document...</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Analyzing content and generating explanations
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{Math.round(progress)}% uploaded</span>
                              </div>
                            )}

                            {!showSuccess && (
                              <div className="mt-2 w-full bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${isUploadComplete ? "bg-blue-600" : "bg-primary"
                                    }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(file.name)}
                            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
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

                {files.some((f) => successMessages[f.name]) && (
                  <button
                    className="mt-6 w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    onClick={() => handleTabChange("tutor")}
                  >
                    <span>Continue to AI Tutor</span>
                    <Sparkles className="w-4 h-4 fill-current text-amber-300" />
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Supported Formats</h4>
                  <p className="text-xs text-slate-500">Upload files in the following formats. We'll analyze and structure your content automatically.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-4">
                  <div className="w-9 h-9 rounded-lg bg-white text-rose-500 flex items-center justify-center shadow-xs mb-3">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">PDF files</p>
                  <p className="text-xs text-slate-500 mt-0.5">Best for textbooks, lecture notes</p>
                </div>
                <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
                  <div className="w-9 h-9 rounded-lg bg-white text-emerald-600 flex items-center justify-center shadow-xs mb-3">
                    <FileType className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Max 50MB per file</p>
                  <p className="text-xs text-slate-500 mt-0.5">Upload multiple files at once</p>
                </div>
                <div className="rounded-xl bg-primary/60 border border-primary/10 p-4">
                  <div className="w-9 h-9 rounded-lg bg-white text-primary flex items-center justify-center shadow-xs mb-3">
                    <Library className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Multiple files</p>
                  <p className="text-xs text-slate-500 mt-0.5">Combine related materials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LearningTab = ({ files }: { files: File[] }) => {
    const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([]);
    const [linksLoading, setLinksLoading] = useState(false);
    const [summaryText, setSummaryText] = useState<string>('');
    const [summaryImages, setSummaryImages] = useState<string[]>([]);
    const [summaryStatus, setSummaryStatus] = useState<string>('completed');
    const [textLoading, setTextLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [summaryAudioState, setSummaryAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
    const summaryAudioRef = useRef<HTMLAudioElement | null>(null);
    const summaryHashValue = summaryText && summaryText.trim().length > 0
      ? `${summaryText.length}-${summaryText.slice(0, 64)}`
      : undefined;

    // Chat functionality
    const [chatMessages, setChatMessages] = useState<Array<{ id: string, type: 'user' | 'bot', content: string, timestamp: Date }>>(() => {
      // Load chat history from localStorage on initialization
      try {
        const cachedChat = localStorage.getItem('neurolearn_chat_history');
        if (cachedChat) {
          const parsedChat = JSON.parse(cachedChat);
          // Convert timestamp strings back to Date objects
          return parsedChat.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
      } catch (error) {
        console.error('Failed to load chat history from cache:', error);
      }
      // Default message if no cache
      return [{ id: '1', type: 'bot', content: 'Heyy any doubts?', timestamp: new Date() }];
    });
    const [currentMessage, setCurrentMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    // File selection for Q&A
    const [availableFiles, setAvailableFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [filesLoading, setFilesLoading] = useState(false);

    // Image Zoom State
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Chat scroll ref
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Both keyed by fileName - this used to be a single global cache/fetch
    // with no file awareness at all, so switching documents in the selector
    // below never changed what summary/links showed (confirmed: always the
    // most recently uploaded document, regardless of selection - and a
    // freshly-selected document with no summary yet just looked broken
    // instead of "still processing").
    const loadLinksForFile = async (fileName: string) => {
      const cacheKey = `neurolearn_reference_links_${fileName}`;
      const cacheTimestampKey = `neurolearn_links_timestamp_${fileName}`;
      const cachedLinks = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
      const now = Date.now();
      const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedLinks && cacheAge < CACHE_DURATION) {
        try {
          setReferenceLinks(JSON.parse(cachedLinks));
          return;
        } catch (error) {
          console.error('Failed to parse cached links:', error);
        }
      }

      setLinksLoading(true);
      try {
        const links = await apiService.getLinks(fileName);
        setReferenceLinks(links);
        localStorage.setItem(cacheKey, JSON.stringify(links));
        localStorage.setItem(cacheTimestampKey, now.toString());
      } catch (error) {
        console.error('Failed to load reference links:', error);
        setReferenceLinks([]);
      } finally {
        setLinksLoading(false);
      }
    };

    const loadSummaryForFile = async (fileName: string) => {
      const textCacheKey = `neurolearn_summary_text_${fileName}`;
      const imagesCacheKey = `neurolearn_summary_images_${fileName}`;
      const timestampKey = `neurolearn_text_timestamp_${fileName}`;
      const cachedText = localStorage.getItem(textCacheKey);
      const cachedImages = localStorage.getItem(imagesCacheKey);
      const cacheTimestamp = localStorage.getItem(timestampKey);
      const now = Date.now();
      const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedText && cacheAge < CACHE_DURATION) {
        setSummaryText(cachedText);
        setSummaryStatus('completed');
        if (cachedImages) {
          try {
            setSummaryImages(JSON.parse(cachedImages));
          } catch (e) {
            console.error('Failed to parse cached images:', e);
          }
        }
        return;
      }

      setTextLoading(true);
      try {
        const { text, images, status } = await apiService.getText(fileName);
        setSummaryText(text);
        setSummaryImages(images);
        setSummaryStatus(status);

        // Only cache a genuinely finished summary - caching "processing"
        // would freeze the UI on that message for 5 minutes even after the
        // real summary finishes generating in the background.
        if (status === 'completed') {
          localStorage.setItem(textCacheKey, text);
          localStorage.setItem(imagesCacheKey, JSON.stringify(images));
          localStorage.setItem(timestampKey, now.toString());
        }
      } catch (error) {
        console.error('Failed to load summary text:', error);
        setSummaryText('');
        setSummaryImages([]);
        setSummaryStatus('not_found');
      } finally {
        setTextLoading(false);
      }
    };

    // Load reference links + summary whenever the selected document changes
    useEffect(() => {
      if (!selectedFile) return;
      loadLinksForFile(selectedFile);
      loadSummaryForFile(selectedFile);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile]);

    // Load available files for Q&A
    useEffect(() => {
      const loadAvailableFiles = async () => {
        // Check localStorage first
        const cachedFiles = localStorage.getItem('neurolearn_available_files');
        const cacheTimestamp = localStorage.getItem('neurolearn_files_timestamp');
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter for files as they change more often)

        if (cachedFiles && cacheAge < CACHE_DURATION) {
          try {
            const fileList = JSON.parse(cachedFiles);
            setAvailableFiles(fileList);
            // Set the first file (most recent) as default
            if (fileList.length > 0 && !selectedFile) {
              setSelectedFile(fileList[0]);
            }
            return;
          } catch (error) {
            console.error('Failed to parse cached files:', error);
          }
        }

        setFilesLoading(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/files`);
          if (response.ok) {
            // /api/files now returns {_id, originalName, uploadDate, size, folder}[]
            // instead of a bare string[] (so the AI Tutor tab has a stable
            // fileId to key off) - reduce to filenames here since that's all
            // this dropdown/cache has ever used.
            const fileObjects: { originalName: string }[] = await response.json();
            const fileList = fileObjects.map((f) => f.originalName).filter(Boolean);
            setAvailableFiles(fileList);
            // Set the first file (most recent) as default
            if (fileList.length > 0 && !selectedFile) {
              setSelectedFile(fileList[0]);
            }

            // Cache the files
            localStorage.setItem('neurolearn_available_files', JSON.stringify(fileList));
            localStorage.setItem('neurolearn_files_timestamp', now.toString());
          }
        } catch (error) {
          console.error('Error loading available files:', error);
        } finally {
          setFilesLoading(false);
        }
      };

      loadAvailableFiles();
    }, [selectedFile]);

    const loadLatestVideo = useCallback(async (targetFile?: string) => {
      const fileName = targetFile || selectedFile || availableFiles[0];
      if (!fileName) {
        setVideoUrl(null);
        setVideoError(null);
        return;
      }
      setVideoLoading(true);
      setVideoError(null);
      try {
        const response = await apiService.getLatestLipsyncVideo(fileName);
        if (response.video_url) {
          setVideoUrl(response.video_url);
        } else {
          setVideoUrl(null);
          setVideoError('No lipsync video available yet. Generate one to get started.');
        }
      } catch (error) {
        console.error('Failed to load latest video:', error);
        setVideoUrl(null);
        setVideoError(error instanceof Error ? error.message : 'Failed to load video');
      } finally {
        setVideoLoading(false);
      }
    }, [selectedFile, availableFiles]);

    useEffect(() => {
      loadLatestVideo(selectedFile);
    }, [selectedFile, loadLatestVideo]);

    // Auto-poll for new videos every 10 seconds
    useEffect(() => {
      // Don't poll if we already have a video for this file
      if (videoUrl) return;

      const pollInterval = setInterval(() => {
        loadLatestVideo(selectedFile);
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(pollInterval); // Cleanup on unmount
    }, [selectedFile, loadLatestVideo, videoUrl]);




    const handleRefreshVideo = async () => {
      await loadLatestVideo(selectedFile);
    };

    const handleGenerateVideo = async () => {
      const fileName = selectedFile || availableFiles[0];
      if (!fileName) {
        setVideoError('Upload and select a document to generate a video.');
        return;
      }
      setVideoLoading(true);
      setVideoError(null);
      try {
        await apiService.generateLipsyncVideo(fileName);
        await loadLatestVideo(fileName);

      } catch (error) {
        console.error('Failed to generate lipsync video:', error);
        setVideoError(error instanceof Error ? error.message : 'Failed to generate lipsync video');
      } finally {
        setVideoLoading(false);
      }
    };

    // Update bot message when file selection changes
    useEffect(() => {
      if (selectedFile) {
        setChatMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[0].type === 'bot') {
            updated[0] = {
              ...updated[0],
              content: `Heyy any doubts about ${selectedFile}?`
            };
          }
          return updated;
        });
      }
    }, [selectedFile]);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, [chatMessages]);

    // Save chat history to localStorage whenever it changes
    useEffect(() => {
      try {
        localStorage.setItem('neurolearn_chat_history', JSON.stringify(chatMessages));
      } catch (error) {
        console.error('Failed to save chat history to cache:', error);
      }
    }, [chatMessages]);

    // Chat functions
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          setAudioChunks(chunks);
          await processVoiceInput(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setAudioChunks([]);
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    };

    const stopRecording = () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    };

    const processVoiceInput = async (audioBlob: Blob) => {
      setIsProcessing(true);
      try {
        // Send audio to STT endpoint
        const formData = new FormData();
        formData.append('audio', audioBlob);
        // Use the selected file for Q&A context
        const fileName = selectedFile || 'keph101.pdf';
        formData.append('fileName', fileName);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/qa-voice`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('STT processing failed');
        }

        const data = await response.json();
        const userMessage = data.transcript;
        const botResponse = data.response;

        // Add user message to chat
        const userMsg = {
          id: Date.now().toString(),
          type: 'user' as const,
          content: userMessage,
          timestamp: new Date()
        };

        // Add bot response to chat
        const botMsg = {
          id: (Date.now() + 1).toString(),
          type: 'bot' as const,
          content: botResponse,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMsg, botMsg]);

        // Play TTS if available
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.play();
        }

      } catch (error) {
        console.error('Error processing voice input:', error);
        const errorMsg = {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: 'Sorry, I had trouble processing your voice input. Please try again.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsProcessing(false);
      }
    };

    const sendTextMessage = async () => {
      if (!currentMessage.trim()) return;

      setIsProcessing(true);
      const userMessage = currentMessage;
      setCurrentMessage('');

      // Add user message to chat
      const userMsg = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: userMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMsg]);

      try {
        // Send to Q&A endpoint
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/qa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: userMessage,
            fileName: selectedFile || 'keph101.pdf'
          }),
        });

        if (!response.ok) {
          throw new Error('Q&A processing failed');
        }

        const data = await response.json();
        const botResponse = data.response;

        // Add bot response to chat
        const botMsg = {
          id: (Date.now() + 1).toString(),
          type: 'bot' as const,
          content: botResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMsg]);

        // Optional: Generate TTS for the response
        try {
          const ttsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/qa-tts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: botResponse }),
          });

          if (ttsResponse.ok) {
            const ttsData = await ttsResponse.json();
            if (ttsData.audioUrl) {
              const audio = new Audio(ttsData.audioUrl);
              audio.play();
            }
          }
        } catch {
          // TTS is optional for text chat replies
        }

      } catch (error) {
        console.error('Error sending message:', error);
        const errorMsg = {
          id: Date.now().toString(),
          type: 'bot' as const,
          content: 'Sorry, I had trouble processing your message. Please try again.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsProcessing(false);
      }
    };

    // Shared between the desktop 3-column layout and the mobile
    // single-column layout below - the text-split + image-interleave logic
    // is non-trivial enough that duplicating it verbatim would risk the
    // two views silently drifting apart.
    const renderSummaryWithImages = () => {
      if (textLoading) {
        // Content-shaped skeleton instead of a bare spinner - the summary
        // is paragraph text, so the loading state should look like
        // paragraph text arriving, not an unrelated spinning circle.
        return (
          <div className="bg-white rounded-lg p-4 border space-y-6">
            <SkeletonText lines={4} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-28 rounded-lg" />
            </div>
            <SkeletonText lines={3} />
          </div>
        );
      }
      if (!summaryText) {
        const isProcessing = summaryStatus === 'processing';
        return (
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BookOpen size={24} className="text-gray-400" />
                )}
              </div>
              <h5 className="font-semibold text-gray-600 mb-2">AI Summary</h5>
              <p className="text-sm text-gray-500">
                {isProcessing
                  ? "This document is still being summarized - check back in a moment, or hit Refresh."
                  : "Upload a document to generate AI-powered summaries and key insights"}
              </p>
            </div>
          </div>
        );
      }

      const midPoint = Math.floor(summaryText.length / 2);
      let splitIndex = summaryText.indexOf('.', midPoint);
      if (splitIndex === -1) splitIndex = midPoint;
      else splitIndex += 1;

      const part1 = summaryText.slice(0, splitIndex);
      const part2 = summaryText.slice(splitIndex);
      const firstRowImages = summaryImages.slice(0, 2);
      const secondRowImages = summaryImages.slice(2);

      const renderImageRow = (images: string[], keyPrefix: string) =>
        images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 my-4">
            {images.map((imgUrl, idx) => (
              <div
                key={`${keyPrefix}-${idx}`}
                className="rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setZoomedImage(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt="Educational Diagram"
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        );

      // The AI summary occasionally comes back as a markdown table (e.g. a
      // "Section | What it Covers" breakdown). Tailwind Typography's plain
      // `.prose table` has no horizontal-scroll wrapper, so on a narrow
      // mobile screen the browser just crushes each column - confirmed:
      // "Foundations" was splitting into "Found"/"ations" mid-word. Wrap it
      // in its own scroll container instead of letting it collapse.
      const markdownComponents = {
        table: ({ children }: any) => (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="min-w-full text-left border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }: any) => (
          <th className="p-2 border-b border-gray-200 bg-gray-50 font-semibold whitespace-nowrap">{children}</th>
        ),
        td: ({ children }: any) => (
          <td className="p-2 border-b border-gray-100 align-top">{children}</td>
        ),
      };

      return (
        <div className="bg-white rounded-lg p-4 border space-y-6">
          <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={markdownComponents}
            >
              {part1}
            </ReactMarkdown>
          </div>
          {renderImageRow(firstRowImages, 'row1')}
          <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={markdownComponents}
            >
              {part2}
            </ReactMarkdown>
          </div>
          {renderImageRow(secondRowImages, 'row2')}
        </div>
      );
    };

    const renderReferenceLinksList = () => (
      <div className="space-y-3">
        <h5 className="font-semibold text-gray-800">Reference Links</h5>
        {linksLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-3 bg-white rounded-lg border space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : referenceLinks.length > 0 ? (
          <div className="space-y-2">
            {referenceLinks.map((link, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                  <h6 className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-1">{link.title}</h6>
                  {link.description && (
                    <p className="text-xs text-gray-600 mb-2">{link.description}</p>
                  )}
                  <p className="text-xs text-gray-500 break-all">{link.url}</p>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">No reference links available</p>
          </div>
        )}
      </div>
    );

    const renderVideoPlayer = () => (
      <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
        {videoLoading ? (
          <div className="flex flex-col items-center text-gray-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Preparing your video...</p>
          </div>
        ) : videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            preload="metadata"
            loop
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-500 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">▶</span>
            </div>
            <p className="text-sm">Video will appear here</p>
            <p className="text-xs text-gray-400">Generate a lipsync video to get started</p>
          </div>
        )}
      </div>
    );

    // Shared by the desktop and mobile "Listen" buttons - gives the summary
    // a real listen-instead-of-read option (previously only existed on
    // desktop as a fire-and-forget button with no play/pause state; mobile
    // had no audio option for the summary at all).
    const handlePlaySummaryAudio = async () => {
      if (summaryAudioState === 'playing') {
        summaryAudioRef.current?.pause();
        setSummaryAudioState('idle');
        return;
      }
      if (!summaryText) {
        alert('No summary text available. Please wait for the summary to load.');
        return;
      }
      const fileName = selectedFile || availableFiles[0] || undefined;
      if (!fileName) {
        alert('Select or upload a document first.');
        return;
      }
      setSummaryAudioState('loading');
      try {
        const ttsResult = await apiService.learningTTS(summaryText, fileName);
        if (ttsResult.audioUrl) {
          const audio = new Audio(ttsResult.audioUrl);
          summaryAudioRef.current = audio;
          audio.onended = () => setSummaryAudioState('idle');
          await audio.play();
          setSummaryAudioState('playing');
        } else {
          setSummaryAudioState('idle');
        }
        if (ttsResult.videoUrl) {
          setVideoUrl(ttsResult.videoUrl);
          setVideoError(null);
        } else if (fileName) {
          await loadLatestVideo(fileName);
        }
      } catch (error) {
        console.error('Failed to generate/play summary audio:', error);
        alert(error instanceof Error ? error.message : 'Failed to generate audio. Please try again.');
        setSummaryAudioState('idle');
      }
    };

    const renderListenButton = (variant: 'desktop' | 'mobile') => (
      <button
        onClick={handlePlaySummaryAudio}
        disabled={!summaryText || textLoading || summaryAudioState === 'loading'}
        className={
          variant === 'desktop'
            ? "text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            : "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        }
        title={summaryAudioState === 'playing' ? "Pause" : "Listen to summary instead of reading it"}
      >
        {summaryAudioState === 'loading' ? (
          <>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : summaryAudioState === 'playing' ? (
          <>⏸ Pause</>
        ) : (
          <>🔊 Listen</>
        )}
      </button>
    );

    return (
      <div className="h-full w-full flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0">
          <div className="hidden lg:flex w-16 sm:w-20 bg-secondary flex-col items-center py-4 gap-3 flex-shrink-0">
            <button
              onClick={() => navigate("/")}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleTabChange("tutor")}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${activeTab === "tutor" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              title="AI Tutor"
            >
              <GraduationCap className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleTabChange("learning")}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${activeTab === "learning" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              title="Learning Hub"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleTabChange("upload")}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${activeTab === "upload" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              title="Upload Documents"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleTabChange("assessment")}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${activeTab === "assessment" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              title="Assessment"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Desktop: resizable 3-column layout (Video+Links / AI Summary / AI Tutor chat) */}
            <div ref={containerRef} className="hidden lg:flex flex-1 flex-row overflow-hidden min-h-0">
              <div
                className="border-r border-gray-200 flex flex-col min-w-0 min-h-0"
                style={{ width: `${sectionWidths[0]}%` }}
              >
                <div className="p-4 border-b border-gray-200 bg-blue-50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Video Explanation</h4>
                    <div className="w-2 h-2 bg-gray-400 rounded-full cursor-col-resize"></div>
                  </div>
                </div>

                <div className="flex-1 bg-blue-50 flex flex-col min-h-0">
                  {/* Video Section - Fixed at top */}
                  <div className="p-4 pb-2 bg-blue-50 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-800">Video Explanation</h5>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRefreshVideo}
                          disabled={videoLoading}
                          className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={handleGenerateVideo}
                          disabled={videoLoading}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {videoLoading ? 'Working...' : 'Generate'}
                        </button>
                      </div>
                    </div>
                    {renderVideoPlayer()}

                    {videoError && (
                      <p className="text-xs text-red-600 mt-2">{videoError}</p>
                    )}
                  </div>

                  {/* Reference Links - Scrollable area */}
                  <div className="flex-1 p-4 pt-2 overflow-y-auto min-h-0 hide-scrollbar">
                    {renderReferenceLinksList()}
                  </div>
                </div>
              </div>

              {/* Resize handle between AI Tutor and AI Summary */}
              <div
                className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 1)}
              ></div>

              <div
                className="flex flex-col min-w-0 min-h-0"
                style={{ width: `${sectionWidths[2]}%` }}
              >
                <div className="p-4 border-b border-gray-200 bg-green-50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">AI Summary</h4>
                    <div className="w-2 h-2 bg-gray-400 rounded-full cursor-col-resize"></div>
                  </div>
                </div>

                <div className="flex-1 bg-green-50 flex flex-col min-h-0">
                  {/* Header - Fixed at top */}
                  <div className="p-4 pb-2 bg-green-50 flex-shrink-0">
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                          <BookOpen size={20} className="text-green-600" />
                          AI Summary
                        </h5>
                        <div className="flex items-center gap-2">
                          {renderListenButton('desktop')}
                          <button
                            onClick={() => {
                              if (!selectedFile) return;
                              localStorage.removeItem(`neurolearn_summary_text_${selectedFile}`);
                              localStorage.removeItem(`neurolearn_summary_images_${selectedFile}`);
                              localStorage.removeItem(`neurolearn_text_timestamp_${selectedFile}`);
                              loadSummaryForFile(selectedFile);
                            }}
                            disabled={!selectedFile || textLoading}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content - Scrollable area */}
                  <div className="flex-1 p-4 pt-2 overflow-y-auto min-h-0 hide-scrollbar">
                    {renderSummaryWithImages()}
                  </div>
                </div>
              </div>

              {/* Resize handle between Video and AI Tutor */}
              <div
                className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 0)}
              ></div>

              <div
                className="border-r border-gray-200 flex flex-col min-w-0 min-h-0"
                style={{ width: `${sectionWidths[1]}%` }}
              >
                <div className="p-4 border-b border-gray-200 bg-primary/5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">AI Tutor</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Saved</span>
                      <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs">🔔</span>
                      </div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full cursor-col-resize"></div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-primary/5 flex flex-col min-h-0">
                  {/* File Selector - Fixed at top */}
                  <div className="p-4 pb-2 bg-primary/5 flex-shrink-0">
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Ask about:
                        </label>
                        <select
                          value={selectedFile}
                          onChange={(e) => setSelectedFile(e.target.value)}
                          disabled={filesLoading}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        >
                          {filesLoading ? (
                            <option>Loading files...</option>
                          ) : availableFiles.length > 0 ? (
                            availableFiles.map((file) => (
                              <option key={file} value={file}>
                                {file}
                              </option>
                            ))
                          ) : (
                            <option>No files available</option>
                          )}
                        </select>
                        <button
                          onClick={async () => {
                            setFilesLoading(true);
                            try {
                              // Clear cache and force fresh fetch
                              localStorage.removeItem('neurolearn_available_files');
                              localStorage.removeItem('neurolearn_files_timestamp');

                              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/files`);
                              if (response.ok) {
                                // See loadAvailableFiles above - /api/files now returns objects.
                                const fileObjects: { originalName: string }[] = await response.json();
                                const fileList = fileObjects.map((f) => f.originalName).filter(Boolean);
                                setAvailableFiles(fileList);
                                // Update selected file if current one is no longer available
                                if (fileList.length > 0 && !fileList.includes(selectedFile)) {
                                  setSelectedFile(fileList[0]);
                                }

                                // Cache the new files
                                const now = Date.now();
                                localStorage.setItem('neurolearn_available_files', JSON.stringify(fileList));
                                localStorage.setItem('neurolearn_files_timestamp', now.toString());
                              }
                            } catch (error) {
                              console.error('Error refreshing files:', error);
                            } finally {
                              setFilesLoading(false);
                            }
                          }}
                          disabled={filesLoading}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                          title="Refresh file list"
                        >
                          🔄
                        </button>
                        {selectedFile && (
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {availableFiles.indexOf(selectedFile) + 1} of {availableFiles.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages - Scrollable area */}
                  <div ref={chatScrollRef} className="flex-1 p-4 pt-2 overflow-y-auto min-h-0 hide-scrollbar">
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${message.type === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-white text-gray-800 border'
                              }`}
                          >
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                              <div className="response-container">
                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                            <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary/10' : 'text-gray-500'
                              }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg px-3 py-2 border">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type your question..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isProcessing) {
                          sendTextMessage();
                        }
                      }}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />

                    {/* Mic Button */}
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        disabled={isProcessing}
                        className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                        title="Start voice recording"
                      >
                        <Mic className="w-4 h-4" />

                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center animate-pulse"
                        title="Stop recording"
                      >
                        <Square className="w-4 h-4" />

                      </button>
                    )}

                    {/* Send Button */}
                    <button
                      onClick={sendTextMessage}
                      disabled={isProcessing || !currentMessage.trim()}
                      className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                      title="Send message"
                    >
                      <span className="text-sm">↑</span>
                    </button>
                  </div>

                  {/* Recording Status */}
                  {isRecording && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        Recording... Click stop when done
                      </p>
                    </div>
                  )}
                </div>
              </div>


            </div>

            {/* Mobile: single scrollable column - Video, then Summary (with
                interleaved images), then Reference Links. The AI Tutor chat
                column is intentionally left out here - that experience now
                lives on its own dedicated tab (see MobileBottomNav). */}
            <div className="lg:hidden flex-1 overflow-y-auto min-h-0 hide-scrollbar p-4 pb-24 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800">Video Explanation</h5>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefreshVideo}
                      disabled={videoLoading}
                      className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={handleGenerateVideo}
                      disabled={videoLoading}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {videoLoading ? 'Working...' : 'Generate'}
                    </button>
                  </div>
                </div>
                {renderVideoPlayer()}
                {videoError && <p className="text-xs text-red-600 mt-2">{videoError}</p>}
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen size={20} className="text-green-600" />
                    AI Summary
                  </h5>
                  {renderListenButton('mobile')}
                </div>
                {renderSummaryWithImages()}
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                {renderReferenceLinksList()}
              </div>
            </div>

            {/* Image Zoom Modal - shared by both the desktop and mobile
                layouts above (they toggle via `hidden`/`lg:hidden`, which
                would otherwise hide this too if it stayed nested inside
                either one). */}
            {zoomedImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => setZoomedImage(null)}
              >
                <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
                  <button
                    className="absolute -top-10 right-0 text-white hover:text-gray-300"
                    onClick={() => setZoomedImage(null)}
                  >
                    <span className="text-2xl">&times;</span> Close
                  </button>
                  <img
                    src={zoomedImage}
                    alt="Zoomed View"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className={`h-screen w-screen bg-[#FAFAFC] flex flex-col overflow-hidden min-h-0 ${isResizing ? 'cursor-col-resize' : ''}`}>
      {/* Top Header Bar (Desktop Only) */}
      <div className="hidden lg:flex items-center justify-between py-2.5 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex-shrink-0 z-10 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <h1 className="text-sm font-bold text-slate-800 truncate">
            {activeTab === "upload" ? "Upload Documents" :
              activeTab === "learning" ? "Learning Hub" :
                activeTab === "assessment" ? "Assessment" :
                  "AI Tutor"}
          </h1>
        </div>

        {/* Right Status & Profile */}
        <div className="flex items-center gap-4">
          {backendConnected === null && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium hidden sm:inline">Connecting...</span>
            </div>
          )}
          {backendConnected === true && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-semibold hidden sm:inline">Connected</span>
            </div>
          )}
          {backendConnected === false && (
            <div className="flex items-center gap-1.5 text-rose-500">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              <span className="text-xs font-medium hidden sm:inline">Disconnected</span>
            </div>
          )}

          <UserMenu />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 pb-16 lg:pb-0 relative">
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "learning" && <LearningTab files={files} />}
        {activeTab === "assessment" && <AssessmentTab handleTabChange={handleTabChange} navigate={navigate} />}
        {activeTab === "tutor" && <TutorTab handleTabChange={handleTabChange} navigate={navigate} />}
      </div>

      {/* Global Mobile Bottom Dock Navigation Bar (< lg) */}
      <MobileBottomNav
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        navigate={navigate}
        onOpenTutorSheet={() => setIsMobileTutorSheetOpen(true)}
      />

      {/* Global Mobile AI Tutor Bottom Sheet Modal */}
      <MobileTutorSheet
        isOpen={isMobileTutorSheetOpen}
        onClose={() => setIsMobileTutorSheetOpen(false)}
        fileName={localStorage.getItem("neurolearn_tutor_file_name")}
      />
    </div>
  );
}