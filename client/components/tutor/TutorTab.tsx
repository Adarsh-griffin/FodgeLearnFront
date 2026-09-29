import { useCallback, useEffect, useState } from "react";
import { useAuth, SignInButton } from "@clerk/react";
import { FileText, GraduationCap, CheckCircle2, Menu, Search, Bell } from "lucide-react";
import { apiService, FileInfo, StudyPlan, DiagnosticResult, LessonStep } from "@/lib/api";
import { getTutorAuthHeaders } from "@/lib/identity";
import { OnboardingStep } from "./OnboardingStep";
import { DiagnosticQuiz } from "./DiagnosticQuiz";
import { RoadmapView } from "./RoadmapView";
import { LessonView } from "./LessonView";
import { TutorSidebar } from "./TutorSidebar";
import { TutorAssistantPanel } from "./TutorAssistantPanel";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileTutorSheet } from "./MobileTutorSheet";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { TutorLoadingScreen } from "./TutorLoadingScreen";

type Stage = "loading" | "select_file" | "onboarding" | "diagnostic" | "generating_plan" | "roadmap" | "lesson" | "complete";

const FILE_ID_KEY = "neurolearn_tutor_file_id";
const FILE_NAME_KEY = "neurolearn_tutor_file_name";

interface TutorTabProps {
  handleTabChange: (tab: "upload" | "learning" | "assessment" | "tutor") => void;
  navigate: (path: string | number) => void;
}

