import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HeaderProfileButton() {
  const navigation = useNavigation<Nav>();
  return (
    <Pressable style={styles.circle} onPress={() => navigation.navigate('Settings')} hitSlop={8}>
      <Ionicons name="person" size={16} color={colors.primary} />
    </Pressable>
  );
}

export function HeaderMenuButton() {
  const navigation = useNavigation<Nav>();
  return (
    <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10} style={styles.menuButton}>
      <Ionicons name="menu" size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    paddingHorizontal: 4,
  },
});
