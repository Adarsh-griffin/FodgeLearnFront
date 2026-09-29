import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { Sparkles } from "lucide-react";
import { AnimatedHeroOverlay } from "@/components/AnimatedHeroOverlay";
import { AuthGateModal } from "@/components/AuthGateModal";
import { hasAnonymousId } from "@/lib/identity";
import { useEffect, useRef, useState } from "react";

const FLOW_ITEMS = [
  {
    title: "Understand complex topics in a flash",
    body: "Get straight to the point quickly with AI generated notes and summaries. Simply upload a web link, video, PDF, or voice recording to instantly get detailed, structured smart notes or a scannable summary of your material in seconds.",
    image: "/how it works image/ai summary.png",
    alt: "AI summary interface",
    imageFirst: false,
  },
  {
    title: "Get reliable and accurate answers to any question",
    body: "Enable endless AI wisdom with a simple message to the AI assistant. Ask a question about a specific content upload, or ask it to search the entire internet to give you relevant references and live links.",
    image: "/how it works image/ai assistant.png",
    alt: "AI assistant interface",
    imageFirst: true,
  },
  {
    title: "Turn Knowledge into Mastery",
    body: "To help you memorize and retain information better, auto-generate flashcards and quizzes to put your new knowledge to use. Let AI do the heavy lifting of building flashcards or quiz questions, and spend your time actually learning the material instead.",
    image: "/how it works image/questions.png",
    alt: "Questions and quizzes interface",
    imageFirst: false,
  },
  {
    title: "Organize and Manage your study materials",
    body: "Easily keep all your notes, flashcards, and quizzes structured with folders. Group your content by class, topic, or exam so everything stays in one place. With built-in organization tools, you'll spend less time searching and more time actually learning.",
    image: "/how it works image/file managment .png",
    alt: "File management interface",
    imageFirst: true,
  },
];

export function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Already identified (signed in, or already chose guest before) - skip
  // the popup entirely and go straight in.
  const isReturning = isSignedIn || hasAnonymousId();

  const handleGetStarted = () => {
    if (isReturning) {
      navigate("/study");
    } else {
      setShowAuthGate(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column - Copy */}
          <div className="flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left items-center lg:items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-cream-foreground text-xs font-semibold tracking-wide uppercase mb-5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              AI-Powered Learning
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]">
              Learn anything, <span className="gradient-brand bg-clip-text text-transparent">the smart way</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              LearnFodge provides a completely interactive and adaptive learning experience. We use AI to manage and
              customize your educational journey, ensuring that every piece of content, every quiz, and every
              challenge is perfectly matched to your current skill level and goals.
            </p>
            <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
              <button
                onClick={handleGetStarted}
                className="px-8 py-3.5 gradient-brand text-white rounded-xl font-semibold shadow-premium hover:opacity-95 active:scale-[0.98] transition-all"
              >
                {isReturning ? "Continue Learning" : "Get Started"}
              </button>
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="flex items-center justify-center order-1 lg:order-2 relative">
            <div className="w-full max-w-xs sm:max-w-md h-72 sm:h-96 relative">
              <AnimatedHeroOverlay />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI-driven learning with our intuitive platform
          </p>
        </div>

        {/* Application UI Preview */}
        <div className="bg-secondary rounded-2xl p-4 sm:p-6 mb-16 sm:mb-24">
          <img
            src="/how it works image/main.png"
            alt="LearnFodge main interface"
            className="w-full h-auto rounded-xl shadow-premium"
          />
        </div>

        {/* Feature Flow - stacks vertically below the md breakpoint; the
            connecting timeline is a desktop-only embellishment. */}
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1">
            <div className="w-full h-full border-l-2 border-dashed border-border" />
            <div
              className="absolute top-0 left-0 w-full border-l-2 border-solid border-primary transition-all duration-1000 ease-out"
              style={{
                height: `${(activeSection + 1) * 25}%`,
                boxShadow: "0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.25)",
                filter: "blur(0.5px)",
              }}
            />
          </div>

          <div className="space-y-16 md:space-y-28">
            {FLOW_ITEMS.map((item, index) => (
              <div
                key={item.title}
                ref={(el) => (sectionRefs.current[index] = el)}
                className={`relative flex flex-col ${
                  item.imageFirst ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-6 md:gap-20`}
              >
                <div
                  className={`flex-1 text-center ${
                    item.imageFirst ? "md:text-left" : "md:text-right"
                  } order-2 md:order-none`}
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-8 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{item.body}</p>
                </div>

                <div className="relative z-10 order-1 md:order-none">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-500 ${
                      activeSection >= index ? "bg-primary scale-110" : "bg-muted-foreground/40"
                    }`}
                    style={{
                      boxShadow:
                        activeSection >= index
                          ? "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)"
                          : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </div>

                <div className="flex-1 order-3 md:order-none w-full">
                  <div className="rounded-xl overflow-hidden shadow-premium">
                    <img src={item.image} alt={item.alt} className="w-full h-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="gradient-spectrum rounded-2xl px-6 sm:px-12 py-12 sm:py-16 text-center shadow-premium">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {isReturning ? "Ready to keep learning?" : "Ready to Start Learning?"}
          </h2>
          <p className="text-base sm:text-lg text-white/85 mb-8 max-w-2xl mx-auto">
            {isReturning
              ? "Pick up right where you left off."
              : "Join our platform and begin your journey to mastering new skills and knowledge."}
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-block px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {isReturning ? "Continue Learning" : "Get Started"}
          </button>
        </div>
      </section>

      <AuthGateModal isOpen={showAuthGate} onClose={() => setShowAuthGate(false)} />
    </div>
  );
}
