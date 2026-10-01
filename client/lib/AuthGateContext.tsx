import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Single shared "should the sign-in/guest gate be open" state for the
 * whole homepage - Navigation and Home each used to keep their OWN
 * showAuthGate useState and render their OWN <AuthGateModal>. Since
 * Navigation is always mounted alongside Home (see App.tsx), clicking
 * "Start Now" in the nav and "Get Started" on the page both being
 * clickable at once meant both independent modals could end up open
 * simultaneously, stacked on top of each other - confirmed via screenshot.
 * One shared instance, one shared piece of state, fixes that by
 * construction: there is only ever one modal to open.
 */
interface AuthGateContextValue {
  isOpen: boolean;
  openAuthGate: () => void;
  closeAuthGate: () => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AuthGateContext.Provider
      value={{
        isOpen,
        openAuthGate: () => setIsOpen(true),
        closeAuthGate: () => setIsOpen(false),
      }}
    >
      {children}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateContextValue {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error("useAuthGate() must be called within an <AuthGateProvider>");
  }
  return ctx;
}
