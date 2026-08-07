import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageTitle } from '../components/PageTitle';
import { AppText } from '../components/AppText';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';
import { radii } from '../theme/typography';
import { useSessionStore, type CurrencyCode } from '../state/useSessionStore';
import type { AppLanguage } from '../i18n';
import { applyLanguage } from '../i18n/applyLanguage';
import { signOutOfFirebase } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const CURRENCIES: CurrencyCode[] = ['SAR', 'USD', 'AED', 'QAR', 'KWD', 'EUR'];

export function SettingsScreen(_props: Props) {
  const { t, language } = useTranslation();
  const currency = useSessionStore((s) => s.currency);
  const setCurrency = useSessionStore((s) => s.setCurrency);
  const setLanguage = useSessionStore((s) => s.setLanguage);
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);

  async function handleLanguageChange(next: AppLanguage) {
    if (next === language) return;
    setLanguage(next);
    await applyLanguage(next);
  }

  async function handleLogout() {
    await signOutOfFirebase();
    logout();
  }

  return (
    <Screen scroll>
      <PageTitle title={t('settings.title')} />

      <AppText weight="bold" style={styles.sectionTitle}>
        {t('settings.language')}
      </AppText>
      <Card style={styles.card}>
        <Row
          label={t('settings.english')}
          selected={language === 'en'}
          onPress={() => handleLanguageChange('en')}
        />
        <Row
          label={t('settings.arabic')}
          selected={language === 'ar'}
          onPress={() => handleLanguageChange('ar')}
        />
      </Card>

      <AppText weight="bold" style={styles.sectionTitle}>
        {t('settings.currencyLabel')}
      </AppText>
      <Card style={styles.card}>
        {CURRENCIES.map((c) => (
          <Row key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
        ))}
      </Card>

      <AppText weight="bold" style={styles.sectionTitle}>
        {t('settings.account')}
      </AppText>
      <Card style={styles.card}>
        <AppText style={styles.accountText}>
          {user?.mode === 'email' ? user.email : t('settings.guestAccount')}
        </AppText>
      </Card>

      <Button
        label={t('common.logout')}
        onPress={handleLogout}
        variant="danger"
        icon="log-out-outline"
        style={styles.logout}
      />
    </Screen>
  );
}

function Row({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <AppText weight="medium" style={styles.rowLabel}>
        {label}
      </AppText>
      <View style={[styles.radio, selected && styles.radioSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  accountText: {
    fontSize: 15,
    color: colors.text,
    padding: 12,
  },
  logout: {
    marginTop: 32,
  },
});
