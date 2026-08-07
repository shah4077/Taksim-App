import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { AppText } from '../components/AppText';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';
import { useSessionStore } from '../state/useSessionStore';
import { signInWithEmail, signUpWithEmail } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailAuth'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailAuthScreen(_props: Props) {
  const { t } = useTranslation();
  const setUser = useSessionStore((s) => s.setUser);

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!EMAIL_REGEX.test(email.trim())) next.email = t('login.invalidEmail');
    if (password.length < 6) next.password = t('login.invalidPassword');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleEmailSubmit() {
    if (!isFirebaseConfigured) {
      Alert.alert(t('common.error'), t('login.firebaseNotConfigured'));
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const user =
        mode === 'signIn'
          ? await signInWithEmail(email.trim(), password)
          : await signUpWithEmail(email.trim(), password);
      setUser(user);
    } catch (e) {
      Alert.alert(t('common.error'), t('login.authFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText weight="bold" style={styles.title}>
          {t('login.title')}
        </AppText>
        <AppText style={styles.subtitle}>{t('login.subtitle')}</AppText>
      </View>

      <TextField
        label={t('login.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
        placeholder="name@example.com"
      />
      <TextField
        label={t('login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        placeholder="••••••••"
      />

      <Button
        label={mode === 'signIn' ? t('login.signIn') : t('login.signUp')}
        onPress={handleEmailSubmit}
        loading={loading}
        style={styles.primaryAction}
      />

      <AppText
        weight="semiBold"
        style={styles.toggle}
        onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
      >
        {mode === 'signIn' ? t('login.toggleToSignUp') : t('login.toggleToSignIn')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  primaryAction: {
    marginTop: 4,
  },
  toggle: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
  },
});
