import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-base tracking-[0.2em]' },
    md: { icon: 'w-8 h-8', text: 'text-lg tracking-[0.22em]' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl tracking-[0.25em]' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Precision Geometric Monogram Symbol */}
      <svg
        className={`${current.icon} shrink-0 text-white`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="9" fill="#0d0d10" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="8.5" stroke="#26262e" strokeWidth="1" />
        
        {/* Upper horizontal bar */}
        <path
          d="M10 12.5H30L21.5 21H10V12.5Z"
          fill="#FFFFFF"
        />
        {/* Violet futuristic diagonal bridge */}
        <path
          d="M18.5 21L30 12.5V17L22 25H10L18.5 21Z"
          fill="#8B5CF6"
        />
        {/* Lower horizontal foundation bar */}
        <path
          d="M10 27.5H30V24.5L24 24.5L16 27.5H10Z"
          fill="#FFFFFF"
        />
        <path
          d="M10 27.5H30V27.5C30 27.5 24 27.5 22 27.5L14 27.5L10 27.5Z"
          fill="#A78BFA"
        />
      </svg>

      {showText && (
        <span className={`font-bold font-['Space_Grotesk'] text-white ${current.text} uppercase`}>
          Zenvilo
        </span>
      )}
    </div>
  );
};
