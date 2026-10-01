import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { AnimatedHeroOverlay } from "@/components/AnimatedHeroOverlay";
import { useReturningStatus } from "@/lib/useReturningStatus";
import { useAuthGate } from "@/lib/AuthGateContext";
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
  const { openAuthGate } = useAuthGate();
  const navigate = useNavigate();

  // Backed by actual saved AI Tutor progress on the server - see
  // useReturningStatus for why "is this browser identified" alone isn't
  // enough (deleting student_profiles in Mongo should send a student back
  // through the auth gate, not silently skip it with nothing to resume).
  const isReturning = useReturningStatus();

  const handleGetStarted = () => {
    if (isReturning) {
      navigate("/study");
    } else {
      openAuthGate();
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
              LearnForge provides a completely interactive and adaptive learning experience. We use AI to manage and
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
            alt="LearnForge main interface"
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

      {/* Ready to keep learning? CTA Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div 
          className="relative rounded-[2rem] border border-[#E0E7FF]/80 p-8 sm:p-12 lg:p-16 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFFFFF 0%, #F7F8FF 45%, #EEF3FF 100%)",
            boxShadow: "0 20px 50px rgba(91, 75, 255, 0.08)"
          }}
        >
          {/* Soft Purple Ambient Glow Accent */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#E6E0FF]/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-16">
            {/* Left Content Column */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
                Ready to keep <span className="text-[#5146E5]">learning?</span>
              </h2>
              <p className="text-base sm:text-xl text-[#52617A] font-medium max-w-xl mx-auto md:mx-0">
                {isReturning
                  ? "Pick up right where you left off."
                  : "Join our platform and begin your journey to mastering new skills and knowledge."}
              </p>
              <div className="pt-4">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#5146E5] to-[#3267F5] hover:opacity-95 text-white font-bold text-base rounded-full shadow-lg shadow-[#5146E5]/25 hover:shadow-[#5146E5]/35 hover:scale-[1.03] active:scale-95 transition-all mx-auto md:mx-0 cursor-pointer"
                >
                  <span>{isReturning ? "Continue Learning" : "Get Started"}</span>
                  <span className="text-lg leading-none">→</span>
                </button>
              </div>
            </div>

            {/* Right Graphic Illustration Column with Soft Radial Glow */}
            <div className="relative w-64 sm:w-80 md:w-[400px] flex-shrink-0 flex items-center justify-center md:justify-end">
              {/* Soft Blue-Lavender Radial Glow Behind Illustration */}
              <div 
                className="absolute inset-0 rounded-full blur-3xl pointer-events-none opacity-80"
                style={{
                  background: "radial-gradient(circle at center, #DDE7FF 0%, #F1F5FF 50%, transparent 75%)"
                }}
              />
              <img
                src="/learning_footer_sticker.png"
                alt="3D Graduation Cap and Textbooks Illustration"
                className="relative z-10 w-full h-auto object-contain max-h-80 hover:scale-105 transition-transform duration-500 pointer-events-none drop-shadow-[0_15px_30px_rgba(81,70,229,0.12)]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
