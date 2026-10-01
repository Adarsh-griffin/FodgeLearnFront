import { Link, useNavigate } from "react-router-dom";
import { useReturningStatus } from "@/lib/useReturningStatus";
import { useAuthGate } from "@/lib/AuthGateContext";

export function Navigation() {
  const navigate = useNavigate();
  const { openAuthGate } = useAuthGate();
  // Backed by actual saved AI Tutor progress on the server, not just "is
  // this browser identified" - see useReturningStatus for why that
  // distinction matters (deleting student_profiles in Mongo should send a
  // student back through the auth gate, not silently resume nothing).
  const isReturning = useReturningStatus();

  // This used to be a plain <Link to="/study">, which sent a first-time
  // visitor straight into the app with no sign-in/guest choice at all -
  // skipping the exact gate Home.tsx's "Get Started" button enforces.
  const handleStartNow = () => {
    if (isReturning) {
      navigate("/study");
    } else {
      openAuthGate();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-card rounded-full px-4 sm:px-6 py-2 shadow-premium border border-border">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/navbarlogo.png" alt="LearnForge" className="h-6 sm:h-7 w-auto" />
            </Link>

            {/* Always visible - there's only one nav action, so no hamburger needed */}
            <button
              onClick={handleStartNow}
              className="px-4 sm:px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              {isReturning ? "Continue Learning" : "Start Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
