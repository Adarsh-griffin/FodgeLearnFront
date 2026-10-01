import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AuthGateModal } from "@/components/AuthGateModal";
import { AuthGateProvider, useAuthGate } from "@/lib/AuthGateContext";
import { Home } from "./pages/Home";
import { StudyPage } from "./pages/Study";
import NotFound from "./pages/NotFound";

// ClerkProvider reads VITE_CLERK_PUBLISHABLE_KEY from the env automatically.
// Only the AI Tutor tab actually requires a signed-in user; every other
// route/tab in the app is untouched by this and keeps working without it.
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn(
    "[AI Tutor] VITE_CLERK_PUBLISHABLE_KEY is not set in LearnFront/.env — sign-in on the AI Tutor tab will not work until it's added.",
  );
}

/**
 * Wires Clerk's post-sign-in navigation (forceRedirectUrl, etc.) through
 * React Router instead of Clerk's default. Without this, forceRedirectUrl
 * on SignInButton/SignUpButton (used on the home page's AuthGateModal and
 * the AI Tutor tab) silently failed to navigate anywhere in this SPA -
 * this must be inside <BrowserRouter> to call useNavigate().
 */
function ClerkProviderWithRoutes({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}

/** The single shared auth-gate modal instance for the homepage - both
 * Navigation's "Start Now" and Home's "Get Started" open THIS one via
 * useAuthGate(), instead of each rendering (and independently opening)
 * their own copy. */
function HomeRoute() {
  const { isOpen, closeAuthGate } = useAuthGate();
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Home />
      </main>
      <Footer />
      <AuthGateModal isOpen={isOpen} onClose={closeAuthGate} />
    </div>
  );
}

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ClerkProviderWithRoutes>
          <AuthGateProvider>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/study" element={<StudyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGateProvider>
        </ClerkProviderWithRoutes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
