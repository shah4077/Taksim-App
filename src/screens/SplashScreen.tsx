import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';
import { radii } from '../theme/typography';

/**
 * Shown once at cold start while fonts/language hydrate. Not a navigation
 * route — App.tsx renders this in place of the navigator until ready.
 */
export function SplashScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoMark}>
          <Ionicons name="people" size={40} color="#FFFFFF" />
        </View>
        <View style={styles.wordmarkRow}>
          <AppText weight="extraBold" style={styles.wordmark}>
            Taksim
          </AppText>
          <AppText weight="extraBold" style={styles.wordmark}>
            تقسيم
          </AppText>
        </View>
        <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
      </View>

      <View style={styles.footer}>
        <AppText style={styles.tagline}>{t('login.subtitle')}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  wordmarkRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  wordmark: {
    fontSize: 28,
    color: colors.primary,
  },
  spinner: {
    marginTop: 8,
  },
  footer: {
    paddingBottom: 56,
    paddingHorizontal: 32,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
