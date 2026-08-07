import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTranslation } from '../i18n/useTranslation';
import { fonts } from '../theme/typography';

type Weight = 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';

interface AppTextProps extends TextProps {
  weight?: Weight;
}

/**
 * Poppins (used for the app's headline look) has no Arabic glyphs, so
 * Arabic text falls back to the platform's default font — which does
 * support Arabic — instead of rendering tofu boxes. English/LTR text gets
 * Poppins at the requested weight.
 */
export function AppText({ weight = 'regular', style, ...rest }: AppTextProps) {
  const { language } = useTranslation();
  const fontFamily = language === 'ar' ? undefined : fonts[weight];
  return <Text style={[fontFamily ? { fontFamily } : null, style]} {...rest} />;
}
