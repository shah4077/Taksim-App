import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { InitialsAvatar } from '../../components/InitialsAvatar';
import { PageTitle } from '../../components/PageTitle';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { ShareButtons } from '../../components/ShareButtons';
import { useTranslation } from '../../i18n/useTranslation';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/typography';
import { useFamilyStore, EMPTY_FAMILIES } from '../../state/useFamilyStore';
import { useGatheringStore } from '../../state/useGatheringStore';
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
  const gatheringName = useGatheringStore((s) => s.gatherings.find((g) => g.id === gatheringId)?.name ?? '');

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
            <PageTitle
              eyebrow={gatheringName}
              title={t('family.resultsTitle')}
              titleColor={colors.primary}
              align="center"
            />
            <View style={styles.badgeRow}>
              <Badge
                label={t('common.calculationsComplete')}
                tone="mint"
                icon={<Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard icon="cash-outline" label={t('family.grandTotal')} value={formatMoney(grandTotal, currency)} />
              <StatCard
                icon="people-outline"
                label={t('family.perPersonShare')}
                value={formatMoney(perPersonShare, currency)}
              />
            </View>
            <AppText style={styles.membersCaption}>
              {t('family.totalMembersCaption', { count: totalMembers })}
            </AppText>

            <AppText weight="bold" style={styles.sectionTitle}>
              {t('family.balancesTitle')}
            </AppText>
          </>
        }
        renderItem={({ item, index }) => (
          <Card style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <InitialsAvatar name={item.name} index={index} size={36} />
              <View style={styles.flex1}>
                <AppText weight="bold" style={styles.familyName}>
                  {item.name}
                </AppText>
                <AppText style={styles.familyMeta}>
                  {t('family.contributed', { amount: formatMoney(item.contribution, currency) })}
                </AppText>
              </View>
              <BalanceTag balance={item.balance} currency={currency} t={t} />
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View>
            <AppText weight="bold" style={styles.sectionTitle}>
              {t('family.settlementTitle')}
            </AppText>
            <AppText style={styles.sectionSubtitle}>{t('family.settlementSubtitle')}</AppText>

            {settlements.length === 0 ? (
              <EmptyState message={t('family.noSettlementNeeded')} />
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText weight="extraBold" style={styles.statValue}>
        {value}
      </AppText>
    </Card>
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
        <AppText weight="bold" style={styles.tagTextNeutral}>
          {t('family.settled')}
        </AppText>
      </View>
    );
  }
  const isCredit = balance > 0;
  return (
    <View style={[styles.tag, isCredit ? styles.tagCredit : styles.tagDebit]}>
      <AppText weight="bold" style={isCredit ? styles.tagTextCredit : styles.tagTextDebit}>
        {isCredit ? t('family.credit') : t('family.debit')} {formatAmount(Math.abs(balance))} {currency}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: colors.primary,
    fontSize: 20,
  },
  membersCaption: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
  },
  balanceCard: {
    padding: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex1: { flex: 1 },
  familyName: {
    fontSize: 16,
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
    borderRadius: radii.sm,
  },
  tagCredit: {
    backgroundColor: colors.successLight,
  },
  tagDebit: {
    backgroundColor: colors.dangerLight,
  },
  tagNeutral: {
    backgroundColor: colors.neutralLight,
  },
  tagTextCredit: {
    color: colors.success,
    fontSize: 13,
  },
  tagTextDebit: {
    color: colors.danger,
    fontSize: 13,
  },
  tagTextNeutral: {
    color: colors.textMuted,
    fontSize: 13,
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
  backButton: {
    marginTop: 20,
    marginBottom: 12,
  },
});
