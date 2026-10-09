import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyConfig } from '../types/store';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, formatPrice as helperFormatPrice } from '../data/currencies';

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrencyCode: (code: string) => void;
  formatPrice: (amountInUSD: number) => string;
  supportedCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'zenvilo_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = SUPPORTED_CURRENCIES.find((c) => c.code === saved);
        if (found) return found;
      }
    } catch {
      // LocalStorage access failure fallback
    }
    return DEFAULT_CURRENCY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency.code);
    } catch {
      // Ignore storage errors
    }
  }, [currency]);

  const setCurrencyCode = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
    }
  };

  const formatPrice = (amountInUSD: number) => {
    return helperFormatPrice(amountInUSD, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrencyCode,
        formatPrice,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
