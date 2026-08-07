import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { isRTL, setAppLanguage, type AppLanguage } from './index';

/**
 * Applies the given language to the i18n instance and, if its writing
 * direction differs from the current native layout direction, flips
 * I18nManager's RTL flag and reloads the app so the new direction takes
 * effect. Reload is best-effort: in Expo Go it may be unavailable, in which
 * case the language still switches but layout mirroring only fully applies
 * after the next app restart.
 */
export async function applyLanguage(language: AppLanguage): Promise<void> {
  setAppLanguage(language);

  const shouldBeRTL = isRTL(language);
  if (shouldBeRTL === I18nManager.isRTL) {
    return;
  }

  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);

  try {
    await Updates.reloadAsync();
  } catch {
    // No-op: reload isn't available (e.g. Expo Go without a dev server
    // connection). The language preference is already persisted.
  }
}
