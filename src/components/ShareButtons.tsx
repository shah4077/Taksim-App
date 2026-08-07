import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { useTranslation } from '../i18n/useTranslation';

interface ShareButtonsProps {
  message: string;
  subject: string;
}

export function ShareButtons({ message, subject }: ShareButtonsProps) {
  const { t } = useTranslation();

  async function shareToWhatsApp() {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('share.whatsappUnavailable'));
    }
  }

  async function shareToGmail() {
    const gmailUrl = `googlegmail:///co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      message
    )}`;
    try {
      await Linking.openURL(gmailUrl);
      return;
    } catch {
      // Gmail app not installed or scheme unsupported — fall back to the
      // system default mail client via a plain mailto: link.
    }
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(mailtoUrl);
    } catch {
      Alert.alert(t('common.error'), t('share.emailUnavailable'));
    }
  }

  return (
    <View style={styles.container}>
      <Button label={t('share.whatsapp')} onPress={shareToWhatsApp} icon="logo-whatsapp" style={styles.button} />
      <Button
        label={t('share.gmail')}
        onPress={shareToGmail}
        variant="outline"
        icon="mail-outline"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 12,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
