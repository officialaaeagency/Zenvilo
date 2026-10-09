import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] duration-150';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 min-h-[38px]',
    md: 'text-sm px-5 py-2.5 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 min-h-[50px]',
  };

  const variantStyles = {
    primary:
      'bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-600/20 active:bg-violet-700',
    secondary:
      'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700/60 active:bg-neutral-800',
    outline:
      'bg-transparent hover:bg-neutral-900 text-neutral-200 border border-neutral-700 hover:border-neutral-500 active:bg-neutral-800',
    ghost:
      'bg-transparent hover:bg-neutral-800/60 text-neutral-300 hover:text-white',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
