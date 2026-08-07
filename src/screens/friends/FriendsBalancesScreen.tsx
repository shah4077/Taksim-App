import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
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
        ListHeaderComponent={<Text style={styles.sectionTitle}>{t('balances.netBalances')}</Text>}
        renderItem={({ item }) => (
          <Card style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.name}>{item.name}</Text>
              {Math.abs(item.balance) < 0.01 ? (
                <Text style={styles.settledText}>{t('family.settled')}</Text>
              ) : (
                <Text style={item.balance > 0 ? styles.creditText : styles.debitText}>
                  {item.balance > 0 ? t('balances.isOwed') : t('balances.owes')}{' '}
                  {formatMoney(Math.abs(item.balance), currency)}
                </Text>
              )}
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View>
            <Text style={styles.sectionTitle}>{t('balances.settlementTitle')}</Text>
            {settlements.length === 0 ? (
              <EmptyState message={t('balances.allSettled')} />
            ) : (
              settlements.map((s) => (
                <Card key={`${s.fromId}-${s.toId}`} style={styles.settlementCard}>
                  <Text style={styles.settlementText}>
                    {t('balances.settlementLine', {
                      from: s.fromName,
                      to: s.toName,
                      amount: formatAmount(s.amount),
                      currency,
                    })}
                  </Text>
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  balanceCard: {
    padding: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  creditText: {
    color: colors.success,
    fontWeight: '700',
  },
  debitText: {
    color: colors.danger,
    fontWeight: '700',
  },
  settledText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  settlementCard: {
    marginBottom: 10,
    backgroundColor: colors.secondaryLight,
  },
  settlementText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
