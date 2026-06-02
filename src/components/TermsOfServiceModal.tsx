import React from 'react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Terms of Service
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
                  By using this application, you agree to these Terms of Service.
              </p>
              
              <ul className="space-y-3">
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>Acceptable Use:</strong> You may not use this application for any illegal or unauthorized purpose.</p>
                  </li>
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>Copyright Infringement:</strong> You agree not to use the application to infringe on any third party's copyright, trademark, or other intellectual property rights. Do not generate music that uses copyrighted lyrics or elements without permission.</p>
                  </li>
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>Third-Party Services:</strong> This application interacts with third-party APIs (Google, Suno). You must also comply with their respective Terms of Service while using this application.</p>
                  </li>
                  <li className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <p><strong>No Liability:</strong> We are not responsible for any content generated through this tool or any consequences arising from its use.</p>
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

export default TermsOfServiceModal;
