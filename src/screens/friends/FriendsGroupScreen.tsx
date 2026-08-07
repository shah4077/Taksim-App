import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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
import {
  useFriendsStore,
  EMPTY_FRIENDS,
  EMPTY_EXPENSES,
  type Expense,
  type Friend,
  type SplitType,
} from '../../state/useFriendsStore';
import { useSessionStore } from '../../state/useSessionStore';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendsGroup'>;

export function FriendsGroupScreen({ navigation, route }: Props) {
  const { tripId } = route.params;
  const { t } = useTranslation();
  const currency = useSessionStore((s) => s.currency);
  const friends = useFriendsStore((s) => s.friendsByTrip[tripId] ?? EMPTY_FRIENDS);
  const expenses = useFriendsStore((s) => s.expensesByTrip[tripId] ?? EMPTY_EXPENSES);
  const addFriend = useFriendsStore((s) => s.addFriend);
  const removeFriend = useFriendsStore((s) => s.removeFriend);
  const addExpense = useFriendsStore((s) => s.addExpense);
  const updateExpense = useFriendsStore((s) => s.updateExpense);
  const removeExpense = useFriendsStore((s) => s.removeExpense);

  const [friendSheetVisible, setFriendSheetVisible] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendError, setFriendError] = useState<string | undefined>();

  const [expenseSheetVisible, setExpenseSheetVisible] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [expenseErrors, setExpenseErrors] = useState<{
    description?: string;
    amount?: string;
    participants?: string;
    custom?: string;
  }>({});

  function openAddFriend() {
    setFriendName('');
    setFriendError(undefined);
    setFriendSheetVisible(true);
  }

  function handleAddFriend() {
    const trimmed = friendName.trim();
    const duplicate = friends.some((f) => f.name.toLowerCase() === trimmed.toLowerCase());
    if (!trimmed || duplicate) {
      setFriendError(t('friends.duplicateName'));
      return;
    }
    addFriend(tripId, trimmed);
    setFriendSheetVisible(false);
  }

  function handleRemoveFriend(friend: Friend) {
    Alert.alert(
      t('friends.removeConfirmTitle'),
      t('friends.removeConfirmMessage', { name: friend.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => removeFriend(tripId, friend.id) },
      ]
    );
  }

  function openAddExpense() {
    if (friends.length < 2) {
      Alert.alert(t('common.error'), t('friends.needTwoFriends'));
      return;
    }
    setEditingExpenseId(null);
    setDescription('');
    setAmount('');
    setPaidById(friends[0]?.id ?? null);
    setSplitType('equal');
    setParticipantIds(friends.map((f) => f.id));
    setCustomShares({});
    setExpenseErrors({});
    setExpenseSheetVisible(true);
  }

  function openEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setPaidById(expense.paidById);
    setSplitType(expense.splitType);
    setParticipantIds(expense.participantIds);
    setCustomShares(
      expense.customShares
        ? Object.fromEntries(Object.entries(expense.customShares).map(([k, v]) => [k, String(v)]))
        : {}
    );
    setExpenseErrors({});
    setExpenseSheetVisible(true);
  }

  function toggleParticipant(id: string) {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleSubmitExpense() {
    const trimmedDesc = description.trim();
    const amountValue = Number(amount);
    const nextErrors: typeof expenseErrors = {};

    if (!trimmedDesc) nextErrors.description = t('expense.invalidDescription');
    if (!Number.isFinite(amountValue) || amountValue <= 0) nextErrors.amount = t('expense.invalidAmount');
    if (participantIds.length === 0) nextErrors.participants = t('expense.selectAtLeastOne');

    let parsedCustomShares: Record<string, number> | undefined;
    if (splitType === 'custom' && Object.keys(nextErrors).length === 0) {
      parsedCustomShares = {};
      let sum = 0;
      for (const pid of participantIds) {
        const value = Number(customShares[pid] ?? 0);
        parsedCustomShares[pid] = Number.isFinite(value) ? value : 0;
        sum += parsedCustomShares[pid];
      }
      if (Math.abs(sum - amountValue) > 0.01) {
        nextErrors.custom = t('expense.customTotalMismatch', {
          amount: String(amountValue),
          currency,
        });
      }
    }

    if (Object.keys(nextErrors).length > 0 || !paidById) {
      setExpenseErrors(nextErrors);
      return;
    }

    const payload = {
      description: trimmedDesc,
      amount: amountValue,
      paidById,
      splitType,
      participantIds,
      customShares: splitType === 'custom' ? parsedCustomShares : undefined,
    };

    if (editingExpenseId) {
      updateExpense(tripId, editingExpenseId, payload);
    } else {
      addExpense(tripId, payload);
    }
    setExpenseSheetVisible(false);
  }

  function handleRemoveExpense(expense: Expense) {
    Alert.alert(
      t('expense.removeConfirmTitle'),
      t('expense.removeConfirmMessage', { title: expense.description }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeExpense(tripId, expense.id),
        },
      ]
    );
  }

  function friendNameById(id: string): string {
    return friends.find((f) => f.id === id)?.name ?? '';
  }

  return (
    <Screen>
      <Text style={styles.sectionTitle}>{t('friends.participants')}</Text>
      <FlatList
        horizontal
        data={friends}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.friendsRow}
        ListEmptyComponent={<Text style={styles.emptyInline}>{t('friends.emptyFriends')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.friendChip}>
            <Text style={styles.friendChipText}>{item.name}</Text>
            <Pressable onPress={() => handleRemoveFriend(item)} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
      />
      <Button label={t('friends.addFriend')} onPress={openAddFriend} variant="outline" style={styles.addFriendBtn} />

      <View style={styles.expensesHeader}>
        <Text style={styles.sectionTitle}>{t('friends.expenses')}</Text>
        <Pressable onPress={openAddExpense} hitSlop={8}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={[...expenses].sort((a, b) => b.createdAt - a.createdAt)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t('friends.noExpenses')} />}
        contentContainerStyle={expenses.length === 0 && styles.flexGrow}
        renderItem={({ item }) => (
          <Pressable onPress={() => openEditExpense(item)}>
            <Card style={styles.expenseCard}>
              <View style={styles.expenseRow}>
                <View style={styles.flex1}>
                  <Text style={styles.expenseDesc}>{item.description}</Text>
                  <Text style={styles.expenseMeta}>
                    {friendNameById(item.paidById)} · {item.participantIds.length} {t('expense.splitBetween').toLowerCase()}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>{formatMoney(item.amount, currency)}</Text>
                <Pressable onPress={() => handleRemoveExpense(item)} hitSlop={10} style={styles.deleteIcon}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            </Card>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Button
        label={t('friends.viewBalances')}
        onPress={() => navigation.navigate('FriendsBalances', { tripId })}
        disabled={friends.length === 0}
        style={styles.balancesBtn}
      />

      <FormSheet
        visible={friendSheetVisible}
        title={t('friends.addFriend')}
        onCancel={() => setFriendSheetVisible(false)}
        onSubmit={handleAddFriend}
        submitLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextField label={t('friends.friendName')} value={friendName} onChangeText={setFriendName} error={friendError} />
      </FormSheet>

      <FormSheet
        visible={expenseSheetVisible}
        title={editingExpenseId ? t('expense.editTitle') : t('expense.title')}
        onCancel={() => setExpenseSheetVisible(false)}
        onSubmit={handleSubmitExpense}
        submitLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextField
          label={t('expense.description')}
          value={description}
          onChangeText={setDescription}
          error={expenseErrors.description}
        />
        <TextField
          label={t('expense.amount', { currency })}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          error={expenseErrors.amount}
        />

        <Text style={styles.fieldLabel}>{t('expense.paidBy')}</Text>
        <View style={styles.chipsWrap}>
          {friends.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.selectChip, paidById === f.id && styles.selectChipActive]}
              onPress={() => setPaidById(f.id)}
            >
              <Text style={[styles.selectChipText, paidById === f.id && styles.selectChipTextActive]}>
                {f.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>{t('expense.splitBetween')}</Text>
        <View style={styles.chipsWrap}>
          {friends.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.selectChip, participantIds.includes(f.id) && styles.selectChipActive]}
              onPress={() => toggleParticipant(f.id)}
            >
              <Text
                style={[styles.selectChipText, participantIds.includes(f.id) && styles.selectChipTextActive]}
              >
                {f.name}
              </Text>
            </Pressable>
          ))}
        </View>
        {expenseErrors.participants ? <Text style={styles.errorText}>{expenseErrors.participants}</Text> : null}

        <View style={styles.chipsWrap}>
          <Pressable
            style={[styles.toggleChip, splitType === 'equal' && styles.selectChipActive]}
            onPress={() => setSplitType('equal')}
          >
            <Text style={[styles.selectChipText, splitType === 'equal' && styles.selectChipTextActive]}>
              {t('expense.splitEqually')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleChip, splitType === 'custom' && styles.selectChipActive]}
            onPress={() => setSplitType('custom')}
          >
            <Text style={[styles.selectChipText, splitType === 'custom' && styles.selectChipTextActive]}>
              {t('expense.splitCustom')}
            </Text>
          </Pressable>
        </View>

        {splitType === 'custom' &&
          participantIds.map((pid) => (
            <TextField
              key={pid}
              label={friendNameById(pid)}
              value={customShares[pid] ?? ''}
              onChangeText={(v) => setCustomShares((prev) => ({ ...prev, [pid]: v }))}
              keyboardType="decimal-pad"
            />
          ))}
        {expenseErrors.custom ? <Text style={styles.errorText}>{expenseErrors.custom}</Text> : null}
      </FormSheet>
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
  },
  friendsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  friendChipText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  emptyInline: {
    color: colors.textMuted,
    fontSize: 13,
  },
  addFriendBtn: {
    marginTop: 12,
    marginBottom: 20,
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexGrow: { flexGrow: 1 },
  expenseCard: {
    padding: 14,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: { flex: 1 },
  expenseDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  expenseMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginEnd: 8,
  },
  deleteIcon: {
    marginStart: 4,
  },
  separator: {
    height: 12,
  },
  balancesBtn: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectChipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  selectChipTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
});
