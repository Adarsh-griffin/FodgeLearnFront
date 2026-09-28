import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/react";
import { GraduationCap } from "lucide-react";
import { getTutorAuthHeaders } from "@/lib/identity";

/**
 * Phase 0 placeholder for the AI Tutor feature.
 *
 * Identity here is never blocking: a student reaches this tab either
 * Clerk-signed-in or anonymous (they chose "Continue without an account" on
 * the AuthGateModal on the home page, or landed here directly - either way
 * getTutorAuthHeaders() falls back to an anonymous id automatically). This
 * only proves that wiring end-to-end via `/api/tutor/ping`.
 *
 * The real diagnostic quiz / roadmap / lesson UI (DiagnosticQuiz.tsx,
 * RoadmapView.tsx, LessonView.tsx) replaces the content below in later
 * build phases - this file is the permanent home for that, not a
 * throwaway.
 */
export function TutorTab() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handlePing = async () => {
    setIsPinging(true);
    setPingError(null);
    setPingResult(null);
    try {
      const headers = await getTutorAuthHeaders(!!isSignedIn, getToken);
      const res = await fetch(`${baseUrl}/api/tutor/ping`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setPingResult(`Backend confirmed user: ${data.user_id}`);
    } catch (err) {
      setPingError(err instanceof Error ? err.message : "Ping failed");
    } finally {
      setIsPinging(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
        <GraduationCap className="w-8 h-8 text-indigo-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800">
        AI Tutor — coming online
      </h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Diagnostic quiz, personalized roadmap, and adaptive lessons land here
        in the next build phases.
      </p>

      {!isSignedIn && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Progress on this device only.</span>
          <SignInButton mode="modal">
            <button className="text-indigo-600 hover:underline">
              Sign in to sync it
            </button>
          </SignInButton>
        </div>
      )}

      <button
        onClick={handlePing}
        disabled={isPinging}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isPinging ? "Checking..." : "Test authenticated connection"}
      </button>
      {pingResult && <p className="text-sm text-green-600">{pingResult}</p>}
      {pingError && <p className="text-sm text-red-600">{pingError}</p>}
    </div>
  );
}
