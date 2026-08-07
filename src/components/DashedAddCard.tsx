import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { radii } from '../theme/typography';

interface DashedAddCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}

export function DashedAddCard({ title, subtitle, onPress, disabled }: DashedAddCardProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.card, disabled && styles.disabled]}>
      <View style={styles.iconCircle}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </View>
      <AppText weight="bold" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
