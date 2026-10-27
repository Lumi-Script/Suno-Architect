import React from 'react';
import { Link } from '../router/Router';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 text-slate-300 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-semibold">About & Data Usage</span>
      </nav>

      {/* Header */}
      <header className="border-b border-slate-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Transparency & Open Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          About Suno Architect
        </h1>
        <p className="text-sm text-slate-400">
          Empowering musicians, producers, and AI creators with precision prompt engineering and in-browser video visualizer tools.
        </p>
      </header>

      {/* Mission */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Our Mission</h2>
        <p className="leading-relaxed text-sm">
          Artificial intelligence has revolutionized music composition, enabling anyone with a creative idea to produce full musical compositions with engines like Suno AI and Udio. However, standard AI chatbots often fail to understand musical structure, resulting in lyrics that lack rhythmic meter, missing song structure tags, and repetitive generic clichés.
        </p>
        <p className="leading-relaxed text-sm">
          <strong>Suno Architect</strong> was built to solve this problem by providing specialized musical prompt architecture, eliminating overused AI tropes, structuring cohesive multi-track albums, and enabling instant audio-reactive video rendering for social sharing.
        </p>
      </section>

      {/* Data Usage Transparency */}
      <section className="space-y-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Data Usage Transparency
        </h2>

        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            We believe that creators deserve full visibility into how their tools handle private keys, tokens, and data:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Bring-Your-Own-Key (BYOK):</strong> Suno Architect connects directly to Google Gemini using your personal API key. We do not use Google OAuth and never access your Google accounts, emails, personal contacts, Google Drive files, or user identity.
            </li>
            <li>
              <strong>Client-Side First:</strong> All your prompt drafts, generated track history, and audio visualizer presets are persisted in your personal browser storage (LocalStorage & IndexedDB). We do not run a tracking database.
            </li>
            <li>
              <strong>Zero Data Selling:</strong> We do not sell, rent, or monetize your creative prompts or audio files.
            </li>
            <li>
              <strong>CORS Proxy Security:</strong> Requests made to Suno's studio API are proxied through our Cloudflare Worker strictly to satisfy browser origin headers. Tokens are transiently forwarded and are never logged or stored.
            </li>
          </ul>
        </div>
      </section>

      {/* Open Source */}
      <section className="space-y-4 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white">Open Source & Community</h2>
        <p className="leading-relaxed text-sm">
          Suno Architect is an open-source project. You can inspect the source code, verify our security practices, and contribute features or bug fixes directly on GitHub:
        </p>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-sm">Lumi-Script / Suno-Architect</div>
            <div className="text-xs text-slate-400">Hosted on GitHub under the MIT License.</div>
          </div>
          <a
            href="https://github.com/Lumi-Script/Suno-Architect"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
};
