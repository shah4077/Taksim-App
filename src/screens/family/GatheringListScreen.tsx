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
import { useGatheringStore, MAX_GATHERINGS, type Gathering } from '../../state/useGatheringStore';
import { useFamilyStore } from '../../state/useFamilyStore';
import { formatDateDisplay, fromDateKey, getDateStatus, toDateKey, type DateStatus } from '../../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'GatheringList'>;

const CARD_THEMES: { bg: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { bg: colors.primary, icon: 'calendar' },
  { bg: colors.accent, icon: 'cafe' },
  { bg: colors.secondary, icon: 'sparkles' },
];

const STATUS_STYLES: Record<DateStatus, BadgeTone> = {
  thisWeek: 'mint',
  upcoming: 'blue',
  planning: 'neutral',
  past: 'neutral',
};

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
        ListHeaderComponent={<PageTitle title={t('gatherings.title')} subtitle={t('gatherings.subtitle')} />}
        ListEmptyComponent={<EmptyState message={t('gatherings.emptyState')} />}
        contentContainerStyle={gatherings.length === 0 && styles.flexGrow}
        renderItem={({ item, index }) => {
          const familyCount = familiesByGathering[item.id]?.length ?? 0;
          const theme = CARD_THEMES[index % CARD_THEMES.length];
          const status = getDateStatus(item.date);
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('FamilyList', { gatheringId: item.id, gatheringName: item.name })
              }
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
                  <AppText style={styles.dateText}>
                    {item.date ? formatDateDisplay(item.date, language) : t('gatherings.noDate')}
                  </AppText>
                </View>

                <View style={styles.divider} />

                <View style={styles.bottomRow}>
                  <AppText weight="semiBold" style={styles.countText}>
                    {t('gatherings.familiesCount', { count: familyCount })}
                  </AppText>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={gatherings.length > 0 && styles.footerSpacing}>
            <DashedAddCard
              title={t('gatherings.addGathering')}
              subtitle={t('gatherings.addSubtitle')}
              onPress={openAddSheet}
              disabled={!canAdd}
            />
            {!canAdd && (
              <AppText style={styles.maxNotice}>{t('gatherings.maxReached', { max: MAX_GATHERINGS })}</AppText>
            )}
          </View>
        }
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

        <AppText weight="semiBold" style={styles.fieldLabel}>
          {t('gatherings.date')}
        </AppText>
        <Pressable style={styles.dateInput} onPress={handleOpenDatePicker}>
          <AppText style={dateKey ? styles.dateInputText : styles.datePlaceholder}>
            {dateKey ? formatDateDisplay(dateKey, language) : t('gatherings.datePlaceholder')}
          </AppText>
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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
});
