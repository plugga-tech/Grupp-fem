import { useTheme } from '@/state/ThemeContext';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  pending?: boolean;
  error?: string | null;
  result?: { name: string; code?: string } | null;
}

export default function CreateHouseholdModal({
  visible,
  onClose,
  onSubmit,
  pending,
  error,
  result,
}: Props) {
  const [name, setName] = useState('');
  const { colors } = useTheme();
  useEffect(() => {
    if (visible && !result) {
      setName('');
    }
  }, [visible, result]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          {!result ? (
            <>
              <Text style={styles.modalTitle}>Skapa nytt hushåll</Text>
              <TextInput
                style={styles.input}
                placeholder="Namn på hushåll"
                value={name}
                onChangeText={setName}
                editable={!pending}
                autoFocus
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.buttonPrimary },
                  (!name.trim() || pending) && { opacity: 0.5 },
                ]}
                onPress={() => onSubmit(name.trim())}
                disabled={!name.trim() || pending}
              >
                {pending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>Skapa</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>Hushåll skapat!</Text>
              <Text style={styles.modalBody}>
                <Text style={{ fontWeight: '600' }}>Namn: </Text>
                {result.name}
              </Text>
              {result.code && (
                <Text style={styles.modalBody}>
                  <Text style={{ fontWeight: '600' }}>Kod: </Text>
                  {result.code}
                </Text>
              )}
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.buttonPrimary }]}
                onPress={onClose}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    gap: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBody: { fontSize: 16 },
  modalBtn: {
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnText: { color: 'white', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 4,
  },
  error: {
    color: 'red',
    marginBottom: 4,
    fontSize: 14,
  },
});
