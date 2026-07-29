import React, { useState } from 'react';

interface ProfessionalBadgeProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg'; // default 24
}

export function ProfessionalBadge({ className = '', size = 24 }: ProfessionalBadgeProps) {
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
        className="rounded-full bg-[#2563EB] flex items-center justify-center text-white cursor-pointer transition-all hover:scale-110 hover:shadow-[0_0_12px_rgba(37,99,235,0.7)] active:scale-95 shadow-xs shrink-0"
        aria-label="VeriThread Professional Badge"
        title="This brand is subscribed to VeriThread Professional"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 fill-none stroke-current stroke-[3] stroke-linecap-round stroke-linejoin-round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-2xl z-50 pointer-events-none animate-fade-in font-sans leading-tight text-center border border-gray-700">
          <p className="font-bold text-blue-400 mb-0.5">Professional Verified</p>
          <p className="text-gray-200">This brand is subscribed to VeriThread Professional</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default ProfessionalBadge;
