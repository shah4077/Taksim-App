import React, { PropsWithChildren } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { radii } from '../theme/typography';
import { AppText } from './AppText';
import { Button } from './Button';
import { ScrollView, KeyboardAvoidingView } from 'react-native';

interface FormSheetProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel: string;
  submitDisabled?: boolean;
}

export function FormSheet({
  visible,
  title,
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel,
  submitDisabled,
  children,
}: PropsWithChildren<FormSheetProps>) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
              <AppText weight="bold" style={styles.title}>
                {title}
              </AppText>
              {children}
              <View style={styles.actions}>
                <Button label={cancelLabel} onPress={onCancel} variant="outline" style={styles.actionButton} />
                <Button
                  label={submitLabel}
                  onPress={onSubmit}
                  disabled={submitDisabled}
                  style={styles.actionButton}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 27, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 19,
    color: colors.text,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
