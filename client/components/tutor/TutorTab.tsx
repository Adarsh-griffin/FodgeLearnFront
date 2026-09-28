import { useCallback, useEffect, useState } from "react";
import { useAuth, SignInButton } from "@clerk/react";
import { FileText, GraduationCap, CheckCircle2, Home, Upload, BookOpen } from "lucide-react";
import { apiService, FileInfo, StudyPlan, DiagnosticResult } from "@/lib/api";
import { getTutorAuthHeaders } from "@/lib/identity";
import { OnboardingStep } from "./OnboardingStep";
import { DiagnosticQuiz } from "./DiagnosticQuiz";
import { RoadmapView } from "./RoadmapView";
import { LessonView } from "./LessonView";

type Stage = "loading" | "select_file" | "onboarding" | "diagnostic" | "generating_plan" | "roadmap" | "lesson" | "complete";

const FILE_ID_KEY = "neurolearn_tutor_file_id";
const FILE_NAME_KEY = "neurolearn_tutor_file_name";

/**
 * Orchestrates the full AI Tutor flow: pick a document -> onboarding
 * (goal + time) -> adaptive diagnostic (Phase 2) -> generated roadmap
 * (Phase 3) -> lesson-by-lesson delivery (Phase 4) -> completion.
 *
 * Identity is never blocking here: a student reaches every stage whether
 * signed in or anonymous (see client/lib/identity.ts) - getAuthHeaders()
 * always resolves a fresh token/id right before each API call rather than
 * a precomputed one, since a Clerk session token is short-lived and a
 * full diagnostic + lesson run can span several minutes.
 */
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

  const getAuthHeaders = useCallback(
    () => getTutorAuthHeaders(!!isSignedIn, getToken),
    [isSignedIn, getToken],
  );

  // Load the file list once Clerk has resolved sign-in state, and restore
  // a previously-selected document (if any) so a page refresh doesn't
  // dump the student back to square one.
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
          setStage("onboarding");
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
    setStage("onboarding");
  };

  const handleChangeDocument = () => {
    localStorage.removeItem(FILE_ID_KEY);
    localStorage.removeItem(FILE_NAME_KEY);
    setSelectedFileId(null);
    setSelectedFileName(null);
    setPlan(null);
    setStage("select_file");
  };

  const handleOnboardingComplete = (chosenGoal: string, minutes: number) => {
    setGoal(chosenGoal);
    setAvailableMinutes(minutes);
    setStage("diagnostic");
  };

  const handleDiagnosticComplete = async (_result: DiagnosticResult) => {
    if (!selectedFileId) return;
    setStage("generating_plan");
    setPlanError(null);
    try {
      const headers = await getAuthHeaders();
      const generatedPlan = await apiService.generateStudyPlan(selectedFileId, availableMinutes, goal, headers);
      setPlan(generatedPlan);
      setStage("roadmap");
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Failed to generate your study plan");
      setStage("roadmap");
    }
  };

  const handleStartLearning = () => setStage("lesson");
  const handleAllDone = () => setStage("complete");

  // Same rail every other tab renders (Upload/Learning/Assessment each keep
  // their own copy) - the AI Tutor tab needs it too, so a student can get
  // back to another tab without hitting the browser back button.
  const rail = (
    <div className="w-16 sm:w-20 bg-secondary flex flex-col items-center py-4 gap-3 flex-shrink-0">
      <button
        onClick={() => navigate("/")}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
        title="Home"
      >
        <Home className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleTabChange("tutor")}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors bg-primary/10 text-primary"
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
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-card hover:text-foreground"
        title="Assessment"
      >
        <FileText className="w-5 h-5" />
      </button>
    </div>
  );

  if (stage === "loading" || !isLoaded) {
    return (
      <div className="flex-1 flex min-h-0">
        {rail}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (stage === "select_file") {
    return (
      <div className="flex-1 flex min-h-0">
        {rail}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 sm:p-8 text-center overflow-y-auto">
          <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Which document do you want to learn?</h2>
          {filesError && <p className="text-sm text-destructive">{filesError}</p>}
          {files.length === 0 && !filesError ? (
            <p className="text-sm text-muted-foreground">Upload a document first from the Upload tab.</p>
          ) : (
            <div className="w-full max-w-md space-y-2">
              {files.map((f) => (
                <button
                  key={f._id}
                  onClick={() => handleSelectFile(f)}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/40 hover:bg-secondary transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{f.originalName}</span>
                </button>
              ))}
            </div>
          )}
          {!isSignedIn && (
            <p className="text-xs text-muted-foreground mt-2">
              Progress is saved to this device only.{" "}
              <SignInButton mode="modal" forceRedirectUrl="/study">
                <button className="text-primary hover:underline">Sign in to sync it</button>
              </SignInButton>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!selectedFileId) return null; // unreachable past this point, but keeps TS happy

  return (
    <div className="flex-1 flex min-h-0">
      {rail}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border flex-shrink-0 gap-2">
          <span className="text-sm text-muted-foreground truncate">{selectedFileName}</span>
          <button onClick={handleChangeDocument} className="text-xs text-primary hover:underline flex-shrink-0">
            Change document
          </button>
        </div>

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
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Building your personalized learning path...</p>
          </div>
        )}

        {stage === "roadmap" && plan && <RoadmapView plan={plan} onStart={handleStartLearning} />}
        {stage === "roadmap" && !plan && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-destructive">{planError}</p>
          </div>
        )}

        {stage === "lesson" && (
          <LessonView fileId={selectedFileId} getAuthHeaders={getAuthHeaders} onAllDone={handleAllDone} />
        )}

        {stage === "complete" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Session complete!</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              You've worked through every topic in this plan. Come back any time to review or build a new plan.
            </p>
            <button
              onClick={() => setStage("onboarding")}
              className="px-6 py-3 gradient-brand text-white rounded-xl font-semibold shadow-premium hover:opacity-95 active:scale-[0.98] transition-all"
            >
              Start a New Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
