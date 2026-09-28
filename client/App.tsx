import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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

const App = () => {
  return (
    <ClerkProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col min-h-screen">
                <Navigation />
                <main className="flex-1">
                  <Home />
                </main>
                <Footer />
              </div>
            }
          />
          <Route path="/study" element={<StudyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
