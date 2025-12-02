import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, MessageCircle, BookOpen, FileText, RotateCcw, ArrowLeft, Home } from "lucide-react";
import { apiService, UploadResponse, QAResponse, ReferenceLink, ProcessingStatus, AssessmentQuestion, AssessmentFeedback } from "@/lib/api";

type AssessmentState = 'welcome' | 'question' | 'answer' | 'feedback';

type AutoPipelineState = {
  file?: string;
  running: boolean;
  error?: string;
  summaryHash?: string;
  attempted: boolean;
};

const AssessmentTab = ({ handleTabChange, navigate }: { handleTabChange: (tab: "upload" | "learning" | "assessment") => void, navigate: (path: string | number) => void }) => {
  const [currentState, setCurrentState] = useState<AssessmentState>('welcome');
  const [question, setQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateQuestion = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response: AssessmentQuestion = await apiService.generateAssessment();
      setQuestion(response.question);
      setCurrentState('question');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question');
    } finally {
      setIsLoading(false);
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
        {/* Left Sidebar */}
        <div className="w-20 bg-gray-100 flex flex-col items-center py-4 gap-3">
          <button 
            onClick={() => handleTabChange("upload")}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300"
            title="Upload Documents"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("learning")}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300"
            title="Learning Hub"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          {/* <button 
            onClick={() => setActiveTab("qa")}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300"
            title="Q&A Assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </button> */}
          <button 
            onClick={() => handleTabChange("assessment")}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-indigo-100 text-indigo-600"
            title="Assessment"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto min-h-0 hide-scrollbar">
          <div className="max-w-4xl mx-auto">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <p className="text-red-800 font-medium">Error</p>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Welcome State */}
            {currentState === 'welcome' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={40} className="text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready for Assessment?</h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Test your understanding with AI-generated questions based on your latest uploaded document. 
                    Get personalized feedback and improve your learning.
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={generateQuestion}
                      disabled={isLoading}
                      className="w-full max-w-md mx-auto px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating Question...
                        </>
                      ) : (
                        <>
                          <FileText size={20} />
                          Generate Question
                        </>
                      )}
                    </button>
                    
                    <p className="text-sm text-gray-500">
                      Questions are generated from your most recently uploaded document
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Question State */}
            {currentState === 'question' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Generated Question</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-indigo-500">
                    <p className="text-lg text-gray-800 leading-relaxed">{question}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={startAnswering}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
              </div>
            )}

            {/* Answer State */}
            {currentState === 'answer' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Your Answer</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-indigo-500">
                    <p className="text-sm text-gray-600 mb-2">Question:</p>
                    <p className="text-gray-800">{question}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Your Answer:</span>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 border border-gray-300 rounded-lg text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={6}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={submitAnswer}
                    disabled={isLoading || !userAnswer.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            {currentState === 'feedback' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Assessment Feedback</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-indigo-500">
                    <p className="text-sm text-gray-600 mb-2">Question:</p>
                    <p className="text-gray-800 mb-4">{question}</p>
                    <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                    <p className="text-gray-800">{userAnswer}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle size={24} className="text-green-600 mt-1" />
                      <h3 className="text-lg font-semibold text-green-800">AI Tutor Feedback</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={resetAssessment}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function StudyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upload" | "learning" | "assessment">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: ProcessingStatus }>({});
  const [successMessages, setSuccessMessages] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Resize functionality
  const [sectionWidths, setSectionWidths] = useState([33.33, 33.33, 33.34]); // Video, AI Tutor, AI Summary
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['upload', 'learning', 'assessment'].includes(tab)) {
      setActiveTab(tab as "upload" | "learning" | "assessment");
    }
  }, [searchParams]);

  // Clear cache when switching to learning tab to ensure fresh data
  const handleTabChange = (tab: "upload" | "learning" | "assessment") => {
    if (tab === "learning") {
      // Clear cache when switching to learning tab to get fresh data
      localStorage.removeItem('neurolearn_summary_text');
      localStorage.removeItem('neurolearn_text_timestamp');
      localStorage.removeItem('neurolearn_reference_links');
      localStorage.removeItem('neurolearn_links_timestamp');
      console.log('🗑️ Cleared cache when switching to Learning tab');
    }
    setActiveTab(tab);
  };

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await apiService.testConnection();
        setBackendConnected(connected);
        if (connected) {
          console.log('✅ Backend connection successful');
        } else {
          console.log('❌ Backend connection failed');
        }
      } catch (error) {
        console.error('❌ Backend connection test failed:', error);
        setBackendConnected(false);
      }
    };
    
    testConnection();
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
          
          console.log('Upload successful:', response);
          
          // Clear cache when new document is uploaded
          localStorage.removeItem('neurolearn_summary_text');
          localStorage.removeItem('neurolearn_text_timestamp');
          localStorage.removeItem('neurolearn_reference_links');
          localStorage.removeItem('neurolearn_links_timestamp');
          localStorage.removeItem('neurolearn_available_files');
          localStorage.removeItem('neurolearn_files_timestamp');
          console.log('🗑️ Cleared cache for new document upload');
          
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

  const simulateUpload = (file: File) => {
    const fileName = file.name;
    setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const current = prev[fileName] || 0;
        if (current >= 100) {
          clearInterval(interval);
          return { ...prev, [fileName]: 100 };
        }
        return { ...prev, [fileName]: current + 10 };
      });
    }, 200);
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
        console.log(`✅ Processing completed for ${filename}`);
        
        // Clear cache when processing is completed to ensure fresh data
        localStorage.removeItem('neurolearn_summary_text');
        localStorage.removeItem('neurolearn_text_timestamp');
        localStorage.removeItem('neurolearn_reference_links');
        localStorage.removeItem('neurolearn_links_timestamp');
        console.log('🗑️ Cleared cache after processing completion');
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
      <div className="flex-1 flex">
        <div className="w-20 bg-gray-100 flex flex-col items-center py-4 gap-3">
          <button 
            onClick={() => navigate("/")}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("upload")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "upload" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Upload Documents"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("learning")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "learning" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Learning Hub"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("assessment")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "assessment" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Assessment"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-muted/20"
              }`}
            >
              <div className="mb-4">
                <Upload
                  size={48}
                  className={`mx-auto ${
                    isDragging ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Drop your files here
              </h3>
              <p className="text-muted-foreground mb-6 font-light">
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
                className="px-8 py-3 bg-[hsl(var(--button-lavender))] text-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                SELECT FILES
              </button>
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
                        className={`rounded-lg p-4 border transition-colors ${
                          showSuccess 
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
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    isUploadComplete ? "bg-blue-600" : "bg-primary"
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
                      </div>
                    );
                  })}
                </div>

                {files.some((f) => successMessages[f.name]) && (
                  <button 
                    className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    onClick={() => handleTabChange("learning")}
                  >
                    Continue to Learning
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 space-y-6">
              <div className="rounded-lg p-6 border border-border bg-muted/20">
                <h4 className="font-semibold text-foreground mb-4">Supported Formats</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> PDF files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Max 50MB per file
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Multiple files
                  </li>
                </ul>
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
    const [textLoading, setTextLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [autoPipelineStatus, setAutoPipelineStatus] = useState<AutoPipelineState>({
      running: false,
      attempted: false
    });
    const summaryHashValue = summaryText && summaryText.trim().length > 0
      ? `${summaryText.length}-${summaryText.slice(0, 64)}`
      : undefined;
    
    // Chat functionality
    const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'bot', content: string, timestamp: Date}>>(() => {
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
    
    // Chat scroll ref
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Load reference links when component mounts
    useEffect(() => {
      const loadLinks = async () => {
        // Check localStorage first
        const cachedLinks = localStorage.getItem('neurolearn_reference_links');
        const cacheTimestamp = localStorage.getItem('neurolearn_links_timestamp');
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        if (cachedLinks && cacheAge < CACHE_DURATION) {
          try {
            const links = JSON.parse(cachedLinks);
            setReferenceLinks(links);
            console.log('📦 Loaded reference links from cache');
            return;
          } catch (error) {
            console.error('Failed to parse cached links:', error);
          }
        }

        setLinksLoading(true);
        try {
          const links = await apiService.getLinks();
          setReferenceLinks(links);
          
          // Cache the links
          localStorage.setItem('neurolearn_reference_links', JSON.stringify(links));
          localStorage.setItem('neurolearn_links_timestamp', now.toString());
          console.log('💾 Cached reference links');
        } catch (error) {
          console.error('Failed to load reference links:', error);
          setReferenceLinks([]);
        } finally {
          setLinksLoading(false);
        }
      };
      
      loadLinks();
    }, []);

    // Load summary text when component mounts
    useEffect(() => {
      const loadSummaryText = async () => {
        // Check localStorage first
        const cachedText = localStorage.getItem('neurolearn_summary_text');
        const cacheTimestamp = localStorage.getItem('neurolearn_text_timestamp');
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        if (cachedText && cacheAge < CACHE_DURATION) {
          setSummaryText(cachedText);
          console.log('📦 Loaded summary text from cache');
          return;
        }

        setTextLoading(true);
        try {
          const text = await apiService.getText();
          console.log('Fetched text from API:', text);
          setSummaryText(text);
          
          // Cache the text
          localStorage.setItem('neurolearn_summary_text', text);
          localStorage.setItem('neurolearn_text_timestamp', now.toString());
          console.log('💾 Cached summary text');
        } catch (error) {
          console.error('Failed to load summary text:', error);
          setSummaryText('');
        } finally {
          setTextLoading(false);
        }
      };
      
      loadSummaryText();
    }, []);

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
            console.log('📦 Loaded available files from cache');
            return;
          } catch (error) {
            console.error('Failed to parse cached files:', error);
          }
        }

        setFilesLoading(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/files`);
          if (response.ok) {
            const fileList = await response.json();
            setAvailableFiles(fileList);
            // Set the first file (most recent) as default
            if (fileList.length > 0 && !selectedFile) {
              setSelectedFile(fileList[0]);
            }
            
            // Cache the files
            localStorage.setItem('neurolearn_available_files', JSON.stringify(fileList));
            localStorage.setItem('neurolearn_files_timestamp', now.toString());
            console.log('💾 Cached available files');
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

    const triggerAutoPipeline = useCallback(
      async (targetFile?: string, targetSummary?: string, targetSummaryHash?: string) => {
        const fileName = targetFile || selectedFile || availableFiles[0];
        if (!fileName || !targetSummary || !targetSummary.trim()) {
          return;
        }
        setAutoPipelineStatus({
          running: true,
          file: fileName,
          error: undefined,
          summaryHash: targetSummaryHash,
          attempted: false
        });
        setVideoLoading(true);
        try {
          const ttsResult = await apiService.learningTTS(targetSummary, fileName);
          setAutoPipelineStatus({
            running: false,
            file: fileName,
            error: undefined,
            summaryHash: targetSummaryHash,
            attempted: true
          });
          if (ttsResult.videoUrl) {
            setVideoUrl(ttsResult.videoUrl);
            setVideoError(null);
          } else if (ttsResult.videoError) {
            setVideoError(ttsResult.videoError);
          } else {
            await loadLatestVideo(fileName);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to auto-generate audio/video';
          setAutoPipelineStatus({
            running: false,
            file: fileName,
            error: message,
            summaryHash: targetSummaryHash,
            attempted: true
          });
          setVideoError(message);
        } finally {
          setVideoLoading(false);
        }
      },
      [availableFiles, loadLatestVideo, selectedFile]
    );

    useEffect(() => {
      const fileName = selectedFile || availableFiles[0];
      if (!fileName || !summaryHashValue) {
        return;
      }
      if (autoPipelineStatus.running) {
        return;
      }
      if (
        autoPipelineStatus.file === fileName &&
        autoPipelineStatus.summaryHash === summaryHashValue &&
        autoPipelineStatus.attempted
      ) {
        return;
      }
      triggerAutoPipeline(fileName, summaryText, summaryHashValue);
    }, [summaryHashValue, summaryText, selectedFile, availableFiles, autoPipelineStatus, triggerAutoPipeline]);

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
        setAutoPipelineStatus({
          running: false,
          file: fileName,
          error: undefined,
          summaryHash: summaryHashValue,
          attempted: true
        });
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
        console.log('💾 Saved chat history to cache');
      } catch (error) {
        console.error('Failed to save chat history to cache:', error);
      }
    }, [chatMessages]);

    // Helper function to get the latest processed filename
    const getLatestProcessedFile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/files`);
        if (response.ok) {
          const fileList = await response.json();
          return fileList.length > 0 ? fileList[0] : 'keph101.pdf';
        }
      } catch (error) {
        console.error('Error getting file list:', error);
      }
      return 'keph101.pdf'; // Fallback
    };

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
        } catch (ttsError) {
          console.log('TTS not available:', ttsError);
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

    return (
    <div className="h-full w-full flex flex-col min-h-0">
      <div className="flex-1 flex min-h-0">
        <div className="w-20 bg-gray-100 flex flex-col items-center py-4 gap-3">
          <button 
            onClick={() => navigate("/")}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("upload")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "upload" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Upload Documents"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("learning")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "learning" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Learning Hub"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleTabChange("assessment")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "assessment" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Assessment"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div ref={containerRef} className="flex-1 flex flex-row overflow-hidden min-h-0">
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
                        autoPlay
                        muted
                        loop
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
                  {autoPipelineStatus.running && (
                    <p className="text-xs text-blue-600 mt-2">Auto-generating the latest audio and video...</p>
                  )}
                  {autoPipelineStatus.error && (
                    <p className="text-xs text-red-600 mt-2">{autoPipelineStatus.error}</p>
                  )}
                  {videoError && (
                    <p className="text-xs text-red-600 mt-2">{videoError}</p>
                  )}
                </div>
                
                {/* Reference Links - Scrollable area */}
                <div className="flex-1 p-4 pt-2 overflow-y-auto min-h-0 hide-scrollbar">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-800">Reference Links</h5>
                    {linksLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading links...</span>
                      </div>
                    ) : referenceLinks.length > 0 ? (
                      <div className="space-y-2">
                        {referenceLinks.map((link, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <h6 className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-1">
                                {link.title}
                              </h6>
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
                        <button 
                          onClick={async () => {
                            if (!summaryText) {
                              alert('No summary text available. Please wait for the summary to load.');
                              return;
                            }
                            try {
                              const fileName = selectedFile || availableFiles[0] || undefined;
                              if (!fileName) {
                                alert('Select or upload a document first.');
                                return;
                              }
                              const ttsResult = await apiService.learningTTS(summaryText, fileName);
                              if (ttsResult.audioUrl) {
                                const audio = new Audio(ttsResult.audioUrl);
                                audio.play().catch(err => {
                                  console.error('Error playing audio:', err);
                                  alert('Failed to play audio. Please try again.');
                                });
                              }
                              if (ttsResult.videoUrl) {
                                setVideoUrl(ttsResult.videoUrl);
                                setVideoError(null);
                              } else if (fileName) {
                                await loadLatestVideo(fileName);
                              }
                              setAutoPipelineStatus({
                                running: false,
                                file: fileName,
                                error: undefined,
                                summaryHash: summaryHashValue,
                                attempted: true
                              });
                            } catch (error) {
                              console.error('Failed to generate TTS:', error);
                              alert(error instanceof Error ? error.message : 'Failed to generate audio. Please try again.');
                            }
                          }}
                          disabled={!summaryText || textLoading}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          title="Play summary as audio"
                        >
                          🔊 Play Audio
                        </button>
                        <button 
                          onClick={async () => {
                            setTextLoading(true);
                            try {
                              // Clear cache and force fresh fetch
                              localStorage.removeItem('neurolearn_summary_text');
                              localStorage.removeItem('neurolearn_text_timestamp');
                              
                              const text = await apiService.getText();
                              console.log('Refreshed text from API:', text);
                              setSummaryText(text);
                              
                              // Cache the new text
                              const now = Date.now();
                              localStorage.setItem('neurolearn_summary_text', text);
                              localStorage.setItem('neurolearn_text_timestamp', now.toString());
                              console.log('💾 Cached refreshed summary text');
                            } catch (error) {
                              console.error('Failed to refresh summary text:', error);
                            } finally {
                              setTextLoading(false);
                            }
                          }}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content - Scrollable area */}
                <div className="flex-1 p-4 pt-2 overflow-y-auto min-h-0 hide-scrollbar">
                  {textLoading ? (
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-sm text-gray-600">Loading summary...</span>
                      </div>
                    </div>
                  ) : summaryText ? (
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {summaryText}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="text-center text-gray-500">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BookOpen size={24} className="text-gray-400" />
                        </div>
                        <h5 className="font-semibold text-gray-600 mb-2">AI Summary</h5>
                        <p className="text-sm text-gray-500">Upload a document to generate AI-powered summaries and key insights</p>
                      </div>
                    </div>
                  )}
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
              <div className="p-4 border-b border-gray-200 bg-indigo-50 flex-shrink-0">
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
              
              <div className="flex-1 bg-indigo-50 flex flex-col min-h-0">
                {/* File Selector - Fixed at top */}
                <div className="p-4 pb-2 bg-indigo-50 flex-shrink-0">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Ask about:
                      </label>
                      <select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        disabled={filesLoading}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
                              const fileList = await response.json();
                              setAvailableFiles(fileList);
                              // Update selected file if current one is no longer available
                              if (fileList.length > 0 && !fileList.includes(selectedFile)) {
                                setSelectedFile(fileList[0]);
                              }
                              
                              // Cache the new files
                              const now = Date.now();
                              localStorage.setItem('neurolearn_available_files', JSON.stringify(fileList));
                              localStorage.setItem('neurolearn_files_timestamp', now.toString());
                              console.log('💾 Cached refreshed available files');
                            }
                          } catch (error) {
                            console.error('Error refreshing files:', error);
                          } finally {
                            setFilesLoading(false);
                          }
                        }}
                        disabled={filesLoading}
                        className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors disabled:opacity-50"
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
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.type === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
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
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  
                  {/* Mic Button */}
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      disabled={isProcessing}
                      className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                      title="Start voice recording"
                    >
                      🎤
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center animate-pulse"
                      title="Stop recording"
                    >
                      ⏹️
                    </button>
                  )}
                  
                  {/* Send Button */}
                  <button 
                    onClick={sendTextMessage}
                    disabled={isProcessing || !currentMessage.trim()}
                    className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
        </div>
      </div>
    </div>
    );
  };


  return (
    <div className={`h-screen w-screen bg-white flex flex-col overflow-hidden min-h-0 ${isResizing ? 'cursor-col-resize' : ''}`}>
      <div className="flex items-center gap-4 py-4 px-6 bg-white border-b border-gray-200 flex-shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="h-4 w-px bg-gray-300"></div>
        <h1 className="text-lg font-semibold text-gray-800">
          {activeTab === "upload" ? "Upload Documents" : 
           activeTab === "learning" ? "Learning Hub" : 
           "Assessment"}
        </h1>
        
        {/* Backend Connection Status */}
        <div className="flex items-center gap-2 ml-auto">
          {backendConnected === null && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Connecting...</span>
            </div>
          )}
          {backendConnected === true && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs">Connected</span>
            </div>
          )}
          {backendConnected === false && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "learning" && <LearningTab files={files} />}
        {activeTab === "assessment" && <AssessmentTab handleTabChange={handleTabChange} navigate={navigate} />}
      </div>
    </div>
  );
}