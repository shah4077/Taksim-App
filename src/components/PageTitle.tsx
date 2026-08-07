import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';

interface PageTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  align?: 'left' | 'center';
}

export function PageTitle({ eyebrow, title, subtitle, titleColor, align = 'left' }: PageTitleProps) {
  const textAlign = align === 'center' ? 'center' : undefined;
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <AppText weight="semiBold" style={[styles.eyebrow, { textAlign }]}>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText weight="extraBold" style={[styles.title, { textAlign }, titleColor ? { color: titleColor } : null]}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText style={[styles.subtitle, { textAlign }]}>{subtitle}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    color: colors.text,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
});
