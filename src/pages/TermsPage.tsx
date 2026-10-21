import React from 'react';
import { Link } from '../router/Router';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 text-slate-300 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-semibold">Terms and Conditions</span>
      </nav>

      {/* Header */}
      <header className="border-b border-slate-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Official Terms of Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Terms and Conditions
        </h1>
        <p className="text-sm text-slate-400">
          Last Updated: October 2026 • Effective for all visitors and users of <strong>Suno Architect</strong> (<a href="https://sunoarchitect.lumi-script.dev" className="text-purple-400 hover:underline">https://sunoarchitect.lumi-script.dev</a>).
        </p>
      </header>

      {/* Section 1: Agreement to Terms */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
        <p className="leading-relaxed text-sm">
          By accessing or using <strong>Suno Architect</strong> (the "Application", "Service", or "we"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, you may not access or use the Service.
        </p>
      </section>

      {/* Section 2: Service Description */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Description of Service</h2>
        <p className="leading-relaxed text-sm">
          Suno Architect provides AI-assisted musical prompt formatting, rhyming lyric composition, multi-track album architecture, and in-browser audio-reactive video rendering for AI music engines, specifically Suno AI and Udio.
        </p>
        <p className="leading-relaxed text-sm">
          The Service enables users to interface with third-party generative artificial intelligence APIs (such as Google Gemini) and sync outputs to their personal Suno AI accounts.
        </p>
      </section>

      {/* Section 3: Acceptable Use Policy */}
      <section className="space-y-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-white">3. Acceptable Use & User Conduct</h2>
        <p className="leading-relaxed text-sm">
          You agree to use Suno Architect only for lawful purposes. You expressly agree not to use the Service to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
          <li>
            <strong>Infringe Intellectual Property:</strong> Generate lyrics or audio prompts that infringe upon any copyright, trademark, trade secret, or proprietary right of any third party.
          </li>
          <li>
            <strong>Unlawful or Harmful Content:</strong> Generate, transmit, or render content that is defamatory, obscene, harassing, promoting hate speech, inciting violence, or otherwise unlawful.
          </li>
          <li>
            <strong>Interfere with Services:</strong> Attempt to disrupt, overload, or reverse-engineer the application or its relay infrastructure.
          </li>
          <li>
            <strong>Violate Third-Party Policies:</strong> Circumvent or violate the Acceptable Use policies of Google LLC or Suno, Inc.
          </li>
        </ul>
      </section>

      {/* Section 4: Third-Party APIs and Disclaimers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">4. Third-Party Services & Independence</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>Independent Project:</strong> Suno Architect is an independent open-source project and is not affiliated, sponsored, endorsed, or partnered with Suno, Inc., Udio, or Google LLC. All trademarks (including "Suno", "Udio", and "Google") belong to their respective owners.
          </p>
          <p>
            <strong>Third-Party Terms Compliance:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              When you authenticate with Google, you agree to comply with the <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google Terms of Service</a> and the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google API Services User Data Policy</a>.
            </li>
            <li>
              When you connect or push prompts to Suno AI, you agree to comply with <a href="https://suno.com/terms" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Suno AI Terms of Service</a> and respect commercial licensing tiers.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: AI-Generated Content & Ownership */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">5. Ownership of AI-Generated Content</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Suno Architect claims <strong>no ownership or copyright</strong> over the lyrics, prompts, audio files, or video visualizers you create using the Application.
          </p>
          <p>
            Your ownership and commercial rights in the generated material are subject to applicable intellectual property laws and the terms of the underlying models (such as Suno AI and Google Gemini). You are solely responsible for ensuring that your songs and videos comply with applicable copyright laws before distribution.
          </p>
        </div>
      </section>

      {/* Section 6: Disclaimer of Warranties */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">6. Disclaimer of Warranties ("AS-IS")</h2>
        <p className="leading-relaxed text-sm text-slate-400">
          THE APPLICATION IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </p>
      </section>

      {/* Section 7: Limitation of Liability */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">7. Limitation of Liability</h2>
        <p className="leading-relaxed text-sm text-slate-400">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SUNO ARCHITECT, ITS MAINTAINERS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THE SERVICE.
        </p>
      </section>

      {/* Section 8: Changes and Contact */}
      <section className="space-y-4 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white">8. Modifications to Terms & Contact</h2>
        <p className="leading-relaxed text-sm">
          We reserve the right to modify these Terms at any time. Any changes will be posted directly to this page with an updated "Last Updated" date. Continued use of the Application after changes are posted constitutes your acceptance of the new Terms.
        </p>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between mt-4">
          <div>
            <div className="font-bold text-white text-sm">Have Questions Regarding Our Terms?</div>
            <div className="text-xs text-slate-400">Visit our GitHub repository or file an inquiry.</div>
          </div>
          <a
            href="https://github.com/Lumi-Script/Suno-Architect"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            GitHub Project
          </a>
        </div>
      </section>
    </div>
  );
};
