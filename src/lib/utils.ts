import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency: string = 'CHF') => {
  const locale = currency === 'USD' ? 'en-US' : 'fr-CH';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
};
