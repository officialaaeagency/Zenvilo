import { CurrencyConfig } from '../types/store';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'USD',
    symbol: '$',
    label: 'USD ($)',
    rate: 1.0,
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€)',
    rate: 0.92,
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'GBP (£)',
    rate: 0.79,
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    label: 'CAD (CA$)',
    rate: 1.36,
  },
  {
    code: 'AUD',
    symbol: 'AU$',
    label: 'AUD (AU$)',
    rate: 1.52,
  },
  {
    code: 'JPY',
    symbol: '¥',
    label: 'JPY (¥)',
    rate: 154.0,
  },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];

export function formatPrice(amountInUSD: number, currency: CurrencyConfig): string {
  const converted = amountInUSD * currency.rate;
  if (currency.code === 'JPY') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}
