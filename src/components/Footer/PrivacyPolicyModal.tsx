import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center relative overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 z-0"></div>
            <h2 className="text-xl font-bold text-white relative z-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-400">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Privacy Policy
            </h2>
            <button 
                onClick={onClose}
                className="relative z-10 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        
        <div className="p-8 space-y-6 text-slate-300">
          <div className="space-y-4">
              <p className="leading-relaxed">
                  We are committed to protecting your privacy. This application is designed with a strict minimal-data philosophy.
              </p>
              
              <ul className="space-y-3">
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>No Sensitive Data Lasts:</strong> Gemini / Google auth data directly interfaces with the Gemini API. Suno tokens reach our Cloudflare deployment, though are not logged and are extremely time limited.</p>
                  </li>
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>No Identifying Info:</strong> No private identifying information ever reaches our servers, including your personal identifying Google and Suno information.</p>
                  </li>
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>Usage of Data:</strong> No telemetry data is recorded by us beyond URL request logs. Please consult Gemini's privacy policy for how they handle data.</p>
                  </li>
              </ul>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50 rounded-b-2xl">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
