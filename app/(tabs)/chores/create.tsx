import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { currentHouseholdAtom } from '../../../atoms';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { choreKeys, createChore } from '../../../api/chores';
import AppHeader from '@/components/AppHeader';
import ActionButton from '@/components/ActionButton';
import { useTheme } from '../../../state/ThemeContext';

export default function CreateChoreScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState(7);
  const [weight, setWeight] = useState(2);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);

  const mutation = useMutation({
    mutationFn: createChore,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: choreKeys.list(variables.household_id),
      });
      router.push('/(tabs)/chores');
    },
    onError: (error) => {
      console.error(error);
      Alert.alert('Fel', 'Kunde inte skapa sysslan');
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Fel', 'Ange ett namn för sysslan');
      return;
    }

    if (!currentHousehold?.id) {
      Alert.alert('Fel', 'Inget hushåll valt');
      return;
    }

    mutation.mutate({
      household_id: currentHousehold.id,
      name: name.trim(),
      description: description.trim(),
      frequency: frequency,
      weight: weight,
    });
  };

  const frequencyOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const weightOptions = [1, 2, 4, 6, 8];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Skapa ny syssla"
      />

      <ScrollView style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Titel"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.textSecondary}
        />

        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Beskrivning"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textSecondary}
        />

        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowFrequencyPicker(true)}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Återkommer:</Text>
          <View style={styles.frequencyContainer}>
            <Text style={[styles.varText, { color: colors.text }]}>var</Text>
            <View style={styles.numberBadgeGreen}>
              <Text style={styles.numberBadgeText}>{frequency}</Text>
            </View>
            <Text style={[styles.varText, { color: colors.text }]}>dag</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowWeightPicker(true)}>
          <View>
            <Text style={[styles.cardLabel, { color: colors.text }]}>Värde:</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Hur energikrävande är sysslan?</Text>
          </View>
          <View style={styles.numberBadgeGray}>
            <Text style={styles.numberBadgeText}>{weight}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showFrequencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFrequencyPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFrequencyPicker(false)}
        >
          <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Återkommer väljare</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickerScroll}
            >
              {frequencyOptions.map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    setFrequency(num);
                    setShowFrequencyPicker(false);
                  }}
                  style={[styles.pickerItem, frequency === num && styles.pickerItemActive, { backgroundColor: frequency === num ? '#6AC08B' : (isDark ? '#333' : '#E0E0E0') }]}
                >
                  <Text style={[styles.pickerText, frequency === num && styles.pickerTextActive, { color: frequency === num ? '#FFFFFF' : colors.textSecondary }]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showWeightPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWeightPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWeightPicker(false)}
        >
          <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Värde väljare</Text>
            <View style={styles.weightPickerRow}>
              {weightOptions.map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    setWeight(num);
                    setShowWeightPicker(false);
                  }}
                  style={[styles.weightPickerItem, weight === num && styles.weightPickerItemActive, { backgroundColor: weight === num ? '#9E9E9E' : (isDark ? '#333' : '#E0E0E0') }]}
                >
                  <Text style={[styles.pickerText, weight === num && styles.pickerTextActive, { color: weight === num ? '#FFFFFF' : colors.textSecondary }]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <ActionButton
          label={mutation.isPending ? 'Sparar…' : 'Spara'}
          icon="plus"
          onPress={() => {
            if (!mutation.isPending) handleSave();
          }}
          backgroundColor={colors.buttonPrimary}
          textColor="#fff"
          style={styles.saveButton}
        />

        <ActionButton
          label="Stäng"
          icon="close"
          onPress={() => {
            if (!mutation.isPending) router.push('/(tabs)/chores');
          }}
          backgroundColor={colors.card}
          textColor={colors.text}
          iconColor={colors.text}
          style={styles.closeButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  varText: {
    fontSize: 16,
  },
  numberBadgeGreen: {
    backgroundColor: '#6AC08B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeGray: {
    backgroundColor: '#9E9E9E',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    columnGap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  closeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 80,
  },
  pickerItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerItemActive: {
    backgroundColor: '#6AC08B',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerTextActive: {
    color: '#FFFFFF',
  },
  weightPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  weightPickerItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightPickerItemActive: {
    backgroundColor: '#9E9E9E',
  },
});