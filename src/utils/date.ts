export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDateDisplay(key: string, language: 'en' | 'ar'): string {
  try {
    const date = fromDateKey(key);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' }).format(date);
  } catch {
    return key;
  }
}

export function formatDateRange(
  startKey: string | undefined,
  endKey: string | undefined,
  language: 'en' | 'ar'
): string | null {
  if (!startKey && !endKey) return null;
  if (startKey && endKey) {
    return `${formatDateDisplay(startKey, language)} – ${formatDateDisplay(endKey, language)}`;
  }
  return formatDateDisplay((startKey ?? endKey) as string, language);
}

export type DateStatus = 'past' | 'thisWeek' | 'upcoming' | 'planning';

/** Purely presentational bucket derived from an existing date field — no new data. */
export function getDateStatus(dateKey: string | undefined, referenceDate: Date = new Date()): DateStatus {
  if (!dateKey) return 'planning';
  const target = fromDateKey(dateKey);
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'past';
  if (diffDays <= 7) return 'thisWeek';
  return 'upcoming';
}
