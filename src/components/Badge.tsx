import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';

export type BadgeTone = 'mint' | 'blue' | 'neutral';

interface BadgeProps {
  label: string;
  tone: BadgeTone;
  icon?: ReactNode;
}

const TONES: Record<BadgeTone, { bg: string; text: string }> = {
  mint: { bg: colors.primaryLight, text: colors.primary },
  blue: { bg: colors.secondaryLight, text: colors.secondary },
  neutral: { bg: colors.neutralLight, text: colors.neutral },
};

export function Badge({ label, tone, icon }: BadgeProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon}
      <AppText weight="semiBold" style={[styles.label, { color: t.text }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
  },
});
