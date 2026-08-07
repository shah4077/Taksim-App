import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';
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
      <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
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

      <Text style={styles.sectionTitle}>{t('settings.currencyLabel')}</Text>
      <Card style={styles.card}>
        {CURRENCIES.map((c) => (
          <Row key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
        ))}
      </Card>

      <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
      <Card style={styles.card}>
        <Text style={styles.accountText}>
          {user?.mode === 'email' ? user.email : t('settings.guestAccount')}
        </Text>
      </Card>

      <Button label={t('common.logout')} onPress={handleLogout} variant="danger" style={styles.logout} />
    </Screen>
  );
}

function Row({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
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
    borderRadius: 10,
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
