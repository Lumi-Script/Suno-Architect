import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type AppRoute = 
  | '/'
  | '/lyrics'
  | '/video'
  | '/history'
  | '/privacy'
  | '/terms'
  | '/about';

interface RouteMetadata {
  title: string;
  description: string;
}

const ROUTE_METADATA: Record<string, RouteMetadata> = {
  '/': {
    title: 'Suno Architect | Free AI Music Prompt & Lyric Generator with Video Visualizer',
    description: 'Architect production-ready prompts, structured lyrics, and stunning audio-reactive videos for Suno AI & Udio. Powered by Gemini AI with direct studio synchronization.',
  },
  '/lyrics': {
    title: 'Lyrics & Prompt Generator | Suno Architect',
    description: 'Generate multi-track album prompts, structured lyrics with musical meta-tags, and style parameters tailored for Suno AI and Udio engines.',
  },
  '/video': {
    title: 'Studio Video Generator & Audio Visualizer | Suno Architect',
    description: 'Render audio-reactive video visualizers with synchronized lyrics (LRC/SRT) in 16:9, 9:16 vertical, and 1:1 formats for YouTube, TikTok, and Reels.',
  },
  '/history': {
    title: 'Clip History & Library | Suno Architect',
    description: 'Manage and sync your Suno clips, lyric drafts, stems, audio playback, and export your entire prompt history safely stored in your browser.',
  },
  '/privacy': {
    title: 'Privacy Policy & Google OAuth Compliance | Suno Architect',
    description: 'Official Privacy Policy for Suno Architect, detailing our strict client-side data architecture, Google OAuth compliance, and Limited Use disclosures.',
  },
  '/terms': {
    title: 'Terms of Service & Acceptable Use | Suno Architect',
    description: 'Official Terms of Service governing the use of Suno Architect, AI-generated content guidelines, and third-party API integration terms.',
  },
  '/about': {
    title: 'About Suno Architect & Data Usage Transparency',
    description: 'Learn about Suno Architect, our mission to empower AI music creators, and our strict commitment to zero remote data retention.',
  },
};

export const normalizePath = (pathname: string): AppRoute => {
  let clean = pathname.toLowerCase().trim();
  // Strip trailing slashes unless root
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }

  // Handle aliases and legacy routes
  if (clean === '/generator' || clean === '/prompt-generator' || clean === '/prompts') {
    return '/lyrics';
  }
  if (clean === '/visualizer' || clean === '/video-generator') {
    return '/video';
  }
  if (clean === '/tos' || clean === '/terms-of-service' || clean === '/terms-and-conditions') {
    return '/terms';
  }
  if (clean === '/privacy-policy') {
    return '/privacy';
  }
  if (clean === '/about-us') {
    return '/about';
  }

  if (['/', '/lyrics', '/video', '/history', '/privacy', '/terms', '/about'].includes(clean)) {
    return clean as AppRoute;
  }

  // Check hash fallback for legacy hash URLs (e.g. #privacy, #tos, #generator)
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (hash === 'privacy') return '/privacy';
    if (hash === 'tos' || hash === 'terms') return '/terms';
    if (hash === 'about') return '/about';
    if (hash === 'generator' || hash === 'lyrics') return '/lyrics';
    if (hash === 'history') return '/history';
    if (hash === 'visualizer' || hash === 'video') return '/video';
  }

  return '/';
};

interface RouterContextType {
  currentPath: AppRoute;
  rawPath: string;
  navigate: (to: string, options?: { replace?: boolean; scroll?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  rawPath: '/',
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

interface RouterProviderProps {
  children: ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return '/';
    return normalizePath(window.location.pathname);
  });
  const [rawPath, setRawPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  });

  const updateMetadata = useCallback((path: AppRoute) => {
    if (typeof document === 'undefined') return;
    const meta = ROUTE_METADATA[path] || ROUTE_METADATA['/'];
    document.title = meta.title;

    // Update meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', meta.description);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const origin = window.location.origin || 'https://sunoarchitect.lumi-script.dev';
    const canonicalUrl = path === '/' ? `${origin}/` : `${origin}${path}`;
    canonical.setAttribute('href', canonicalUrl);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean; scroll?: boolean }) => {
    if (typeof window === 'undefined') return;

    const normalized = normalizePath(to);
    const scroll = options?.scroll !== false;

    if (options?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    setRawPath(to);
    setCurrentPath(normalized);
    updateMetadata(normalized);

    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [updateMetadata]);

  useEffect(() => {
    const handlePopState = () => {
      const normalized = normalizePath(window.location.pathname);
      setRawPath(window.location.pathname);
      setCurrentPath(normalized);
      updateMetadata(normalized);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Initial metadata set
    updateMetadata(currentPath);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [currentPath, updateMetadata]);

  return (
    <RouterContext.Provider value={{ currentPath, rawPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  replace?: boolean;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, replace, className, onClick, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Allow standard behavior for external links, target="_blank", or modifier clicks (Ctrl, Cmd, Shift)
    if (
      href.startsWith('http://') || 
      href.startsWith('https://') || 
      href.startsWith('mailto:') || 
      e.ctrlKey || 
      e.metaKey || 
      e.shiftKey || 
      e.altKey || 
      rest.target === '_blank'
    ) {
      return;
    }

    e.preventDefault();
    navigate(href, { replace });
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
