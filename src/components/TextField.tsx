import React from 'react';
import { I18nManager, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { AppText } from './AppText';
import { useTranslation } from '../i18n/useTranslation';
import { colors } from '../theme/colors';
import { fonts, radii } from '../theme/typography';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
}

export function TextField({ label, error, prefix, style, ...rest }: TextFieldProps) {
  const { language } = useTranslation();
  const fontFamily = language === 'ar' ? undefined : fonts.regular;

  return (
    <View style={styles.container}>
      <AppText weight="semiBold" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {prefix ? (
          <AppText weight="medium" style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          style={[
            styles.input,
            fontFamily ? { fontFamily } : null,
            prefix ? styles.inputWithPrefix : null,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
          {...rest}
        />
      </View>
      {error ? (
        <AppText weight="medium" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.danger,
  },
  prefix: {
    color: colors.textMuted,
    fontSize: 16,
    marginEnd: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputWithPrefix: {
    paddingStart: 0,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
