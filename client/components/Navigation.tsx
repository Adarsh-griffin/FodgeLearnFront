import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useStartLearning } from "@/lib/useStartLearning";
import { UserMenu } from "@/components/UserMenu";

export function Navigation() {
  const { start, isReturning } = useStartLearning();
  // Shows the profile/log-out menu next to the button once signed in, so a
  // user never has to land on /study just to log out - previously the
  // homepage had no way to see you were signed in or to log out at all.
  const { isSignedIn } = useAuth();

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-card rounded-full px-4 sm:px-6 py-2 shadow-premium border border-border">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/navbarlogo.png" alt="LearnForge" className="h-6 sm:h-7 w-auto" />
            </Link>

            <div className="flex items-center gap-3">
              {isSignedIn && <UserMenu />}
              <button
                onClick={start}
                className="px-4 sm:px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                {isReturning ? "Continue Learning" : "Start Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
