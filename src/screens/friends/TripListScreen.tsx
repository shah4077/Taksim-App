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
import { useTripStore, MAX_TRIPS, type Trip } from '../../state/useTripStore';
import { useFriendsStore } from '../../state/useFriendsStore';
import { formatDateDisplay, formatDateRange, fromDateKey, toDateKey } from '../../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>;

type ActiveField = 'start' | 'end' | null;

export function TripListScreen({ navigation }: Props) {
  const { t, language } = useTranslation();
  const trips = useTripStore((s) => s.trips);
  const addTrip = useTripStore((s) => s.addTrip);
  const removeTrip = useTripStore((s) => s.removeTrip);
  const friendsByTrip = useFriendsStore((s) => s.friendsByTrip);
  const removeTripData = useFriendsStore((s) => s.removeTripData);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [name, setName] = useState('');
  const [startDateKey, setStartDateKey] = useState<string | undefined>(undefined);
  const [endDateKey, setEndDateKey] = useState<string | undefined>(undefined);
  const [iosPickerField, setIosPickerField] = useState<ActiveField>(null);
  const [errors, setErrors] = useState<{ name?: string; date?: string }>({});

  function openAddSheet() {
    setName('');
    setStartDateKey(undefined);
    setEndDateKey(undefined);
    setIosPickerField(null);
    setErrors({});
    setSheetVisible(true);
  }

  function handleOpenDatePicker(field: ActiveField) {
    const currentKey = field === 'start' ? startDateKey : endDateKey;
    const initial = currentKey ? fromDateKey(currentKey) : new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        onChange: (_event, selected) => {
          if (!selected) return;
          const key = toDateKey(selected);
          if (field === 'start') setStartDateKey(key);
          else setEndDateKey(key);
        },
      });
    } else {
      setIosPickerField((prev) => (prev === field ? null : field));
    }
  }

  function handleSave() {
    const trimmed = name.trim();
    const nextErrors: typeof errors = {};

    const duplicate = trips.some((trip) => trip.name.toLowerCase() === trimmed.toLowerCase());
    if (!trimmed || duplicate) {
      nextErrors.name = t('trips.duplicateName');
    }
    if (startDateKey && endDateKey && endDateKey < startDateKey) {
      nextErrors.date = t('trips.invalidDateRange');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    addTrip(trimmed, startDateKey, endDateKey);
    setSheetVisible(false);
  }

  function handleRemove(trip: Trip) {
    Alert.alert(t('trips.removeConfirmTitle'), t('trips.removeConfirmMessage', { name: trip.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeTrip(trip.id);
          removeTripData(trip.id);
        },
      },
    ]);
  }

  const canAdd = trips.length < MAX_TRIPS;

  return (
    <Screen>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t('trips.emptyState')} />}
        contentContainerStyle={trips.length === 0 && styles.flexGrow}
        renderItem={({ item }) => {
          const participantCount = friendsByTrip[item.id]?.length ?? 0;
          const dateRange = formatDateRange(item.startDate, item.endDate, language);
          return (
            <Pressable
              onPress={() => navigation.navigate('FriendsGroup', { tripId: item.id, tripName: item.name })}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {dateRange ?? t('trips.noDates')} · {t('trips.participantsCount', { count: participantCount })}
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

      {!canAdd && <Text style={styles.maxNotice}>{t('trips.maxReached', { max: MAX_TRIPS })}</Text>}

      <Button label={t('trips.addTrip')} onPress={openAddSheet} disabled={!canAdd} style={styles.addButton} />

      <FormSheet
        visible={sheetVisible}
        title={t('trips.addTrip')}
        onCancel={() => setSheetVisible(false)}
        onSubmit={handleSave}
        submitLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextField label={t('trips.name')} value={name} onChangeText={setName} error={errors.name} />

        <DateField
          label={t('trips.startDate')}
          dateKey={startDateKey}
          language={language}
          placeholder={t('trips.datePlaceholder')}
          onPress={() => handleOpenDatePicker('start')}
          onClear={() => {
            setStartDateKey(undefined);
            setIosPickerField(null);
          }}
        />
        {Platform.OS === 'ios' && iosPickerField === 'start' && (
          <DateTimePicker
            value={startDateKey ? fromDateKey(startDateKey) : new Date()}
            mode="date"
            display="inline"
            onChange={(_event, selected) => {
              if (selected) setStartDateKey(toDateKey(selected));
            }}
          />
        )}

        <DateField
          label={t('trips.endDate')}
          dateKey={endDateKey}
          language={language}
          placeholder={t('trips.datePlaceholder')}
          onPress={() => handleOpenDatePicker('end')}
          onClear={() => {
            setEndDateKey(undefined);
            setIosPickerField(null);
          }}
        />
        {Platform.OS === 'ios' && iosPickerField === 'end' && (
          <DateTimePicker
            value={endDateKey ? fromDateKey(endDateKey) : new Date()}
            mode="date"
            display="inline"
            onChange={(_event, selected) => {
              if (selected) setEndDateKey(toDateKey(selected));
            }}
          />
        )}
        {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
      </FormSheet>
    </Screen>
  );
}

function DateField({
  label,
  dateKey,
  language,
  placeholder,
  onPress,
  onClear,
}: {
  label: string;
  dateKey?: string;
  language: 'en' | 'ar';
  placeholder: string;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.dateFieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.dateInput} onPress={onPress}>
        <Text style={dateKey ? styles.dateText : styles.datePlaceholder}>
          {dateKey ? formatDateDisplay(dateKey, language) : placeholder}
        </Text>
        {dateKey ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
        )}
      </Pressable>
    </View>
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
  dateFieldWrap: {
    marginBottom: 4,
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
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
});