export function TutorTab({ handleTabChange, navigate }: TutorTabProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [stage, setStage] = useState<Stage>("loading");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>("Understand the topic deeply");
  const [availableMinutes, setAvailableMinutes] = useState<number>(30);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonStep | null>(null);

  // Mobile Sheet & Drawer States
  const [isMobileTutorSheetOpen, setIsMobileTutorSheetOpen] = useState(false);
  const [isMobileNavDrawerOpen, setIsMobileNavDrawerOpen] = useState(false);

  const handleMasteryUpdate = (topicId: string, mastery: number) => {
    setPlan((prev) =>
      prev ? { ...prev, steps: prev.steps.map((s) => (s.topic_id === topicId ? { ...s, mastery } : s)) } : prev,
    );
  };

  const getAuthHeaders = useCallback(
    () => getTutorAuthHeaders(!!isSignedIn, getToken),
    [isSignedIn, getToken],
  );

  // Resumes exactly where this student left off for this document (an
  // already-generated roadmap or an in-progress lesson) instead of always
  // restarting at onboarding - TutorTab unmounts every time the user
  // switches to another tab, which used to wipe this progress from local
  // state even though it was already saved server-side in student_profiles
  // all along (every diagnostic answer, plan, and lesson checkpoint is
  // persisted there). See test_groq.py's /api/tutor/progress.
  const resumeProgress = async (fileId: string) => {
    setStage("loading");
    try {
      const headers = await getAuthHeaders();
      const progress = await apiService.getTutorProgress(fileId, headers);
      if (progress.goal) setGoal(progress.goal);
      if (progress.availableMinutes) setAvailableMinutes(progress.availableMinutes);
      if (progress.studyPlan) setPlan(progress.studyPlan);
      setStage(progress.stage);
    } catch (err) {
      console.error("Failed to resume tutor progress:", err);
      setStage("onboarding");
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    apiService
      .getFiles()
      .then((list) => {
        if (cancelled) return;
        setFiles(list);
        const cachedId = localStorage.getItem(FILE_ID_KEY);
        const cachedName = localStorage.getItem(FILE_NAME_KEY);
        const stillExists = cachedId && list.some((f) => f._id === cachedId);
        if (stillExists) {
          setSelectedFileId(cachedId);
          setSelectedFileName(cachedName);
          resumeProgress(cachedId);
        } else {
          setStage("select_file");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFilesError(err instanceof Error ? err.message : "Failed to load your documents");
          setStage("select_file");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded]);

  const handleSelectFile = (file: FileInfo) => {
    localStorage.setItem(FILE_ID_KEY, file._id);
    localStorage.setItem(FILE_NAME_KEY, file.originalName);
    setSelectedFileId(file._id);
    setSelectedFileName(file.originalName);
    resumeProgress(file._id);
  };

  const handleChangeDocument = () => {
    localStorage.removeItem(FILE_ID_KEY);
    localStorage.removeItem(FILE_NAME_KEY);
    setSelectedFileId(null);
    setSelectedFileName(null);
    setPlan(null);
    setStage("select_file");
  };

  const generatePlan = async (goalForPlan: string, minutesForPlan: number) => {
    if (!selectedFileId) return;
    setStage("generating_plan");
    setPlanError(null);
    try {
      const headers = await getAuthHeaders();
      const generatedPlan = await apiService.generateStudyPlan(selectedFileId, minutesForPlan, goalForPlan, headers);
      setPlan(generatedPlan);
      setStage("roadmap");
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Failed to generate your study plan");
      setStage("roadmap");
    }
  };

  const handleOnboardingComplete = (chosenGoal: string, minutes: number) => {
    setGoal(chosenGoal);
    setAvailableMinutes(minutes);
    if (chosenGoal === "Learn from scratch") {
      generatePlan(chosenGoal, minutes);
    } else {
      setStage("diagnostic");
    }
  };

  const handleDiagnosticComplete = async (_result: DiagnosticResult) => {
    await generatePlan(goal, availableMinutes);
  };

  const handleStartLearning = () => setStage("lesson");
  const handleAllDone = () => setStage("complete");

  if (stage === "loading" || !isLoaded) {
    return <TutorLoadingScreen message="Loading your AI Tutor" />;
  }

  if (stage === "select_file") {
    return (
      <div className="flex-1 flex min-h-0 bg-[#FAFAFC]">
        <TutorSidebar
          activeTab="tutor"
          handleTabChange={handleTabChange}
          navigate={navigate}
          fileName={selectedFileName}
          plan={plan}
          onChangeDocument={handleChangeDocument}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 sm:p-8 text-center overflow-y-auto">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Which document do you want to learn?</h2>
          {filesError && <p className="text-sm text-rose-600">{filesError}</p>}
          {files.length === 0 && !filesError ? (
            <p className="text-sm text-slate-500">Upload a document first from the Upload tab.</p>
          ) : (
            <div className="w-full max-w-md space-y-2">
              {files.map((f) => (
                <button
                  key={f._id}
                  onClick={() => handleSelectFile(f)}
                  className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-sm transition-all text-left group"
                >
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
                  <span className="text-sm font-medium text-slate-800 truncate">{f.originalName}</span>
                </button>
              ))}
            </div>
          )}
          {!isSignedIn && (
            <p className="text-xs text-slate-400 mt-2">
              Progress saved on this device.{" "}
              <SignInButton mode="modal" forceRedirectUrl="/study">
                <button className="text-indigo-600 hover:underline font-semibold">Sign in to sync</button>
              </SignInButton>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!selectedFileId) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FAFAFC] overflow-hidden relative">
      {/* Mobile Sticky Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 select-none z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavDrawerOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/navbarlogo.png" alt="Learnfodge" className="h-6 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileTutorSheetOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            A
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Left Sidebar (hidden on mobile) */}
        <TutorSidebar
          activeTab="tutor"
          handleTabChange={handleTabChange}
          navigate={navigate}
          fileName={selectedFileName}
          plan={plan}
          currentTopicId={currentLesson?.topic_id}
          onChangeDocument={handleChangeDocument}
        />

        <div className="flex-1 flex min-h-0 overflow-hidden w-full">
          {stage === "onboarding" && <OnboardingStep onComplete={handleOnboardingComplete} />}

          {stage === "diagnostic" && (
            <DiagnosticQuiz
              fileId={selectedFileId}
              goal={goal}
              getAuthHeaders={getAuthHeaders}
              onComplete={handleDiagnosticComplete}
            />
          )}

          {stage === "generating_plan" && (
            <TutorLoadingScreen
              message="Building your personalized roadmap"
              subMessages={[
                "Reviewing your diagnostic results...",
                "Sequencing topics by mastery...",
                "Almost ready...",
              ]}
            />
          )}

          {stage === "roadmap" && plan && <RoadmapView plan={plan} onStart={handleStartLearning} />}

          {stage === "lesson" && plan && (
            <div className="flex-1 flex min-h-0 overflow-hidden w-full">
              <LessonView
                fileId={selectedFileId}
                goal={goal}
                plan={plan}
                getAuthHeaders={getAuthHeaders}
                onAllDone={handleAllDone}
                onLessonChange={setCurrentLesson}
                onMasteryUpdate={handleMasteryUpdate}
              />
              {/* Desktop Right Panel (hidden on mobile) */}
              <TutorAssistantPanel
                fileName={selectedFileName}
                plan={plan}
                currentTopicId={currentLesson?.topic_id}
                currentTopicTitle={currentLesson?.topic_title}
                currentExplanation={currentLesson?.explanation}
              />
            </div>
          )}

          {stage === "complete" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 sm:p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Session Complete!</h2>
              <p className="text-sm text-slate-500 max-w-sm">
                You've mastered every topic in this learning session. Revisit anytime or start a new document.
              </p>
              <button
                onClick={() => setStage("onboarding")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Left Navigation & Topics) */}
      <MobileNavDrawer
        isOpen={isMobileNavDrawerOpen}
        onClose={() => setIsMobileNavDrawerOpen(false)}
        activeTab="tutor"
        handleTabChange={handleTabChange}
        navigate={navigate}
        fileName={selectedFileName}
        plan={plan}
        currentTopicId={currentLesson?.topic_id}
        onChangeDocument={handleChangeDocument}
      />

      {/* Mobile AI Tutor Bottom Sheet */}
      <MobileTutorSheet
        isOpen={isMobileTutorSheetOpen}
        onClose={() => setIsMobileTutorSheetOpen(false)}
        fileName={selectedFileName}
        currentTopicTitle={currentLesson?.topic_title}
        currentExplanation={currentLesson?.explanation}
      />

      {/* Mobile Bottom Dock Bar */}
      <MobileBottomNav
        activeTab="tutor"
        handleTabChange={handleTabChange}
        navigate={navigate}
        onOpenTutorSheet={() => setIsMobileTutorSheetOpen(true)}
      />
    </div>
  );
}
