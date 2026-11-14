import de from '@/messages/de.json';
import en from '@/messages/en.json';

export type Locale = 'de' | 'en';
export type Copy = typeof de;

// All visible text comes from the message files. Components ask for the copy of their locale.
export function getCopy(locale: Locale): Copy {
  return locale === 'de' ? de : en;
}

export function localeOf(pathname: string): Locale {
  return pathname.startsWith('/de') ? 'de' : 'en';
}
