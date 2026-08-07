import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';

export function BrandHeader() {
  return (
    <View style={styles.row}>
      <AppText weight="extraBold" style={styles.word}>
        Taksim
      </AppText>
      <AppText weight="extraBold" style={styles.word}>
        تقسيم
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  word: {
    fontSize: 18,
    color: colors.primary,
  },
});
