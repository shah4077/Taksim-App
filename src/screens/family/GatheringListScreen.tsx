import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
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
import { useGatheringStore, MAX_GATHERINGS, type Gathering } from '../../state/useGatheringStore';
import { useFamilyStore } from '../../state/useFamilyStore';
import { formatDateDisplay, fromDateKey, toDateKey } from '../../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'GatheringList'>;

export function GatheringListScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const gatherings = useGatheringStore((s) => s.gatherings);
  const addGathering = useGatheringStore((s) => s.addGathering);
  const removeGathering = useGatheringStore((s) => s.removeGathering);
  const familiesByGathering = useFamilyStore((s) => s.familiesByGathering);
  const removeGatheringFamilies = useFamilyStore((s) => s.removeGatheringFamilies);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [name, setName] = useState('');
  const [dateKey, setDateKey] = useState<string | undefined>(undefined);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function openAddSheet() {
    setName('');
    setDateKey(undefined);
    setShowIosPicker(false);
    setError(undefined);
    setSheetVisible(true);
  }

  function handleOpenDatePicker() {
    const initial = dateKey ? fromDateKey(dateKey) : new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        onChange: (_event, selected) => {
          if (selected) setDateKey(toDateKey(selected));
        },
      });
    } else {
      setShowIosPicker((prev) => !prev);
    }
  }

  function handleSave() {
    const trimmed = name.trim();
    const duplicate = gatherings.some((g) => g.name.toLowerCase() === trimmed.toLowerCase());
    if (!trimmed || duplicate) {
      setError(t('gatherings.duplicateName'));
      return;
    }
    addGathering(trimmed, dateKey);
    setSheetVisible(false);
  }

  function handleRemove(gathering: Gathering) {
    Alert.alert(
      t('gatherings.removeConfirmTitle'),
      t('gatherings.removeConfirmMessage', { name: gathering.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            removeGathering(gathering.id);
            removeGatheringFamilies(gathering.id);
          },
        },
      ]
    );
  }

  const canAdd = gatherings.length < MAX_GATHERINGS;

  return (
    <Screen>
      <FlatList
        data={gatherings}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t('gatherings.emptyState')} />}
        contentContainerStyle={gatherings.length === 0 && styles.flexGrow}
        renderItem={({ item }) => {
          const familyCount = familiesByGathering[item.id]?.length ?? 0;
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('FamilyList', { gatheringId: item.id, gatheringName: item.name })
              }
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.date ? formatDateDisplay(item.date, language) : t('gatherings.noDate')} ·{' '}
                      {t('gatherings.familiesCount', { count: familyCount })}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleRemove(item)} hitSlop={10} style={styles.deleteIcon}>
                    <Ionicons name="trash-outline" size={22} color={colors.danger} />
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {!canAdd && <Text style={styles.maxNotice}>{t('gatherings.maxReached', { max: MAX_GATHERINGS })}</Text>}

      <Button
        label={t('gatherings.addGathering')}
        onPress={openAddSheet}
        disabled={!canAdd}
        style={styles.addButton}
      />

      <FormSheet
        visible={sheetVisible}
        title={t('gatherings.addGathering')}
        onCancel={() => setSheetVisible(false)}
        onSubmit={handleSave}
        submitLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextField label={t('gatherings.name')} value={name} onChangeText={setName} error={error} />

        <Text style={styles.fieldLabel}>{t('gatherings.date')}</Text>
        <Pressable style={styles.dateInput} onPress={handleOpenDatePicker}>
          <Text style={dateKey ? styles.dateText : styles.datePlaceholder}>
            {dateKey ? formatDateDisplay(dateKey, language) : t('gatherings.datePlaceholder')}
          </Text>
          {dateKey ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                setDateKey(undefined);
                setShowIosPicker(false);
              }}
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          ) : (
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          )}
        </Pressable>

        {Platform.OS === 'ios' && showIosPicker && (
          <DateTimePicker
            value={dateKey ? fromDateKey(dateKey) : new Date()}
            mode="date"
            display="inline"
            onChange={(_event, selected) => {
              if (selected) setDateKey(toDateKey(selected));
            }}
          />
        )}
      </FormSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexGrow: { flexGrow: 1 },
  card: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteIcon: {
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
  addButton: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  datePlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
