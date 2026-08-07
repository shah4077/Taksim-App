import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { FormSheet } from '../../components/FormSheet';
import { EmptyState } from '../../components/EmptyState';
import { useTranslation } from '../../i18n/useTranslation';
import { colors } from '../../theme/colors';
import { useFamilyStore, MAX_FAMILIES, EMPTY_FAMILIES, type Family } from '../../state/useFamilyStore';
import { useSessionStore } from '../../state/useSessionStore';
import { formatAmount, formatMoney } from '../../utils/format';
import { evaluateExpression } from '../../utils/expression';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyList'>;

export function FamilyListScreen({ navigation, route }: Props) {
  const { gatheringId } = route.params;
  const { t } = useTranslation();
  const currency = useSessionStore((s) => s.currency);
  const families = useFamilyStore((s) => s.familiesByGathering[gatheringId] ?? EMPTY_FAMILIES);
  const addFamily = useFamilyStore((s) => s.addFamily);
  const updateFamily = useFamilyStore((s) => s.updateFamily);
  const removeFamily = useFamilyStore((s) => s.removeFamily);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contribution, setContribution] = useState('');
  const [members, setMembers] = useState('');
  const [errors, setErrors] = useState<{ name?: string; contribution?: string; members?: string }>({});

  function openAddSheet() {
    setEditingId(null);
    setName('');
    setContribution('');
    setMembers('');
    setErrors({});
    setSheetVisible(true);
  }

  function openEditSheet(family: Family) {
    setEditingId(family.id);
    setName(family.name);
    setContribution(String(family.contribution));
    setMembers(String(family.members));
    setErrors({});
    setSheetVisible(true);
  }

  function handleContributionChange(text: string) {
    if (!text.endsWith('=')) {
      setContribution(text);
      setErrors((prev) => ({ ...prev, contribution: undefined }));
      return;
    }

    const expression = text.slice(0, -1);
    const result = evaluateExpression(expression);
    if (result === null || result < 0) {
      setContribution(expression);
      setErrors((prev) => ({ ...prev, contribution: t('family.invalidExpression') }));
      return;
    }
    setContribution(formatAmount(result));
    setErrors((prev) => ({ ...prev, contribution: undefined }));
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    const contributionValue = Number(contribution);
    const membersValue = Number(members);
    const nextErrors: typeof errors = {};

    const isDuplicate = families.some(
      (f) => f.name.toLowerCase() === trimmedName.toLowerCase() && f.id !== editingId
    );

    if (!trimmedName || isDuplicate) {
      nextErrors.name = t('family.duplicateName');
    }
    if (!Number.isFinite(contributionValue) || contributionValue < 0) {
      nextErrors.contribution = t('family.invalidContribution');
    }
    if (!Number.isInteger(membersValue) || membersValue < 1) {
      nextErrors.members = t('family.invalidMembers');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingId) {
      updateFamily(gatheringId, editingId, {
        name: trimmedName,
        contribution: contributionValue,
        members: membersValue,
      });
    } else {
      addFamily(gatheringId, trimmedName, contributionValue, membersValue);
    }
    setSheetVisible(false);
  }

  function handleRemove(family: Family) {
    Alert.alert(
      t('family.removeConfirmTitle'),
      t('family.removeConfirmMessage', { name: family.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeFamily(gatheringId, family.id),
        },
      ]
    );
  }

  const canAdd = families.length < MAX_FAMILIES;
  const canCalculate = families.length >= 2;

  return (
    <Screen>
      <FlatList
        data={families}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t('family.emptyState')} />}
        contentContainerStyle={families.length === 0 && styles.flexGrow}
        renderItem={({ item }) => (
          <Card style={styles.familyCard}>
            <View style={styles.familyRow}>
              <View style={styles.flex1}>
                <Text style={styles.familyName}>{item.name}</Text>
                <Text style={styles.familyMeta}>
                  {formatMoney(item.contribution, currency)} · {item.members}{' '}
                  {t('family.eligibleMembers').toLowerCase()}
                </Text>
              </View>
              <Pressable onPress={() => openEditSheet(item)} hitSlop={10} style={styles.iconButton}>
                <Ionicons name="create-outline" size={22} color={colors.secondary} />
              </Pressable>
              <Pressable onPress={() => handleRemove(item)} hitSlop={10} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {!canAdd && <Text style={styles.maxNotice}>{t('family.maxReached', { max: MAX_FAMILIES })}</Text>}

      <View style={styles.footer}>
        <Button
          label={t('family.addFamily')}
          onPress={openAddSheet}
          variant="outline"
          disabled={!canAdd}
          style={styles.calculateButton}
        />
        <Button
          label={t('family.calculate')}
          onPress={() => navigation.navigate('FamilyResults', { gatheringId })}
          disabled={!canCalculate}
          style={styles.calculateButton}
        />
      </View>

      <FormSheet
        visible={sheetVisible}
        title={editingId ? t('family.editFamily') : t('family.addFamily')}
        onCancel={() => setSheetVisible(false)}
        onSubmit={handleSubmit}
        submitLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextField label={t('family.familyName')} value={name} onChangeText={setName} error={errors.name} />
        <TextField
          label={t('family.contribution', { currency })}
          value={contribution}
          onChangeText={handleContributionChange}
          keyboardType={Platform.select({ ios: 'numbers-and-punctuation', default: 'default' })}
          autoCorrect={false}
          placeholder={t('family.contributionHint')}
          error={errors.contribution}
        />
        <TextField
          label={t('family.eligibleMembers')}
          value={members}
          onChangeText={setMembers}
          keyboardType="number-pad"
          error={errors.members}
        />
      </FormSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexGrow: { flexGrow: 1 },
  familyCard: {
    padding: 14,
  },
  familyRow: {
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
  iconButton: {
    marginStart: 8,
  },
  separator: {
    height: 12,
  },
  maxNotice: {
    color: colors.warning,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  calculateButton: {
    flex: 1,
  },
});
