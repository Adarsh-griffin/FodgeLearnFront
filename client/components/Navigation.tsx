import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { hasAnonymousId } from "@/lib/identity";

export function Navigation() {
  const { isSignedIn } = useAuth();
  // A signed-in (or previously guest-identified) user has already been
  // through onboarding - "Start Now" implied starting over, forcing them
  // to redo the auth-gate/document flow every time they came back to the
  // homepage instead of just resuming their session.
  const isReturning = isSignedIn || hasAnonymousId();

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-card rounded-full px-4 sm:px-6 py-2 shadow-premium border border-border">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/navbarlogo.png" alt="LearnFodge" className="h-6 sm:h-7 w-auto" />
            </Link>

            {/* Always visible - there's only one nav action, so no hamburger needed */}
            <Link
              to="/study"
              className="px-4 sm:px-5 py-2 gradient-brand text-white rounded-full text-sm sm:text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              {isReturning ? "Continue Learning" : "Start Now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
