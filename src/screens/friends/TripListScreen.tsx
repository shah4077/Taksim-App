import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { FormSheet } from '../../components/FormSheet';
import { DashedAddCard } from '../../components/DashedAddCard';
import { Badge, type BadgeTone } from '../../components/Badge';
import { PageTitle } from '../../components/PageTitle';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { useTranslation } from '../../i18n/useTranslation';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/typography';
import { useTripStore, MAX_TRIPS, type Trip } from '../../state/useTripStore';
import { useFriendsStore } from '../../state/useFriendsStore';
import {
  formatDateDisplay,
  formatDateRange,
  fromDateKey,
  getDateStatus,
  toDateKey,
  type DateStatus,
} from '../../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>;

type ActiveField = 'start' | 'end' | null;

const CARD_THEMES: { bg: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { bg: colors.secondary, icon: 'airplane' },
  { bg: colors.accent, icon: 'restaurant' },
  { bg: colors.primary, icon: 'trail-sign' },
];

const STATUS_STYLES: Record<DateStatus, BadgeTone> = {
  thisWeek: 'mint',
  upcoming: 'blue',
  planning: 'neutral',
  past: 'neutral',
};

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
        ListHeaderComponent={<PageTitle title={t('trips.title')} subtitle={t('trips.subtitle')} />}
        ListEmptyComponent={<EmptyState message={t('trips.emptyState')} />}
        contentContainerStyle={trips.length === 0 && styles.flexGrow}
        renderItem={({ item, index }) => {
          const participantCount = friendsByTrip[item.id]?.length ?? 0;
          const dateRange = formatDateRange(item.startDate, item.endDate, language);
          const theme = CARD_THEMES[index % CARD_THEMES.length];
          const status = getDateStatus(item.startDate ?? item.endDate);
          return (
            <Pressable
              onPress={() => navigation.navigate('FriendsGroup', { tripId: item.id, tripName: item.name })}
            >
              <Card style={styles.card}>
                <View style={styles.topRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.bg }]}>
                    <Ionicons name={theme.icon} size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.topRowRight}>
                    <Badge label={t(`common.status${capitalize(status)}`)} tone={STATUS_STYLES[status]} />
                    <Pressable onPress={() => handleRemove(item)} hitSlop={10} style={styles.deleteIcon}>
                      <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                    </Pressable>
                  </View>
                </View>

                <AppText weight="bold" style={styles.name}>
                  {item.name}
                </AppText>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <AppText style={styles.dateText}>{dateRange ?? t('trips.noDates')}</AppText>
                </View>

                <View style={styles.divider} />

                <View style={styles.bottomRow}>
                  <AppText weight="semiBold" style={styles.countText}>
                    {t('trips.participantsCount', { count: participantCount })}
                  </AppText>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={trips.length > 0 && styles.footerSpacing}>
            <DashedAddCard
              title={t('trips.addTrip')}
              subtitle={t('trips.addSubtitle')}
              onPress={openAddSheet}
              disabled={!canAdd}
            />
            {!canAdd && <AppText style={styles.maxNotice}>{t('trips.maxReached', { max: MAX_TRIPS })}</AppText>}
          </View>
        }
      />

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
        {errors.date ? (
          <AppText weight="medium" style={styles.errorText}>
            {errors.date}
          </AppText>
        ) : null}
      </FormSheet>
    </Screen>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
      <AppText weight="semiBold" style={styles.fieldLabel}>
        {label}
      </AppText>
      <Pressable style={styles.dateInput} onPress={onPress}>
        <AppText style={dateKey ? styles.dateInputText : styles.datePlaceholder}>
          {dateKey ? formatDateDisplay(dateKey, language) : placeholder}
        </AppText>
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
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteIcon: {
    padding: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  countText: {
    fontSize: 13,
    color: colors.text,
  },
  separator: {
    height: 12,
  },
  footerSpacing: {
    marginTop: 4,
  },
  maxNotice: {
    color: colors.warning,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  dateFieldWrap: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  dateInputText: {
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
