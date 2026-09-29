import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * There was no error boundary anywhere in the app - a single uncaught
 * render exception in any one component (confirmed cause: LessonView
 * calling .filter() on a field the backend hadn't started returning yet)
 * unmounted the ENTIRE React tree, leaving a blank white page with no way
 * back except a hard refresh. This catches that class of bug at the top
 * level and shows a recoverable screen instead.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Caught a render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background">
          <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            {this.state.error.message || "An unexpected error occurred while rendering this page."}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 gradient-brand text-white rounded-xl font-semibold hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
