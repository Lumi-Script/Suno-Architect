# Suno Architect

<p align="center">
  <strong>An advanced AI music architect and lyric visualizer studio for Suno AI.</strong>
</p>

<p align="center">
  <a href="https://github.com/Lumi-Script/Suno-Architect/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb.svg?logo=react" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6.0-3178c6.svg?logo=typescript" alt="TypeScript"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8.1-646cff.svg?logo=vite" alt="Vite"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-4.3-38bdf8.svg?logo=tailwindcss" alt="Tailwind CSS"></a>
  <a href="https://workers.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare-Workers%20%26%20Pages-f38020.svg?logo=cloudflare" alt="Cloudflare"></a>
</p>

- Various free and paid Gemini models available
- Gemini Flash 3, 3.1-lite, 3.5-lite, 3.5 and 3.6 have generous free limits.
  - Flash-lite models have 20/min and 500/day limits
  - Non-lite Flash models have 5/min and 20/day limits
  - [Full Rate Limits](https://aistudio.google.com/rate-limit) - _Paid is required for Pro models._
  - Create a key in [aistudio](https://aistudio.google.com/api-keys) with billing disabled for free flash model access.

---

**Suno Architect** is a full-featured suite built for music producers, AI creators, and prompt engineers. It leverages the latest **Google Gemini** models to architect structured song concepts, albums, production metadata, and rich lyrics with meta-tags. It also connects directly to Suno to trigger song generations, sync your library, convert timed lyrics into **LRC/SRT** subtitle files, and render fast, synchronized **lyric videos** (MP4 & WebM) right inside your browser.

---

## 📑 Table of Contents

- [Features](#-features)
  - [1. AI Album & Prompt Architect](#1-ai-album--prompt-architect)
  - [2. Direct Suno Studio Sync](#2-direct-suno-studio-sync)
  - [3. Library & History Management](#3-library--history-management)
  - [4. LRC & SRT Subtitle Generation](#4-lrc--srt-subtitle-generation)
  - [5. Synchronized Lyric Video Visualizer](#5-synchronized-lyric-video-visualizer)
- [Supported Models & Providers](#-supported-models--providers)
  - [Google Gemini & Vertex AI](#google-gemini--vertex-ai)
  - [Suno AI Models](#suno-ai-models)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
  - [Building for Production](#building-for-production)
- [Deployment](#-deployment)
  - [Deploy to Cloudflare Workers / Pages](#deploy-to-cloudflare-workers--pages)
  - [Why the Cloudflare Worker is Required](#why-the-cloudflare-worker-is-required)
- [Privacy & Security](#-privacy--security)
- [Credits & Acknowledgements](#-credits--acknowledgements)
- [License](#-license)

---

## ✨ Features

### 1. AI Album & Prompt Architect
- **Cohesive Album & Single Generation**: Generate single tracks or full conceptual albums (1 to 7 tracks) with thematic consistency across track titles, musical genres, and narratives.
- **Precision Output Blocks**:
  - **Song Title**: Contextual and evocative naming.
  - **Style Prompt**: Targeted, comma-separated musical genre and instrumentation tags formatted specifically for Suno.
  - **Negative Prompts (`Exclude Style`)**: Prevents unwanted instruments, textures, or tropes.
  - **Advanced Controls**: Recommends Suno slider weights: Weirdness % (0–100%), Style Influence % (0–100%), and Vocal Gender (`Male`, `Female`, or `None`).
  - **Tagged Lyrics**: Complete song structures with meta-tags (`[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Solo Section]`, `[Drop]`, `[Outro]`).
  - **Clean Lyrics**: Lyrics without structural brackets, ready for external distribution, streaming metadata, or display.
- **Multimodal Reference Inputs**:
  - **Audio Files** (`mp3`, `wav`, etc.): Ingests real audio references to analyze tempo, instrumentation, key, and production texture.
  - **Text & PDF Lore**: Upload conceptual briefs, worldbuilding documentation, or poem excerpts to influence theme and lyrical depth.
  - **Images**: Visual inputs to shape the mood, aesthetic, and lyrical vibe.
- **Configurable Prompt Architectures**:
  - Built-in prompt methods: **V1**, **V2**, **V3**, and **V4**.
  - Dynamic Knowledge Base: Customize genre tags, structural tags, vocal styles, effects, and music theory tokens.
  - **Anti-Cliché Constraints**: Active filters forbidding overused lyrical tropes, clichéd adjectives, tired rhyming pairs, and robotic metaphors.

### 2. Direct Suno Studio Sync *(Optional)*
- **Direct Generation Dispatch**: Fire generation requests straight to Suno without manual copy-pasting.
- **Suno Parameter Controls**: Supports model selection, weirdness slider, style influence slider, persona IDs, and audio weighting.
- **Automatic Metadata Optimization**: Automatically updates Suno track metadata to strip bracketed meta-tags from the final displayed lyrics upon generation.
- **Real-Time Credit Counter**: Displays your remaining Suno account credits directly in the header navigation.

### 3. Library & History Management
- **Full History Sync**: Fetch and sync your Suno generations in customizable batches (50, 100, 200, or All items) with built-in rate-limit backoff handling.
- **Instant Search & Import**: Search through your generations by title/prompt text, or paste any Suno track UUID to immediately import its details.
- **Comprehensive Song Inspector**:
  - View high-resolution artwork, musical key, average BPM, min/max tempo, model name, tags, and timestamps.
  - One-click copy for prompts, clean lyrics, tags, and IDs.
  - Direct downloads for MP3 audio, MP4 video, and album covers.
- **Browser-Side Persistence**: Saves your library locally in **IndexedDB** for fast loading and offline access.

### 4. LRC & SRT Subtitle Generation
- Pulls word-level alignment JSON from Suno's timing API (`aligned_words` and `aligned_lyrics`).
- Aligns words and syllable groupings line-by-line against original prompt lyrics.
- One-click export to standard **LRC** files (for music players and streaming platforms) or **SRT** files (for video editors like Premiere, DaVinci Resolve, or CapCut).

### 5. Synchronized Lyric Video Visualizer
- **High-Speed In-Browser Offline Rendering**:
  - Powered by `@ffmpeg/ffmpeg` and `mediabunny`.
  - Runs inside an optimized Web Worker (`offlineRender.worker.ts`) rendering at up to **~10x real-time speed**.
  - Low-RAM streaming mode supported in Chromium-based browsers (Chrome, Edge).
  - Exports directly to **MP4** or **WebM** with selectable audio bitrates and frame rates (30 FPS or 60 FPS).
  - Built-in FFMPEG color-range filter correction (`ffmpegColorFix.ts`) ensuring accurate video contrast and zero color shifts.
- **Visual Modes & Aspect Ratios**:
  - **Cover Art Mode**: Animated typographic layout over album artwork or uploaded background media.
  - **QT6 Spectrum Visualizer**: Audio frequency spectrum visualizer with 4 selectable styles: `wave`, `bars`, `circle`, and `circular-wave`.
  - **Multi-Format Aspect Ratios**: Landscape (`16:9`), Vertical (`9:16` for TikTok, YouTube Shorts, Instagram Reels), and Square (`1:1`).
- **Lyric Highlighting & Typography**:
  - Word-by-word and syllable-level dynamic karaoke highlighting.
  - AI Smart Line Grouping based on prompt or powered by Gemini.
  - Custom font family selector with standard web fonts and expressive typefaces.
- **AI-Powered Color Palettes**:
  - Automatically analyzes cover art using Gemini to recommend complementary font choices, active highlight colors, and inactive contrast colors.
  - Dynamic Color Events: Define timed color palette changes at specific timestamps in the song.

---

## 🤖 Supported Models & Providers

### Google Gemini & Vertex AI
Configure your credentials in the header via the **API Key** dialog:
- **Available Models**:
  - `gemini-4-argon`
  - `gemini-3.8-flash` *(Default recommendation: extremely fast with high free quota)*
  - `gemini-3.6-flash`
  - `gemini-3.5-flash-lite`
  - `gemini-3.1-flash-lite`
  - `gemini-3.1-pro-preview`
- **Supported Auth Modes**:
  1. **Google AI Studio Key**: Standard API key from [Google AI Studio](https://aistudio.google.com/api-keys).
  2. **Vertex AI API Key**: Built-in support for Vertex AI keys with automatic project ID discovery and global endpoint fallback routing.
  3. **Sign in with Google (OAuth)**: Client-side OAuth flow for instant access without generating manual keys.
  4. **Google AI Studio Embedded**: Auto-detects session keys when running inside AI Studio workspaces.

### Suno AI Models
- `V6` (`chirp-hawk`)
- `V6-wild` (`chirp-hawk-wild`)
- `V6 Mini` (`chirp-goose`)
- Custom models (entered manually)

---

## 🌐 Deployment

### Deploy to Cloudflare Workers / Pages

Suno Architect is pre-configured for full-stack deployment on Cloudflare using Cloudflare Workers and static asset binding.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Lumi-Script/suno-architect/)

#### Manual Cloudflare Deployment
1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Test locally with Wrangler:
   ```bash
   npm run dev:worker
   ```
4. Deploy to your Cloudflare account:
   ```bash
   wrangler deploy
   ```

### Why the Cloudflare Worker is Required
Suno's studio endpoints (`studio-api.prod.suno.com`) enforce strict CORS policies for browser requests. The included worker (`functions/_worker.ts`) serves as an edge proxy:
- Handles preflight `OPTIONS` requests.
- Forwards API calls to Suno while applying the necessary `Origin` (`https://suno.com`) and `Referer` (`https://suno.com/`) headers.
- Attaches permissive `Access-Control-Allow-*` headers so your browser client can communicate cleanly with Suno.

---

## 🚀 Getting Started (Development)
### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm`, `pnpm`, or `yarn`
- A [Google Gemini API Key](https://aistudio.google.com/api-keys) (free tier available)
- *(Optional)* Suno session cookie / JWT token if using direct Suno generation or history sync features

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Lumi-Script/Suno-Architect.git
cd Suno-Architect
npm install
```

### Local Development

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]
> During local development, Vite proxies Suno API calls (`/api/*` -> `https://studio-api.prod.suno.com`) to bypass CORS restrictions.

### Building for Production

Compile TypeScript and build the static assets with Vite:

```bash
npm run build
```

The output will be placed in the `dist/` directory.

---

## 🔒 Privacy & Security

- **Client-Side Only**: All API tokens (Gemini API keys, Vertex keys, Google OAuth tokens, and Suno tokens) are stored exclusively in your browser's `localStorage` or `IndexedDB`.
- **Zero Logging**: Prompts, audio files, uploaded context documents, and Suno history are never logged, stored, or tracked on external servers.
- **Direct Edge Relaying**: The Cloudflare Worker functions as a passthrough proxy and does not inspect, persist, or collect authentication headers or payload data.

---

## 🙏 Credits & Acknowledgements

- [gcui-art/suno-api](https://github.com/gcui-art/suno-api/) - Invaluable reverse-engineering reference for Suno API structures and request formats.
- [Google GenAI SDK](https://github.com/google-gemini/generative-ai-js) - Powers the multimodal and prompt-architect intelligence.
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) & [Mediabunny](https://github.com/Lumi-Script) - Fast, browser-based offline video muxing and color processing.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.
