import React from 'react';

interface CleanLyricsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  tooltip?: string;
  id?: string;
}

const CleanLyricsToggle: React.FC<CleanLyricsToggleProps> = ({ 
  checked, 
  onChange, 
  label = "Clean Lyrics", 
  tooltip,
  id = "clean-lyrics-toggle"
}) => {
  return (
    <div className="flex items-center gap-2 group relative" title={tooltip}>
      <label htmlFor={id} className="flex items-center cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            className="sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-pink-600' : 'bg-slate-600'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
        {label && (
          <span className="ml-2 text-xs font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
            {label}
          </span>
        )}
      </label>
      
      {/* Tooltip implementation if needed, though 'title' works for basic usage */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default CleanLyricsToggle;
