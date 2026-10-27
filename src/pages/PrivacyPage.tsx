import React from 'react';
import { Link } from '../router/Router';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 text-slate-300 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-semibold">Privacy Policy</span>
      </nav>

      {/* Header */}
      <header className="border-b border-slate-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Privacy & Data Protection Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400">
          Last Updated: October 2026 • Effective Immediately for all users of <strong>Suno Architect</strong> (hosted at <a href="https://sunoarchitect.lumi-script.dev" className="text-purple-400 hover:underline">https://sunoarchitect.lumi-script.dev</a>).
        </p>
      </header>

      {/* Highlights Box */}
      <div className="p-6 bg-slate-900/80 border border-purple-500/30 rounded-2xl space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          Summary of Our Minimal-Data Philosophy
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Suno Architect was designed from the ground up to respect user privacy and personal data. We operate on a <strong>zero-remote-persistence model</strong>: we do not collect personal profiles, we do not maintain a user database, and we do not sell or trade your information. All API keys and authentication tokens are kept locally in your browser.
        </p>
      </div>

      {/* Section 1: Introduction */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Introduction & Application Identity</h2>
        <p className="leading-relaxed text-sm">
          Welcome to <strong>Suno Architect</strong> ("we", "us", or "our"), accessible at <strong>https://sunoarchitect.lumi-script.dev</strong>. Suno Architect is an open-source, web-based creative suite that assists music producers, creators, and songwriters in generating structured musical prompts, lyrical compositions, and audio-reactive video visualizers for AI music engines, specifically Suno AI and Udio.
        </p>
        <p className="leading-relaxed text-sm">
          This Privacy Policy explains how we handle data when you access or use Suno Architect, particularly when you choose to connect your third-party API keys or service credentials.
        </p>
      </section>

      {/* Section 2: Gemini API Keys & Bring-Your-Own-Key */}
      <section className="space-y-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-400">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h10v10H7z" />
          </svg>
          2. Gemini API Keys & Bring-Your-Own-Key (BYOK) Architecture
        </h2>
        
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Suno Architect operates on a strict <strong>Bring-Your-Own-Key (BYOK)</strong> model. We do not use Google OAuth or request access to your Google account identity, personal emails, drive documents, or contacts.
          </p>

          <h3 className="font-semibold text-white mt-4">A. API Key Handling</h3>
          <p>
            When you enter a Google Gemini API Key or Vertex AI API Key in Suno Architect:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Client-Side Storage Only:</strong> Your API key is stored exclusively in your browser's private local storage (<code className="text-purple-300 bg-slate-950 px-1 py-0.5 rounded">localStorage.getItem('gemini_api_key')</code>). It is never sent to, logged by, or saved on any servers operated by Suno Architect.
            </li>
            <li>
              <strong>Direct End-to-End API Calls:</strong> All generative requests are dispatched directly from your browser to Google's official Gemini endpoints (<code className="text-purple-300 bg-slate-950 px-1 py-0.5 rounded">https://generativelanguage.googleapis.com</code> or Vertex AI endpoints).
            </li>
            <li>
              <strong>No Account Linkage:</strong> Suno Architect does not link your API usage to any user account or identity.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Suno Credentials */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">3. Suno AI Credentials & Proxy Security</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Users who wish to synchronize prompt outputs directly with their Suno studio account may provide a session cookie or token.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Local Browser Storage:</strong> Your Suno token is stored exclusively in your browser's private local storage (<code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">localStorage</code>).
            </li>
            <li>
              <strong>Stateless CORS Proxy:</strong> Because modern web browsers enforce strict Cross-Origin Resource Sharing (CORS) rules that prevent direct client-side requests to Suno's studio API, Suno Architect routes studio requests through a lightweight Cloudflare proxy. This proxy merely relays requests in transit and <strong>does not log, inspect, store, or cache user authentication tokens or song outputs</strong>.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 4: Data Retention & User Deletion Rights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">4. Data Retention & User Deletion Rights</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Because Suno Architect does not maintain a server-side user database, your data remains completely under your personal control.
          </p>

          <h3 className="font-semibold text-white mt-2">How to Delete Your Data:</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Remove Key in App:</strong> You can remove your saved API key at any time by opening the API key input dropdown in the header, clearing the text field, and clicking Save.
            </li>
            <li>
              <strong>Clear Browser Storage:</strong> Clearing your browser's site data, cache, and IndexedDB for <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">sunoarchitect.lumi-script.dev</code> completely removes all prompt drafts, generated history, and stored keys.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: Cookies and Tracking */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">5. Cookies & Analytics</h2>
        <p className="leading-relaxed text-sm">
          Suno Architect does not use marketing cookies, tracking pixels, or third-party behavioral profiling trackers. We do not display third-party advertisements. Local storage and IndexedDB are strictly used for technical session persistence (preserving your generation drafts, offline audio visualizer settings, and API preferences).
        </p>
      </section>

      {/* Section 6: Security */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">6. Security Measures</h2>
        <p className="leading-relaxed text-sm">
          All communications between your browser and our web application are encrypted using industry-standard Transport Layer Security (TLS/HTTPS). Because we operate without a centralized user credential database, there is no centralized database of user tokens or music prompts to be breached.
        </p>
      </section>

      {/* Section 7: Contact */}
      <section className="space-y-4 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white">7. Contact Information & Inquiries</h2>
        <p className="leading-relaxed text-sm">
          If you have any questions, concerns, or requests regarding this Privacy Policy or your data rights, please contact us or submit an issue via our official open-source GitHub repository:
        </p>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-sm">Suno Architect Open-Source Project</div>
            <div className="text-xs text-slate-400">GitHub: Lumi-Script / Suno-Architect</div>
          </div>
          <a
            href="https://github.com/Lumi-Script/Suno-Architect/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Submit Privacy Inquiry
          </a>
        </div>
      </section>
    </div>
  );
};
