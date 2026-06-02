import React, { useState, useEffect } from 'react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import AboutModal from './AboutModal';

interface FooterProps {
  git: string;
}

const Footer = ({ git }: FooterProps) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTosOpen, setIsTosOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Auto-open modals if URL matches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPrivacyPath = window.location.pathname === '/privacy' || window.location.hash === '#privacy';
      const isTosPath = window.location.pathname.toLowerCase() === '/tos' || window.location.hash.toLowerCase() === '#tos';
      const isAboutPath = window.location.pathname.toLowerCase() === '/about' || window.location.hash.toLowerCase() === '#about';

      if (isPrivacyPath) {
        setIsPrivacyOpen(true);
      }
      
      if (isTosPath) {
        setIsTosOpen(true);
      }
      
      if (isAboutPath) {
        setIsAboutOpen(true);
      }
    }
  }, []);

  // Custom close handler to clean up the URL path automatically for Privacy
  const handleClosePrivacy = () => {
    setIsPrivacyOpen(false);

    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/privacy') {
        window.history.pushState({}, '', '/');
      } else if (window.location.hash === '#privacy') {
        window.history.pushState({}, '', window.location.pathname);
      }
    }
  };

  // Custom close handler to clean up the URL path automatically for ToS
  const handleCloseTos = () => {
    setIsTosOpen(false);

    if (typeof window !== 'undefined') {
      if (window.location.pathname.toLowerCase() === '/tos') {
        window.history.pushState({}, '', '/');
      } else if (window.location.hash.toLowerCase() === '#tos') {
        window.history.pushState({}, '', window.location.pathname);
      }
    }
  };

  // Custom close handler for About
  const handleCloseAbout = () => {
    setIsAboutOpen(false);

    if (typeof window !== 'undefined') {
      if (window.location.pathname.toLowerCase() === '/about') {
        window.history.pushState({}, '', '/');
      } else if (window.location.hash.toLowerCase() === '#about') {
        window.history.pushState({}, '', window.location.pathname);
      }
    }
  };

  return (
    <>
      <footer className="w-full py-6 text-center border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-slate-500 text-sm">
            Open Source Project. View source on{' '}
            <a 
              href={git} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-400 hover:text-purple-300 hover:underline transition-colors font-medium"
            >
              GitHub
            </a>
          </p>
          <div className="flex items-center gap-3">
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); setIsAboutOpen(true); }}
                className="text-slate-400 hover:text-white hover:underline transition-colors font-medium text-sm"
              >
                About & Data Usage
              </a>
              <span className="text-slate-600 font-medium text-xs">•</span>
              <a
                href="#privacy"
                onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}
                className="text-slate-400 hover:text-white hover:underline transition-colors font-medium text-sm"
              >
                Privacy Policy
              </a>
              <span className="text-slate-600 font-medium text-xs">•</span>
              <a
                href="#tos"
                onClick={(e) => { e.preventDefault(); setIsTosOpen(true); }}
                className="text-slate-400 hover:text-white hover:underline transition-colors font-medium text-sm"
              >
                Terms of Service
              </a>
          </div>
        </div>
      </footer>
      
      {/* Handed over handleClosePrivacy to handle both closing and state cleanups */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={handleClosePrivacy} />
      <TermsOfServiceModal isOpen={isTosOpen} onClose={handleCloseTos} />
      <AboutModal isOpen={isAboutOpen} onClose={handleCloseAbout} />
    </>
  );
};

export default Footer;
