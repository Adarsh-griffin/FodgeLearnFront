import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useAuthGate } from "@/lib/AuthGateContext";
import { useReturningStatus } from "@/lib/useReturningStatus";

/**
 * Shared logic for the homepage's two entry-point buttons (Navigation's
 * "Start Now" and Home's "Get Started"). These used to be two separate
 * functions with identical bodies kept in sync by hand - one shared hook
 * instead, so "same logic" is actually enforced by the code, not just true
 * by coincidence today.
 */
export function useStartLearning() {
  const navigate = useNavigate();
  const { openAuthGate } = useAuthGate();
  const { isSignedIn } = useAuth();
  // Backed by actual saved AI Tutor progress on the server, not just "is
  // this browser identified" - see useReturningStatus for why that
  // distinction matters (deleting student_profiles in Mongo should send a
  // student back through the auth gate, not silently resume nothing).
  const isReturning = useReturningStatus();

  const start = () => {
    // The auth gate's only job is to establish an identity (sign in, sign
    // up, or continue as guest). A Clerk session already does that, so an
    // already-signed-in user skips it even on their very first visit
    // (isReturning only reflects whether they have saved AI Tutor progress
    // yet, which is unrelated to whether they're already authenticated).
    if (isSignedIn || isReturning) {
      navigate("/study");
    } else {
      openAuthGate();
    }
  };

  return { start, isReturning };
}
