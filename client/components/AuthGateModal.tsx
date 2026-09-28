import { useNavigate } from "react-router-dom";
import { SignInButton, SignUpButton } from "@clerk/react";
import { GraduationCap, X } from "lucide-react";
import { getOrCreateAnonymousId } from "@/lib/identity";

/**
 * Pops up directly over the home page the instant "GET STARTED" is clicked
 * (see Home.tsx) - no intermediate page/navigation first. Every path out of
 * here (sign in, sign up, or guest) lands on /study, which defaults to the
 * Upload tab.
 */
export function AuthGateModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGuest = () => {
    getOrCreateAnonymousId();
    onClose();
    navigate("/study");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Welcome to NeuroLearn
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Sign in so your AI Tutor remembers what you know across visits and
          devices - or continue as a guest and keep everything on this
          device only.
        </p>

        <div className="flex flex-col gap-3">
          <SignInButton mode="modal" forceRedirectUrl="/study">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/study">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              Create Account
            </button>
          </SignUpButton>
          <button
            onClick={handleGuest}
            className="w-full px-6 py-3 text-gray-500 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
