import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PageTitle } from '../components/PageTitle';
import { AppText } from '../components/AppText';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';
import { radii } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <Screen>
      <PageTitle title={t('home.title')} subtitle={t('home.subtitle')} align="center" />

      <Pressable onPress={() => navigation.navigate('GatheringList')}>
        <Card style={styles.optionCard}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
              <Ionicons name="people" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.flex1}>
              <AppText weight="bold" style={styles.optionTitle}>
                {t('home.familyGathering')}
              </AppText>
              <AppText style={styles.optionDesc}>{t('home.familyGatheringDesc')}</AppText>
            </View>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('TripList')}>
        <Card style={[styles.optionCard, styles.secondCard]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="people" size={26} color={colors.primary} />
            </View>
            <View style={styles.flex1}>
              <AppText weight="bold" style={styles.optionTitle}>
                {t('home.friends')}
              </AppText>
              <AppText style={styles.optionDesc}>{t('home.friendsDesc')}</AppText>
            </View>
          </View>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    paddingVertical: 20,
  },
  secondCard: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex1: {
    flex: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 16,
  },
  optionTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 6,
  },
  optionDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
