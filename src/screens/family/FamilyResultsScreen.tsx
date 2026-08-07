import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ShareButtons } from '../../components/ShareButtons';
import { useTranslation } from '../../i18n/useTranslation';
import { colors } from '../../theme/colors';
import { useFamilyStore, EMPTY_FAMILIES } from '../../state/useFamilyStore';
import { useSessionStore } from '../../state/useSessionStore';
import { formatAmount, formatMoney } from '../../utils/format';
import { roundCurrency, simplifySettlements, type Balance } from '../../utils/settlement';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyResults'>;

interface FamilyResult extends Balance {
  contribution: number;
  members: number;
  fairShare: number;
}

export function FamilyResultsScreen({ navigation, route }: Props) {
  const { gatheringId } = route.params;
  const { t } = useTranslation();
  const currency = useSessionStore((s) => s.currency);
  const families = useFamilyStore((s) => s.familiesByGathering[gatheringId] ?? EMPTY_FAMILIES);

  const { grandTotal, totalMembers, perPersonShare, results, settlements } = useMemo(() => {
    const total = families.reduce((sum, f) => sum + f.contribution, 0);
    const membersSum = families.reduce((sum, f) => sum + f.members, 0);
    const share = membersSum > 0 ? total / membersSum : 0;

    const famResults: FamilyResult[] = families.map((f) => {
      const fairShare = roundCurrency(share * f.members);
      return {
        id: f.id,
        name: f.name,
        contribution: f.contribution,
        members: f.members,
        fairShare,
        balance: roundCurrency(f.contribution - fairShare),
      };
    });

    return {
      grandTotal: roundCurrency(total),
      totalMembers: membersSum,
      perPersonShare: roundCurrency(share),
      results: famResults,
      settlements: simplifySettlements(famResults),
    };
  }, [families]);

  const shareText = useMemo(() => {
    const lines = [
      `${t('common.appName')} — ${t('family.resultsTitle')}`,
      '',
      `${t('family.grandTotal')}: ${formatMoney(grandTotal, currency)}`,
      `${t('family.totalMembers')}: ${totalMembers}`,
      `${t('family.perPersonShare')}: ${formatMoney(perPersonShare, currency)}`,
      '',
      `${t('family.balancesTitle')}:`,
    ];
    results.forEach((r) => {
      if (Math.abs(r.balance) < 0.01) {
        lines.push(`${r.name}: ${t('family.settled')}`);
      } else {
        const verb = r.balance > 0 ? t('family.credit') : t('family.debit');
        lines.push(`${r.name}: ${verb} ${formatMoney(Math.abs(r.balance), currency)}`);
      }
    });
    if (settlements.length > 0) {
      lines.push('', `${t('family.settlementTitle')}:`);
      settlements.forEach((s) => {
        lines.push(
          t('family.settlementLine', {
            to: s.toName,
            from: s.fromName,
            amount: formatAmount(s.amount),
            currency,
          })
        );
      });
    }
    return lines.join('\n');
  }, [results, settlements, grandTotal, totalMembers, perPersonShare, currency, t]);

  return (
    <Screen>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Card style={styles.summaryCard}>
              <SummaryRow label={t('family.grandTotal')} value={formatMoney(grandTotal, currency)} />
              <SummaryRow label={t('family.totalMembers')} value={String(totalMembers)} />
              <SummaryRow label={t('family.perPersonShare')} value={formatMoney(perPersonShare, currency)} bold />
            </Card>

            <Text style={styles.sectionTitle}>{t('family.balancesTitle')}</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <View style={styles.flex1}>
                <Text style={styles.familyName}>{item.name}</Text>
                <Text style={styles.familyMeta}>
                  {t('family.contributed', { amount: formatMoney(item.contribution, currency) })}
                </Text>
              </View>
              <BalanceTag balance={item.balance} currency={currency} t={t} />
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View>
            <Text style={styles.sectionTitle}>{t('family.settlementTitle')}</Text>
            {settlements.length === 0 ? (
              <EmptyState message={t('family.noSettlementNeeded')} />
            ) : (
              settlements.map((s) => (
                <Card key={`${s.fromId}-${s.toId}`} style={styles.settlementCard}>
                  <Text style={styles.settlementText}>
                    {t('family.settlementLine', {
                      to: s.toName,
                      from: s.fromName,
                      amount: formatAmount(s.amount),
                      currency,
                    })}
                  </Text>
                </Card>
              ))
            )}

            <ShareButtons message={shareText} subject={t('family.resultsTitle')} />

            <Button
              label={t('family.backToList')}
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.backButton}
            />
          </View>
        }
      />
    </Screen>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>{value}</Text>
    </View>
  );
}

function BalanceTag({
  balance,
  currency,
  t,
}: {
  balance: number;
  currency: string;
  t: (key: string, opts?: Record<string, string | number>) => string;
}) {
  if (Math.abs(balance) < 0.01) {
    return (
      <View style={[styles.tag, styles.tagNeutral]}>
        <Text style={styles.tagTextNeutral}>{t('family.settled')}</Text>
      </View>
    );
  }
  const isCredit = balance > 0;
  return (
    <View style={[styles.tag, isCredit ? styles.tagCredit : styles.tagDebit]}>
      <Text style={isCredit ? styles.tagTextCredit : styles.tagTextDebit}>
        {isCredit ? t('family.credit') : t('family.debit')} {formatAmount(Math.abs(balance))} {currency}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValueBold: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
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
    alignItems: 'center',
  },
  flex1: { flex: 1 },
  familyName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  familyMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  separator: {
    height: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagCredit: {
    backgroundColor: colors.successLight,
  },
  tagDebit: {
    backgroundColor: colors.dangerLight,
  },
  tagNeutral: {
    backgroundColor: colors.border,
  },
  tagTextCredit: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
  tagTextDebit: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  tagTextNeutral: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  settlementCard: {
    marginBottom: 10,
    backgroundColor: colors.primaryLight,
  },
  settlementText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 12,
  },
});
