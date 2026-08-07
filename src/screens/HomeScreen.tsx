import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12}>
          <Ionicons name="settings-outline" size={26} color={colors.text} />
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('GatheringList')}>
        <Card style={styles.optionCard}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="people-circle-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.optionTitle}>{t('home.familyGathering')}</Text>
          <Text style={styles.optionDesc}>{t('home.familyGatheringDesc')}</Text>
        </Card>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('TripList')}>
        <Card style={[styles.optionCard, styles.secondCard]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondaryLight }]}>
            <Ionicons name="person-add-outline" size={32} color={colors.secondary} />
          </View>
          <Text style={styles.optionTitle}>{t('home.friends')}</Text>
          <Text style={styles.optionDesc}>{t('home.friendsDesc')}</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginEnd: 12,
  },
  optionCard: {
    alignItems: 'flex-start',
    paddingVertical: 24,
  },
  secondCard: {
    marginTop: 16,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  optionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  optionDesc: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
