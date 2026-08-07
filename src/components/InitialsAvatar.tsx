import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';

const PALETTE = [colors.primary, colors.accent, colors.secondary];

export function avatarColorFor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

interface InitialsAvatarProps {
  name: string;
  index?: number;
  size?: number;
}

export function InitialsAvatar({ name, index = 0, size = 40 }: InitialsAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const backgroundColor = avatarColorFor(index);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <AppText weight="bold" style={[styles.letter, { fontSize: size * 0.42 }]}>
        {initial}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#FFFFFF',
  },
});
