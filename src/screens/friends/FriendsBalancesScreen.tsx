import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { InitialsAvatar } from '../../components/InitialsAvatar';
import { PageTitle } from '../../components/PageTitle';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { ShareButtons } from '../../components/ShareButtons';
import { useTranslation } from '../../i18n/useTranslation';
import { colors } from '../../theme/colors';
import {
  computeFriendBalances,
  useFriendsStore,
  EMPTY_FRIENDS,
  EMPTY_EXPENSES,
} from '../../state/useFriendsStore';
import { useSessionStore } from '../../state/useSessionStore';
import { formatAmount, formatMoney } from '../../utils/format';
import { simplifySettlements } from '../../utils/settlement';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendsBalances'>;

export function FriendsBalancesScreen({ route }: Props) {
  const { tripId } = route.params;
  const { t } = useTranslation();
  const currency = useSessionStore((s) => s.currency);
  const friends = useFriendsStore((s) => s.friendsByTrip[tripId] ?? EMPTY_FRIENDS);
  const expenses = useFriendsStore((s) => s.expensesByTrip[tripId] ?? EMPTY_EXPENSES);

  const { balances, settlements } = useMemo(() => {
    const b = computeFriendBalances(friends, expenses);
    return { balances: b, settlements: simplifySettlements(b) };
  }, [friends, expenses]);

  const shareText = useMemo(() => {
    const lines = [`${t('common.appName')} — ${t('balances.title')}`, ''];
    balances.forEach((b) => {
      if (Math.abs(b.balance) < 0.01) return;
      const verb = b.balance > 0 ? t('balances.isOwed') : t('balances.owes');
      lines.push(`${b.name} ${verb} ${formatMoney(Math.abs(b.balance), currency)}`);
    });
    if (settlements.length > 0) {
      lines.push('', t('balances.settlementTitle') + ':');
      settlements.forEach((s) => {
        lines.push(
          t('balances.settlementLine', {
            from: s.fromName,
            to: s.toName,
            amount: formatAmount(s.amount),
            currency,
          })
        );
      });
    }
    return lines.join('\n');
  }, [balances, settlements, currency, t]);

  return (
    <Screen>
      <FlatList
        data={balances}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <PageTitle title={t('balances.title')} titleColor={colors.primary} align="center" />
            <AppText weight="bold" style={styles.sectionTitle}>
              {t('balances.netBalances')}
            </AppText>
          </>
        }
        renderItem={({ item, index }) => (
          <Card style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <InitialsAvatar name={item.name} index={index} size={36} />
              <AppText weight="bold" style={styles.flex1}>
                {item.name}
              </AppText>
              {Math.abs(item.balance) < 0.01 ? (
                <AppText weight="bold" style={styles.settledText}>
                  {t('family.settled')}
                </AppText>
              ) : (
                <AppText weight="bold" style={item.balance > 0 ? styles.creditText : styles.debitText}>
                  {item.balance > 0 ? t('balances.isOwed') : t('balances.owes')}{' '}
                  {formatMoney(Math.abs(item.balance), currency)}
                </AppText>
              )}
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View>
            <AppText weight="bold" style={styles.sectionTitle}>
              {t('balances.settlementTitle')}
            </AppText>
            {settlements.length === 0 ? (
              <EmptyState message={t('balances.allSettled')} />
            ) : (
              settlements.map((s, index) => (
                <Card key={`${s.fromId}-${s.toId}`} style={styles.settlementCard}>
                  <View style={styles.settlementNamesRow}>
                    <InitialsAvatar name={s.fromName} index={index * 2} size={32} />
                    <AppText weight="semiBold" style={styles.settlementName}>
                      {s.fromName}
                    </AppText>
                    <Ionicons name="arrow-forward" size={16} color={colors.textMuted} style={styles.arrow} />
                    <InitialsAvatar name={s.toName} index={index * 2 + 1} size={32} />
                    <AppText weight="semiBold" style={styles.settlementName}>
                      {s.toName}
                    </AppText>
                  </View>
                  <AppText weight="extraBold" style={styles.settlementAmount}>
                    {formatMoney(s.amount, currency)}
                  </AppText>
                </Card>
              ))
            )}

            <ShareButtons message={shareText} subject={t('balances.title')} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  balanceCard: {
    padding: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex1: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  creditText: {
    color: colors.success,
    fontSize: 14,
  },
  debitText: {
    color: colors.danger,
    fontSize: 14,
  },
  settledText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  separator: {
    height: 12,
  },
  settlementCard: {
    marginBottom: 10,
  },
  settlementNamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  arrow: {
    marginHorizontal: 10,
  },
  settlementName: {
    marginStart: 8,
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
  },
  settlementAmount: {
    color: colors.danger,
    fontSize: 20,
  },
});
