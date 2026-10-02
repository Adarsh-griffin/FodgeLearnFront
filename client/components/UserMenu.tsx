import { useEffect, useRef, useState } from "react";
import { useAuth, useUser, useClerk } from "@clerk/react";
import { LogOut, Trash2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { getTutorAuthHeaders } from "@/lib/identity";
import { useToast } from "@/lib/ToastContext";

/**
 * The avatar circle in the top header - previously a static "A" with no
 * click behavior at all, so a signed-in user had no way to log out, and
 * no one (signed-in or guest) had a way to clear their saved AI Tutor
 * progress short of asking a developer to delete it from MongoDB by hand.
 */
export function UserMenu() {
  const { showToast } = useToast();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isLoaded) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  const displayName = isSignedIn
    ? user?.primaryEmailAddress?.emailAddress || user?.fullName || "Signed in"
    : "Guest";
  const initial = isSignedIn
    ? (user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "U").toUpperCase()
    : "G";

  const handleLogOut = async () => {
    setIsOpen(false);
    await signOut();
    window.location.href = "/";
  };

  const handleDeleteProfile = async () => {
    if (
      !window.confirm(
        "Delete all your AI Tutor progress (diagnostic results, study plans, lesson history) for every document? This can't be undone.",
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const headers = await getTutorAuthHeaders(!!isSignedIn, getToken);
      await apiService.deleteTutorProfile(headers);
      showToast("Your AI Tutor progress has been deleted.", "success");
      // Brief delay so the toast is actually visible before the reload
      // wipes the DOM - window.alert() used to block here, which had the
      // same effect by accident; this is the non-blocking equivalent.
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete profile.", "error");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center hover:opacity-90 transition-opacity"
        title={displayName}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
            <p className="text-[11px] text-slate-400">
              {isSignedIn ? "Signed in" : "Progress saved on this device only"}
            </p>
          </div>

          {isSignedIn && (
            <button
              onClick={handleLogOut}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          )}

          <button
            onClick={handleDeleteProfile}
            disabled={isDeleting}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? "Deleting..." : "Delete Profile"}
          </button>
        </div>
      )}
    </div>
  );
}
