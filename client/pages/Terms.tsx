import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Navigation />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-500">Terms of Service</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
            <strong>Last updated:</strong> October 2, 2026
          </p>
        </div>

        {/* Terms Body Content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-700">
          <p className="text-base text-slate-700">
            Welcome to <strong>LearnForge</strong> ("LearnForge", "we", "us", "our"). These Terms and Conditions ("Terms") govern your access to and use of the LearnForge website, applications, and services (together, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>

          <hr className="border-slate-100" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">1.</span> About the Service
            </h2>
            <p className="text-slate-600">
              LearnForge is an AI-powered tutoring and adaptive learning platform. It lets you upload documents (such as PDFs) or enter topics, and it generates summaries, curricula, spoken explanations through a 3D avatar, tutor chat responses, diagnostic quizzes, and links to external educational resources.
            </p>
            <p className="text-slate-600">
              The Service is provided using third-party technologies, including AI language models, speech-to-text and text-to-speech providers, cloud storage, authentication, and web search services.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">2.</span> Eligibility and Minors
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>You must be at least <strong>13 years old</strong> to use the Service on your own.</li>
              <li>If you are under the age of 18 (or the age of majority where you live), you may use the Service only with the consent and supervision of a parent or legal guardian, who agrees to these Terms on your behalf.</li>
              <li>By using the Service, you confirm that you meet these requirements.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">3.</span> Accounts and Guest Mode
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Registered accounts:</strong> You may sign in through our authentication provider (Clerk). You are responsible for keeping your login credentials secure and for all activity under your account.</li>
              <li><strong>Guest mode:</strong> You may use the Service without an account. Guest data is linked to an anonymous identifier stored in your browser. If you clear your browser data or switch devices, your guest progress may be lost and we may be unable to recover it.</li>
              <li>You agree to provide accurate information and to notify us promptly of any unauthorized use of your account.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">4.</span> Acceptable Use
            </h2>
            <p className="text-slate-600">You agree <strong>NOT</strong> to:</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>Upload content that is unlawful, infringing, defamatory, obscene, hateful, or harmful.</li>
              <li>Upload documents you do not have the right to use, including copyrighted material you lack permission to process.</li>
              <li>Upload sensitive personal information about yourself or others (such as government IDs, financial data, or health records) in documents.</li>
              <li>Attempt to reverse engineer, scrape, overload, disrupt, or gain unauthorized access to the Service, its servers, or its APIs.</li>
              <li>Bypass rate limits, usage limits, or security measures.</li>
              <li>Use the Service to generate content intended to harass, deceive, or cheat (for example, to violate academic integrity policies).</li>
              <li>Use automated tools, bots, or scripts to access the Service without our written permission.</li>
              <li>Use the Service in violation of any applicable law or regulation.</li>
            </ol>
          </section>

          <hr className="border-slate-100" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">5.</span> Your Content & Rights
            </h2>
            <p className="text-slate-600">
              <strong>Ownership:</strong> You retain ownership of the documents, topics, questions, and voice inputs you submit ("User Content").
            </p>
            <p className="text-slate-600">
              <strong>License to us:</strong> You grant us a limited, non-exclusive, worldwide, royalty-free license to store, process, transmit, and display your User Content solely to operate, maintain, and improve the Service for you.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 6 */}
          <section className="space-y-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5">
            <h2 className="text-lg sm:text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-amber-700">6.</span> AI-Generated Content Disclaimer
            </h2>
            <p className="text-amber-800 text-xs sm:text-sm">
              The Service uses artificial intelligence, including large language models and retrieval-augmented generation. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-amber-800 text-xs sm:text-sm">
              <li>AI-generated summaries, explanations, answers, quizzes, evaluations, and feedback <strong>may be inaccurate, incomplete, outdated, or misleading</strong>.</li>
              <li>The Service is an <strong>educational aid and not a substitute</strong> for teachers, textbooks, or professional advice.</li>
              <li>You should verify important information against authoritative sources before relying on it.</li>
              <li>Quiz scores and evaluations are for self-assessment only and are <strong>not official grades or certifications</strong>.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* Section 7 - 12 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">7.</span> Disclaimers & Limitation of Liability
            </h2>
            <p className="text-slate-600 uppercase text-xs font-semibold tracking-wider text-slate-500">
              Service Provided "As Is"
            </p>
            <p className="text-slate-600">
              TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND. LEARNFORGE AND ITS TEAM MEMBERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM WILL NOT EXCEED INR 1,000 OR THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 13 Governing Law */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">8.</span> Governing Law & Jurisdiction
            </h2>
            <p className="text-slate-600">
              These Terms are governed by the laws of <strong>India</strong>. Subject to applicable law, the courts located in <strong>Pune, Maharashtra, India</strong> will have exclusive jurisdiction over any disputes arising from these Terms or the Service.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 14 Contact Us */}
          <section className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" /> Contact Information
            </h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>LearnForge</strong></p>
              <p><strong>Contact Person:</strong> Adarsh Dhawale</p>
              <p><strong>Email:</strong> <a href="mailto:adarshdhawale267@gmail.com" className="text-indigo-600 font-semibold hover:underline">adarshdhawale267@gmail.com</a></p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span><strong>Address:</strong> Pune, Shivajinagar, Maharashtra, India</span>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
