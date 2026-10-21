import React, { useState } from 'react';
import { Link } from '../router/Router';

interface HomePageProps {
  historyCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({ historyCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<'prompting' | 'tags' | 'video' | 'sync'>('prompting');

  return (
    <div className="flex flex-col gap-16 md:gap-24 text-slate-200">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 md:py-16 text-center max-w-5xl mx-auto flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[400px] bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl pointer-events-none rounded-full -z-10" />

        {/* Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Suno v6 & Google Gemini 4 / 3.8-Flash Ready</span>
        </div>

        {/* Primary H1 Heading for SEO */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Architect Production-Ready <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
            AI Music Prompts & Synced Videos
          </span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mb-8 leading-relaxed">
          The all-in-one studio suite for AI music producers. Craft cohesive multi-track albums with structural meta-tags for <strong>Suno AI</strong> and <strong>Udio</strong>, push directly to Suno with one click, and render audio-reactive lyric videos ready for YouTube, TikTok, and Instagram Reels.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/lyrics"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Launch Lyrics Generator</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <Link
            href="/video"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white font-bold text-base border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-400">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span>Create Video Visualizer</span>
          </Link>

          <Link
            href="/history"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-400">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Track Library</span>
            {historyCount > 0 && (
              <span className="bg-purple-600/80 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {historyCount}
              </span>
            )}
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 w-full max-w-4xl pt-8 border-t border-slate-800/80 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800">
            <span className="text-purple-400 font-bold">✓</span> Free & Open Source
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800">
            <span className="text-pink-400 font-bold">✓</span> Zero Server Tracking
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800">
            <span className="text-blue-400 font-bold">✓</span> Direct Suno API Sync
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span> MP4 Video Renderer
          </div>
        </div>
      </section>

      {/* Interactive Feature Architecture Showcase */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">Interactive Studio Preview</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Engineered Specifically for AI Song Generation
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            General purpose AI chatbots produce generic prose. Suno Architect writes rhythmically metered lyrics structured with production cues that modern diffusion audio models actually understand.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('prompting')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'prompting'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Multi-Track Prompting
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'tags'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Meta-Tag Directives
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Audio-Reactive Video
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'sync'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Studio Cloud Sync
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 font-mono text-xs sm:text-sm text-slate-300">
          {activeTab === 'prompting' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="text-purple-400 font-bold">Track 1 of 4 • Concept Album Generation</span>
                <span className="text-emerald-400">Gemini 3.8 Flash • High Accuracy</span>
              </div>
              <p className="text-purple-300 font-bold">[Style: 90s Alternative Grunge, dual distortion guitars, driving live bass, raspy emotional female vocal, 134 BPM, Key: D minor]</p>
              <p className="text-slate-500">[Exclude Styles: pop, synth, EDM, auto-tune, clean guitar, bright mix]</p>
              <div className="pl-4 border-l-2 border-purple-500/40 space-y-2 text-slate-200">
                <p className="text-pink-400 font-bold">[Intro: Gritty feedback swell, brooding bassline, slow drum build]</p>
                <p>[Verse 1: Palm-muted guitar, intimate vocal delivery]</p>
                <p>Fluorescent flickers on a cracked floorboard,</p>
                <p>Trading whispered secrets we could never afford.</p>
                <p>The city breath smells like diesel and frost,</p>
                <p>Counting every dollar and the hours we lost.</p>
                <p className="text-pink-400 font-bold">[Pre-Chorus: Tom groove accelerates, guitar opens into overdrive]</p>
                <p>Feel the tremor in the telephone line—</p>
                <p>You say you're ready, but you're out of time.</p>
                <p className="text-pink-400 font-bold">[Chorus: Explosive wall of fuzz guitars, soaring vocal hook, double snare hits]</p>
                <p>We are the architects of quiet decay,</p>
                <p>Burning down the blueprint at the break of day!</p>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="text-purple-400 font-bold">Structural Metatag Cheatsheet & Control Sliders</span>
                <span className="text-blue-400">Suno v6 Compatible</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-pink-400 font-bold">[Instrumental Solo] / [Guitar Break]</span>
                  <p className="text-slate-400 text-xs mt-1">Forces Suno to pause vocal generation and focus synthesis on melodic lead solos without hallucinating lyrics.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-purple-400 font-bold">[Drop: Heavy sub-bass, 808 punch]</span>
                  <p className="text-slate-400 text-xs mt-1">Directs the audio diffusion model to create tension and a sudden high-impact dynamic release.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-indigo-400 font-bold">Weirdness (Slider: 65%)</span>
                  <p className="text-slate-400 text-xs mt-1">Controls temperature & unexpected melodic pivots. Tuned for unique harmonic progressions.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold">Style Influence (Slider: 80%)</span>
                  <p className="text-slate-400 text-xs mt-1">Enforces strict adherence to genre directives, eliminating out-of-genre instrumentation drift.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="text-purple-400 font-bold">In-Browser Video Renderer Engine</span>
                <span className="text-pink-400">WASM FFmpeg • Word-Level LRC Sync</span>
              </div>
              <p className="text-slate-300">
                Export social-media ready videos directly inside your browser without uploading audio to external third-party render servers.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-white font-bold block mb-1">16:9 Widescreen</span>
                  <span className="text-[11px] text-slate-400">YouTube, Desktop & TV</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-purple-500/50 bg-purple-500/10">
                  <span className="text-white font-bold block mb-1">9:16 Vertical</span>
                  <span className="text-[11px] text-purple-300">TikTok, Reels & Shorts</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-white font-bold block mb-1">1:1 Square</span>
                  <span className="text-[11px] text-slate-400">Instagram Feed & Square</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="text-purple-400 font-bold">Direct Suno Studio Integration</span>
                <span className="text-emerald-400">Zero Copy-Paste Workflow</span>
              </div>
              <p className="text-slate-300">
                Connect your Suno account session to instantly push generated prompts, fetch your credit balance, retrieve high-res album artwork, download aligned LRC timestamps, and synchronize stems into your library.
              </p>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-200 text-xs">
                🔒 Privacy Guarantee: Suno cookies and tokens are stored solely in your browser's IndexedDB / LocalStorage. Zero user credentials or audio files are logged on our infrastructure.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4 Core Pillars / Feature Sections for Google Indexing */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">
            Everything You Need to Master AI Music Creation
          </h2>
          <p className="text-slate-400 text-base mt-2">
            A comprehensive suite of tools built for speed, creative control, and seamless production pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Prompt Engine */}
          <article className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Lyrics & Prompt Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Generate entire multi-track albums (up to 7 tracks) with strict rhyme structures, narrative flow, BPM, musical keys, and custom lyrical constraint filters that banish generic AI songwriting clichés.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                <li>• Multi-track thematic continuity</li>
                <li>• Automatic BPM & harmonic key detection</li>
                <li>• Cliché phrase & weak rhyme elimination</li>
              </ul>
            </div>
            <Link
              href="/lyrics"
              className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-bold text-sm"
            >
              <span>Open Lyrics Generator</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </article>

          {/* Card 2: Video Visualizer */}
          <article className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Audio Visualizer & Video Maker</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Render polished audio-reactive visualizers with word-by-word synced karaoke lyrics directly in your browser. Choose from dynamic wave forms, frequency spectrum bars, circular rings, and custom fonts.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                <li>• Real-time LRC & SRT word alignment</li>
                <li>• 9:16 vertical export for TikTok & Shorts</li>
                <li>• Client-side high-speed FFmpeg rendering</li>
              </ul>
            </div>
            <Link
              href="/video"
              className="inline-flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-bold text-sm"
            >
              <span>Open Video Generator</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </article>

          {/* Card 3: Library & Sync */}
          <article className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track Library & Suno Sync</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Sync with your official Suno account to pull your complete generation history, inspect audio waveforms, edit track titles and metadata, export your library to JSON, and keep your drafts organized.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                <li>• Offline IndexedDB persistence</li>
                <li>• Complete prompt & lyric history backup</li>
                <li>• Real-time Suno credit balance display</li>
              </ul>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold text-sm"
            >
              <span>View History & Library</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </article>
        </div>
      </section>

      {/* SEO Deep Dive: Comprehensive Suno Meta-Tags & Prompting Guide */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Educational Guide & Reference</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            The Definitive Guide to Suno AI & Udio Prompt Engineering
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Understanding how generative audio engines interpret bracketed tags and prompt syntax is the key to creating professional, radio-ready AI tracks without muddy vocals or song structure collapse.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
          {/* Section A: Structural Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              1. Song Structure & Transition Meta-Tags
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Diffusion models read bracketed cues like musical markers on a lead sheet. Using these tags gives the AI explicit boundaries for vocal intensity, rhythm section density, and melodic themes:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-purple-300">[Intro: Soft piano, warm analog vinyl crackle]</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Establishes the sonic atmosphere and prevents vocals from rushing in before the groove is locked.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-purple-300">[Pre-Chorus: Rhythmic build, snare roll, vocal rise]</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Builds musical tension to make the ensuing chorus hit with maximum dynamic impact.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-purple-300">[Guitar Solo: Fast melodic pentatonic run, heavy wah]</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Forces the generative voice model to step back while instrumental models synthesize authentic solo lines.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-purple-300">[Outro: Fading percussion, lingering reverb tail, end]</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Prevents awkward abrupt endings or sudden second song hallucination loops.</p>
              </div>
            </div>
          </div>

          {/* Section B: Production Directives */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              2. Production, BPM, Key & Negative Tags
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Suno v6 responds vigorously to specific genre combinations, studio production terminology, and negative prompt filtering:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-pink-300">Tempo & Key Signatures (e.g. 128 BPM, Key of F# Minor)</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Providing explicit tempo and key guides Suno to generate tracks compatible with real DJ sets, remixes, and live stems.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-pink-300">Vocal Timbre Descriptors (e.g. Soulful raspy tenor, intimate breathy female)</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Pins down the exact vocal identity and prevents gender-switching or artificial vocoder artifacts.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-pink-300">Negative Prompt Filtering (Exclude Styles)</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Active exclusion tags (such as "muffled, low quality, muddy reverb, synth pop") cleanse the diffusion latent space.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <strong className="text-pink-300">Cliché Elimination Engine</strong>
                <p className="text-slate-400 mt-1 font-sans text-xs">Suno Architect automatically rejects tired AI tropes like "echoes in the dark", "whispering shadows", and predictable AABB rhymes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Workflow Section */}
      <section className="text-center max-w-4xl mx-auto space-y-10">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            From Musical Concept to Social-Ready Video in 4 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              1
            </div>
            <h4 className="text-base font-bold text-white mb-2">Input Your Concept</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Describe your song theme, reference artists, emotional arc, and desired genres, or upload an audio/lyric reference file.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              2
            </div>
            <h4 className="text-base font-bold text-white mb-2">Generate Album Prompts</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Gemini LLMs build up to 7 structurally sound, metered tracks complete with BPM, key, vocal gender, and negative tags.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              3
            </div>
            <h4 className="text-base font-bold text-white mb-2">Push Directly to Suno</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sync generated tracks straight to Suno studio with one button, automatically updating titles, metadata, and clean lyrics.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              4
            </div>
            <h4 className="text-base font-bold text-white mb-2">Render Synced Video</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Load your audio stems, sync LRC timestamps, and render 9:16 vertical videos for TikTok & YouTube Shorts right in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Suno Architect vs Standard Chatbots */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Why Suno Architect Outperforms Standard AI Chatbots
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Feature</th>
                <th className="py-3 px-4 font-semibold text-purple-400">Suno Architect</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Generic ChatGPT / Claude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 px-4 font-medium text-white">Suno & Udio Meta-Tag Syntax</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">✓ Exact bracketed syntax & control tags</td>
                <td className="py-3 px-4 text-rose-400">✗ Often hallucinates prose or generic headings</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Direct Suno Studio API Cloud Push</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">✓ 1-Click push & metadata sync</td>
                <td className="py-3 px-4 text-rose-400">✗ Manual copy-paste required for every track</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Multi-Track Cohesive Album Mode</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">✓ Generates up to 7 unified thematic tracks</td>
                <td className="py-3 px-4 text-rose-400">✗ Generates one disconnected track at a time</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Synced Audio Video Visualizer</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">✓ In-browser LRC/SRT video rendering</td>
                <td className="py-3 px-4 text-rose-400">✗ Text-only, zero audio or video capabilities</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Anti-Cliché Songwriting Engine</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">✓ Filters overused AI phrases & weak rhymes</td>
                <td className="py-3 px-4 text-rose-400">✗ Constantly repeats clichés (shadows, whispers, neon)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Data Privacy & Local Storage</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">✓ 100% Client-side, zero data retention</td>
                <td className="py-3 px-4 text-amber-400">⚠️ Prompts may be logged for model retraining</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SEO FAQ Section with JSON-LD Schema Matching */}
      <section className="space-y-6 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Common questions regarding AI prompt architecture, Suno integration, and video export.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex items-center justify-between text-base font-bold text-white group-open:text-purple-400 transition-colors">
              <span>What is Suno Architect and how does it help AI music creators?</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Suno Architect is a dedicated creative workspace designed to bridge the gap between creative concepts and AI music engines like Suno and Udio. It uses specialized system prompts and Google Gemini models to construct rhythmically sound, rhyme-metered lyrics containing official structural meta-tags, BPM recommendations, musical keys, and style influence parameters. It also features a built-in video generator that turns your rendered tracks into audio-reactive videos with synchronized lyric subtitles.
            </p>
          </details>

          <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex items-center justify-between text-base font-bold text-white group-open:text-purple-400 transition-colors">
              <span>Is Suno Architect free to use?</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Yes, Suno Architect is 100% free and open-source. You can bring your own Google Gemini API key or sign in with Google OAuth to access Google's free generative language tier. You do not pay any subscription fees to Suno Architect.
            </p>
          </details>

          <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex items-center justify-between text-base font-bold text-white group-open:text-purple-400 transition-colors">
              <span>How does Google Sign-In / OAuth work in this application?</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              When you click "Sign in with Google", Suno Architect requests permission only for the generative language API scope. We use this authorization solely to make prompt requests to Google's Gemini models directly from your client browser. Your personal account details, emails, and profile files are never accessed or stored. You can disconnect at any time in the app or via Google Account Permissions.
            </p>
          </details>

          <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex items-center justify-between text-base font-bold text-white group-open:text-purple-400 transition-colors">
              <span>Does Suno Architect store my Suno session cookie or private credentials?</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              No. Your Suno cookie is saved exclusively inside your browser's private localStorage. When you send prompts to Suno or sync clips, requests transit our lightweight Cloudflare proxy solely to satisfy browser CORS requirements. Tokens are neither logged nor retained on any remote database.
            </p>
          </details>

          <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex items-center justify-between text-base font-bold text-white group-open:text-purple-400 transition-colors">
              <span>Can I render vertical videos for TikTok, Instagram Reels, and YouTube Shorts?</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Yes! The built-in Video Generator supports 9:16 vertical resolution (1080x1920) optimized for vertical mobile video feeds, 16:9 widescreen (1920x1080) for YouTube, and 1:1 square (1080x1080) for Instagram posts. It renders word-by-word highlighted subtitles using LRC and SRT timestamps.
            </p>
          </details>

          <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex items-center justify-between text-base font-bold text-white group-open:text-purple-400 transition-colors">
              <span>Which Suno models and engines are supported?</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Suno Architect supports all modern Suno engines, including Suno v6, v6-wild and v6-mini, as well as custom models.
            </p>
          </details>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-slate-900 border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Architect Your Next Hit Song?
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Turn your spark of inspiration into a cohesive multi-track album with precision meta-tags, direct Suno sync, and stunning audio-reactive lyric videos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/lyrics"
              className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all shadow-lg shadow-white/10"
            >
              Start Generating Prompts
            </Link>
            <Link
              href="/video"
              className="px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-600/30"
            >
              Create Video Visualizer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
