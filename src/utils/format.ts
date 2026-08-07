import type { CurrencyCode } from '../state/useSessionStore';

export function formatAmount(amount: number): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return `${formatAmount(amount)} ${currency}`;
}
