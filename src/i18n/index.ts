import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { translations } from './translations';

export type AppLanguage = 'en' | 'ar';

export const RTL_LANGUAGES: AppLanguage[] = ['ar'];

export const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function detectDeviceLanguage(): AppLanguage {
  const tag = Localization.getLocales()[0]?.languageCode;
  return tag === 'ar' ? 'ar' : 'en';
}

export function setAppLanguage(language: AppLanguage) {
  i18n.locale = language;
}

export function isRTL(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function t(scope: string, options?: Record<string, string | number>): string {
  return i18n.t(scope, options);
}
