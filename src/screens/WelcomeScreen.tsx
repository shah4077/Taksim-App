import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTranslation } from '../i18n/useTranslation';
import { useSessionStore } from '../state/useSessionStore';
import { createGuestUser } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

/**
 * Published from docs/ via GitHub Pages. Google Play requires a reachable
 * privacy policy URL, and the consent line below promises both documents, so
 * these must stay live for as long as the app is listed.
 */
const TERMS_URL = 'https://shah4077.github.io/Taksim-App/terms.html';
const PRIVACY_URL = 'https://shah4077.github.io/Taksim-App/privacy.html';

/**
 * Colors and type scale for this screen are lifted directly from the
 * "Harmonious Equity" design spec provided for the welcome/login page. This
 * is intentionally a distinct visual moment (glass panel, gradient wash)
 * from the rest of the app's theme in src/theme — scoped locally here
 * rather than merged into the shared design system.
 */
const palette = {
  background: '#f4faff',
  primary: '#004c3c',
  onSurfaceVariant: '#3f4945',
  secondaryContainer: '#b4ebdf',
  primaryFixed: '#a4f2d8',
};

function fontFor(language: 'en' | 'ar', weight: 'regular' | 'medium' | 'semiBold' | 'bold') {
  if (language === 'ar') return undefined;
  const map = {
    regular: 'BeVietnamPro_400Regular',
    medium: 'BeVietnamPro_500Medium',
    semiBold: 'BeVietnamPro_600SemiBold',
    bold: 'BeVietnamPro_700Bold',
  };
  return map[weight];
}

export function WelcomeScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const setUser = useSessionStore((s) => s.setUser);

  function handleGuest() {
    setUser(createGuestUser());
  }

  async function openLegalLink(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('welcome.legalUnavailable'));
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <View style={styles.content}>
        <View style={styles.branding}>
          <Image source={require('../../assets/taksim-logo.png')} style={styles.logo} resizeMode="cover" />
          <Text style={[styles.title, { fontFamily: fontFor(language, 'bold') }]}>
            Taksim <Text style={styles.titleArabic}>تقسيم</Text>
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fontFor(language, 'regular') }]}>
            {t('welcome.tagline')}
          </Text>
        </View>

        <BlurView intensity={40} tint="light" style={styles.panel}>
          <Pressable style={styles.guestButton} onPress={handleGuest}>
            <Text style={[styles.guestLabel, { fontFamily: fontFor(language, 'semiBold') }]}>
              {t('login.guest')}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('EmailAuth')} style={styles.emailLink}>
            <Text style={[styles.emailLinkLabel, { fontFamily: fontFor(language, 'medium') }]}>
              {t('welcome.continueWithEmail')}
            </Text>
          </Pressable>
        </BlurView>

        <Text style={[styles.legal, { fontFamily: fontFor(language, 'regular') }]}>
          {t('welcome.legalPrefix')}{' '}
          <Text style={styles.legalLink} onPress={() => openLegalLink(TERMS_URL)}>
            {t('welcome.terms')}
          </Text>{' '}
          {t('welcome.legalAnd')}{' '}
          <Text style={styles.legalLink} onPress={() => openLegalLink(PRIVACY_URL)}>
            {t('welcome.privacy')}
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    opacity: 0.35,
  },
  blobTop: {
    top: -140,
    right: -140,
    backgroundColor: palette.secondaryContainer,
  },
  blobBottom: {
    bottom: -160,
    left: -160,
    backgroundColor: palette.primaryFixed,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 160,
    aspectRatio: 512 / 279,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 195, 0.3)',
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    color: palette.primary,
    textAlign: 'center',
  },
  titleArabic: {
    opacity: 0.8,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  panel: {
    width: '100%',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  guestLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#FFFFFF',
  },
  emailLink: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  emailLinkLabel: {
    fontSize: 13,
    color: palette.primary,
    textDecorationLine: 'underline',
  },
  legal: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
    opacity: 0.7,
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
});
