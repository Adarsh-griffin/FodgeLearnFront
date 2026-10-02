import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, FileText, Mail, MapPin } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export function PrivacyPolicy() {
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
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-500">Legal & Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
            <strong>Last updated:</strong> October 2, 2026
          </p>
        </div>

        {/* Policy Body Content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-700">
          <p className="text-base text-slate-700">
            This Privacy Policy explains how <strong>LearnForge</strong> ("LearnForge", "we", "us", "our") collects, uses, stores, and shares information when you use our website, applications, and services (the "Service"). By using the Service, you agree to the practices described here.
          </p>

          <hr className="border-slate-100" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">1.</span> Information We Collect
            </h2>

            <h3 className="text-sm font-bold text-slate-800">1.1 Information you provide</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
                  <tr>
                    <th className="p-3 sm:p-4">Category</th>
                    <th className="p-3 sm:p-4">Examples</th>
                    <th className="p-3 sm:p-4">Why we collect it</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Account information</td>
                    <td className="p-3 sm:p-4">Name, email address, profile image, and auth IDs (via Clerk)</td>
                    <td className="p-3 sm:p-4">To create and secure your account and sync progress across devices</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Uploaded documents</td>
                    <td className="p-3 sm:p-4">PDFs, textbooks, or notes you upload</td>
                    <td className="p-3 sm:p-4">To generate summaries, curricula, explanations, and quizzes</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Topic inputs & chat</td>
                    <td className="p-3 sm:p-4">Topics you type, questions asked to the AI tutor</td>
                    <td className="p-3 sm:p-4">To produce relevant answers and personalized learning content</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Voice input</td>
                    <td className="p-3 sm:p-4">Audio recorded through your microphone during voice Q&A</td>
                    <td className="p-3 sm:p-4">To transcribe your speech into text for the AI tutor</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Quiz responses</td>
                    <td className="p-3 sm:p-4">Answers submitted to diagnostic quizzes</td>
                    <td className="p-3 sm:p-4">To evaluate understanding and provide actionable feedback</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-bold text-slate-800 pt-2">1.2 Information collected automatically</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Guest identifier:</strong> If you use guest mode, a randomly generated anonymous ID is stored in your browser to keep your progress.</li>
              <li><strong>Learning progress data:</strong> Quiz results, completed topics, and activity linked to your account or guest ID.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device info, and request logs created by our servers for security and troubleshooting.</li>
              <li><strong>Local storage:</strong> Used to remember your session, guest ID, and preferences.</li>
            </ul>

            <h3 className="text-sm font-bold text-slate-800 pt-2">1.3 Information from third parties</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Authentication provider (Clerk):</strong> Basic profile details authorized upon sign in.</li>
              <li><strong>Web search results (Serper):</strong> Publicly available educational links and keywords related to topics.</li>
            </ul>

            <h3 className="text-sm font-bold text-slate-800 pt-2">1.4 What we do not intentionally collect</h3>
            <p className="text-slate-600">
              We do not ask for payment card details, government IDs, or precise location. Please do not include sensitive personal information in documents or messages you submit.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">2.</span> How We Use Your Information
            </h2>
            <p className="text-slate-600">We use your information to:</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>Provide, operate, and maintain the Service, including generating AI summaries, tutor responses, speech audio, avatar explanations, and quizzes.</li>
              <li>Process voice input into text and synthesize spoken audio.</li>
              <li>Save your learning progress and personalize your experience.</li>
              <li>Retrieve relevant educational resources from the web.</li>
              <li>Authenticate users and protect against abuse, fraud, and security incidents.</li>
              <li>Monitor performance, fix bugs, and improve the Service.</li>
              <li>Communicate with you about support requests or important updates.</li>
              <li>Comply with legal obligations.</li>
            </ol>
            <p className="font-semibold text-slate-900">We do NOT sell your personal information.</p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">3.</span> How AI Processing Works
            </h2>
            <p className="text-slate-600">
              To deliver the Service, relevant parts of your content (such as document excerpts, topics, questions, and transcribed voice) are sent to third-party AI providers to generate responses. Retrieved excerpts of your documents are included in prompts so answers stay grounded in your material.
            </p>
            <p className="text-slate-600">
              AI-generated outputs may contain errors. We do not use your content to train our own models. Third-party providers process data under their own terms and privacy policies.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">4.</span> Who We Share Information With
            </h2>
            <p className="text-slate-600">We share information only with service providers that help us operate the Service:</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
                  <tr>
                    <th className="p-3 sm:p-4">Provider</th>
                    <th className="p-3 sm:p-4">Purpose</th>
                    <th className="p-3 sm:p-4">Data involved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Groq</td>
                    <td className="p-3 sm:p-4">AI language model inference & speech-to-text</td>
                    <td className="p-3 sm:p-4">Prompts, document excerpts, chat messages, voice audio</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">PageIndex</td>
                    <td className="p-3 sm:p-4">Document indexing and vectorless retrieval</td>
                    <td className="p-3 sm:p-4">Uploaded document content</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Google Cloud (TTS)</td>
                    <td className="p-3 sm:p-4">Converting summary text to spoken speech</td>
                    <td className="p-3 sm:p-4">Summary text</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">AWS (S3)</td>
                    <td className="p-3 sm:p-4">Storing and delivering audio files</td>
                    <td className="p-3 sm:p-4">Audio files</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">MongoDB / GridFS</td>
                    <td className="p-3 sm:p-4">Database and persistent storage</td>
                    <td className="p-3 sm:p-4">Documents, progress data, audio metadata</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Clerk</td>
                    <td className="p-3 sm:p-4">Authentication & session management</td>
                    <td className="p-3 sm:p-4">Account and login information</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Serper</td>
                    <td className="p-3 sm:p-4">Web search for educational reference links</td>
                    <td className="p-3 sm:p-4">Topic keywords and search queries</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-semibold text-slate-900">Render Host</td>
                    <td className="p-3 sm:p-4">Hosting the frontend and API services</td>
                    <td className="p-3 sm:p-4">Technical and web request logs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 5 & 6 & 7 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">5.</span> Retention & Security
            </h2>
            <p className="text-slate-600">
              We keep account data and learning progress while your account is active, and delete or anonymize it upon request. Uploaded documents and generated audio are kept until deleted or for up to 12 months of inactivity. Guest data is retained for up to 90 days of inactivity.
            </p>
            <p className="text-slate-600">
              We employ HTTPS encryption, access controls, environment secret management, and restricted CORS origins to safeguard your information.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 8 & 9 */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600">6.</span> Your Rights & India DPDP Act Compliance
            </h2>
            <p className="text-slate-600">
              Under India's <strong>Digital Personal Data Protection Act, 2023 (DPDP)</strong> and global privacy laws, you have the right to access, correct, or delete your data, withdraw consent, and lodge grievances.
            </p>
            <p className="text-slate-600">
              For privacy inquiries or grievance redressal, contact our Grievance Officer directly.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 10 Contact Us */}
          <section className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" /> Contact & Grievance Officer
            </h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>LearnForge</strong></p>
              <p><strong>Name / Grievance Officer:</strong> Adarsh Dhawale</p>
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
