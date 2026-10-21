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
          <span>Google OAuth & Data Protection Compliant</span>
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
          This Privacy Policy explains how we handle data when you access or use Suno Architect, particularly when you choose to utilize our Google OAuth integration or connect your third-party service credentials.
        </p>
      </section>

      {/* Section 2: Google OAuth & Limited Use */}
      <section className="space-y-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          2. Google OAuth Integration & Limited Use Disclosure
        </h2>
        
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Suno Architect provides an optional <strong>"Sign in with Google"</strong> feature powered by Google OAuth 2.0. This allows users to authenticate and leverage Google's Generative Language (Gemini) models directly without needing to manually generate and paste an API key.
          </p>

          <h3 className="font-semibold text-white mt-4">A. OAuth Scopes Requested</h3>
          <p>
            We specifically request access exclusively to the following scope:
          </p>
          <div className="p-3 bg-slate-950 font-mono text-xs text-purple-300 rounded-lg border border-slate-800 break-all">
            https://www.googleapis.com/auth/generative-language.retriever
          </div>
          <p>
            This scope allows the application to send lyrical generation prompts to Google's Gemini models on your behalf.
          </p>

          <h3 className="font-semibold text-white mt-4">B. What Data We Access, Collect, and Store</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>No Personal Profile Data:</strong> We do <em>not</em> access, read, or store your Gmail emails, Google Drive files, Google Contacts, Google Calendar, or personal identity information.
            </li>
            <li>
              <strong>Client-Side Token Storage:</strong> The OAuth access token returned by Google is stored solely in your local browser storage (<code className="text-purple-300 bg-slate-950 px-1 py-0.5 rounded">localStorage.getItem('google_access_token')</code>). It is never sent to or saved on any backend servers operated by Suno Architect.
            </li>
            <li>
              <strong>Direct API Communication:</strong> Prompt generation queries are sent directly from your browser to Google's official Gemini endpoints (<code className="text-purple-300 bg-slate-950 px-1 py-0.5 rounded">https://generativelanguage.googleapis.com</code>).
            </li>
          </ul>

          {/* Mandatory Google Limited Use Statement */}
          <div className="mt-4 p-4 rounded-xl bg-purple-900/30 border border-purple-500/40 text-purple-100 text-sm">
            <h4 className="font-bold text-white mb-1">Google API Services User Data Policy Compliance</h4>
            <p className="leading-relaxed">
              <strong>Suno Architect's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline text-purple-300 hover:text-white font-medium">Google API Services User Data Policy</a>, including the Limited Use requirements.</strong>
            </p>
          </div>
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
        <h2 className="text-xl font-bold text-white">4. Data Retention, Deletion & Revoking Permissions</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Because Suno Architect does not maintain a server-side user database, your data remains completely under your personal control.
          </p>

          <h3 className="font-semibold text-white mt-2">How to Delete Your Data:</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Sign Out in App:</strong> You can disconnect your Google account at any time by opening the API settings in the header and clicking <strong>"Sign Out of Google"</strong>. This immediately purges the token from your browser's memory.
            </li>
            <li>
              <strong>Clear Browser Storage:</strong> Clearing your browser's site data, cache, and IndexedDB for <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">sunoarchitect.lumi-script.dev</code> completely removes all prompt drafts, generated history, and stored keys.
            </li>
            <li>
              <strong>Revoke via Google Account:</strong> You can revoke Suno Architect's access to your Google account at any time through Google's official third-party permission manager:
              <div className="mt-2">
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <span>Manage Google Third-Party Permissions</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
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
