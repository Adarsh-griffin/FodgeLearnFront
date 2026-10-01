import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { hasAnonymousId, getTutorAuthHeaders } from "@/lib/identity";
import { apiService } from "@/lib/api";

/**
 * Whether to show "Continue Learning" instead of "Start Now"/"Get Started"
 * on the homepage/navbar. Deliberately checks the BACKEND for actual saved
 * progress (student_profiles) rather than just "is this browser identified"
 * (a Clerk session or an anonymous id in localStorage) - those persist in
 * the browser/Clerk independently of MongoDB, so manually deleting a
 * student's profile document had no visible effect before this: the
 * button still said "Continue Learning" with nothing left to continue.
 *
 * Defaults to false (treat as a new visitor) until the check resolves, so
 * there's no incorrect flash of "Continue Learning" before we know either
 * way - safer to under-claim returning status than over-claim it.
 */
export function useReturningStatus(): boolean {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const identified = isSignedIn || hasAnonymousId();
    if (!identified) {
      setIsReturning(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const headers = await getTutorAuthHeaders(!!isSignedIn, getToken);
        const hasProfile = await apiService.getHasTutorProfile(headers);
        if (!cancelled) setIsReturning(hasProfile);
      } catch {
        if (!cancelled) setIsReturning(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return isReturning;
}
