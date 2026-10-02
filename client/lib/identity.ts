/**
 * AI Tutor identity: a student is either Clerk-signed-in, or has skipped
 * sign-in and is identified by a UUID generated once and kept in
 * localStorage. Every tutor API call needs exactly one of the two headers
 * this file builds - see clerk_auth.py's require_auth for the backend side.
 *
 * Skipping sign-in is a real, supported choice (not a degraded state): the
 * tradeoff is just that the student model then only lives in this browser
 * and is lost if site data is cleared.
 */

const ANON_ID_KEY = "neurolearn_anonymous_id";

/** Returns the existing anonymous id for this browser, creating one if needed. */
export function getOrCreateAnonymousId(): string {
  try {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
  } catch {
    // localStorage unavailable (private mode, blocked storage, etc.) - fall
    // through and hand back a per-call id; it just won't persist.
  }

  const fresh =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    localStorage.setItem(ANON_ID_KEY, fresh);
  } catch {
    // ignore - see above
  }
  return fresh;
}

/** True if this browser has ever skipped sign-in (used to skip the gate on repeat visits). */
export function hasAnonymousId(): boolean {
  try {
    return !!localStorage.getItem(ANON_ID_KEY);
  } catch {
    return false;
  }
}

/**
 * Builds the one header every /api/tutor/* call needs.
 * `getToken` is Clerk's useAuth().getToken - pass it only when signed in.
 *
 * Retries getToken() a few times before giving up: right after a fresh
 * sign-in (or on a repeat visit while Clerk is still rehydrating the
 * session), isSignedIn can flip true a moment before getToken() actually
 * has a token ready, and getToken() returns null during that gap. This
 * used to silently fall through to the anonymous-guest header on ANY
 * null - meaning a signed-in user's request could silently run under a
 * completely different (anonymous) identity instead of their real
 * account, right at the moment they sign in - which is exactly the
 * "works the first time, breaks on re-login" symptom: the anonymous
 * identity has no saved progress, so the app looks like it forgot them.
 */
export async function getTutorAuthHeaders(
  isSignedIn: boolean,
  getToken: () => Promise<string | null>,
): Promise<Record<string, string>> {
  if (isSignedIn) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const token = await getToken();
      if (token) return { Authorization: `Bearer ${token}` };
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250));
    }
    console.warn("[identity] Signed in but no Clerk token after 3 attempts - falling back to anonymous identity for this request.");
  }
  return { "X-Anonymous-Id": getOrCreateAnonymousId() };
}
