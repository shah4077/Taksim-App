import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { radii } from '../theme/typography';

export function HintBanner({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="bulb-outline" size={20} color={colors.primary} style={styles.icon} />
      <AppText style={styles.text}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 16,
  },
  icon: {
    marginEnd: 10,
    marginTop: 1,
  },
  text: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 18,
  },
});
