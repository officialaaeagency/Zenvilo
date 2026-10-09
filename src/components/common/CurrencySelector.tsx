import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface CurrencySelectorProps {
  variant?: 'minimal' | 'full';
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'minimal',
  className = '',
}) => {
  const { currency, setCurrencyCode, supportedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select currency"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-h-[36px]"
      >
        <Globe className="w-3.5 h-3.5 text-neutral-400" />
        <span>{currency.code}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Supported currencies"
          className="absolute right-0 mt-1.5 w-48 rounded-lg bg-neutral-900 border border-neutral-800 shadow-xl py-1 z-50 focus:outline-none"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/80">
            Store Currency
          </div>
          {supportedCurrencies.map((c) => {
            const isSelected = c.code === currency.code;
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setCurrencyCode(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors min-h-[38px] ${
                  isSelected
                    ? 'bg-violet-950/40 text-violet-300 font-medium'
                    : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-100">{c.code}</span>
                  <span className="text-neutral-400">{c.symbol}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
              </button>
            );
          })}
          <div className="px-3 py-1.5 text-[10px] text-neutral-400 border-t border-neutral-800/80 bg-neutral-950/40">
            Rates updated regularly
          </div>
        </div>
      )}
    </div>
  );
};
