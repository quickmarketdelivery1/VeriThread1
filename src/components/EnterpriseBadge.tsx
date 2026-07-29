import React, { useState } from 'react';

interface EnterpriseBadgeProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg'; // default 24
}

export function EnterpriseBadge({ className = '', size = 24 }: EnterpriseBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
        className="flex items-center justify-center text-[#0F5132] cursor-pointer transition-all hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.7)] active:scale-95 shrink-0"
        aria-label="VeriThread Enterprise Badge"
        title="This brand is subscribed to VeriThread Enterprise"
      >
        {/* Rough / serrated starburst badge with rugged edges */}
        <svg viewBox="0 0 24 24" className="w-full h-full text-[#0F5132]" fill="currentColor">
          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C13.95 2.475 12.58 1.6 11 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C.875 9.55 0 10.92 0 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.25 1.273 2.62 2.148 4.2 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.25 2.148-2.62 2.148-4.2z" />
          <path fill="#FFFFFF" d="M9.7 15.2l-3.2-3.2 1.41-1.41 1.79 1.79 6.09-6.09 1.41 1.41-7.5 7.5z" />
        </svg>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-2xl z-50 pointer-events-none animate-fade-in font-sans leading-tight text-center border border-amber-500/40">
          <p className="font-bold text-amber-400 mb-0.5">Enterprise Verified</p>
          <p className="text-gray-200">This brand is subscribed to VeriThread Enterprise</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default EnterpriseBadge;
