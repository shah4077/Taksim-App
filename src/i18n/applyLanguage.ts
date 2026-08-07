import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRTL, setAppLanguage, type AppLanguage } from './index';

const RTL_APPLIED_KEY = 'taksim-rtl-applied-language';

/**
 * Applies the given language to the i18n instance and, if its writing
 * direction differs from the current native layout direction, flips
 * I18nManager's RTL flag and reloads the app so the new direction takes
 * effect. Reload is best-effort: in Expo Go, Updates.reloadAsync() only
 * re-executes JS — it doesn't restart the native process, so
 * I18nManager.isRTL keeps reporting the pre-flip value afterwards. Relying on
 * it to detect "already applied" would re-trigger the reload on every boot
 * and loop forever, so completion is tracked in AsyncStorage instead (written
 * and awaited before reloading, so it survives the reload): once we've
 * attempted the flip for a given language, we don't attempt it again until
 * the language changes. Full layout mirroring still only takes effect after
 * the next real app restart.
 */
export async function applyLanguage(language: AppLanguage): Promise<void> {
  setAppLanguage(language);

  const appliedFor = await AsyncStorage.getItem(RTL_APPLIED_KEY);
  if (appliedFor === language) {
    return;
  }
  await AsyncStorage.setItem(RTL_APPLIED_KEY, language);

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
