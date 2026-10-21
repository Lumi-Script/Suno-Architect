import React from 'react';
import { Link } from '../../router/Router';

interface FooterProps {
  git?: string;
}

const DEFAULT_GIT_REPO = 'https://github.com/Lumi-Script/Suno-Architect/';

const Footer: React.FC<FooterProps> = ({ git = DEFAULT_GIT_REPO }) => {
  return (
    <footer className="w-full mt-16 border-t border-slate-800 bg-slate-950/70 backdrop-blur-md text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs sm:text-sm">
          
          {/* Col 1: Brand & Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-1.5 rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Suno <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Architect</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              The premier open-source AI music prompt engineering suite. Design structural meta-tags for Suno AI & Udio, push directly to studio workspaces, and render audio-reactive lyric videos with zero server-side data retention.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              Open source under the MIT License • Built with React, Vite & TailwindCSS.
            </div>
          </div>

          {/* Col 2: Studio Tools */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Studio Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/lyrics" className="text-slate-400 hover:text-purple-400 transition-colors">
                  Lyrics & Prompt Generator
                </Link>
              </li>
              <li>
                <Link href="/video" className="text-slate-400 hover:text-pink-400 transition-colors">
                  Audio Video Visualizer
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Track Library & Suno Sync
                </Link>
              </li>
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Documentation & Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy (Google OAuth)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  About & Data Usage
                </Link>
              </li>
              <li>
                <a 
                  href="https://developers.google.com/terms/api-services-user-data-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Google Limited Use</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-slate-500">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href={git} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium"
                >
                  <span>GitHub Repository</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Suno Architect. An independent open-source project. Not affiliated with Suno, Inc., Udio, or Google LLC.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
            <span>•</span>
            <a href={git} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              GitHub
            </a>
            <span>•</span>
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              Google Permissions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
