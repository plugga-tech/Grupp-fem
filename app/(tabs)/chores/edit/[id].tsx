import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deleteChore, getChoresWithStatus, updateChore } from '../../../../api/chores';
import { currentHouseholdAtom } from '../../../../atoms';
import AppHeader from '@/components/AppHeader';

export default function EditChoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState(7);
  const [weight, setWeight] = useState(2);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const { data: chores, isLoading } = useQuery({
    queryKey: ['chores', activeHouseholdId],
    queryFn: () => getChoresWithStatus(activeHouseholdId || ''),
    enabled: !!activeHouseholdId,
  });

  const chore = chores?.find((c) => c.id === id);
  
  useEffect(() => {
    if (chore) {
      setName(chore.name);
      setDescription(chore.description);
      setFrequency(chore.frequency);
      setWeight(chore.weight);
    }
  }, [chore]);

  const updateMutation = useMutation({
    mutationFn: () => updateChore(id as string, {
      name: name.trim(),
      description: description.trim(),
      frequency: frequency,
      weight: weight,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        router.push(`/chores/details/${id}`);
      }, 2000);
    },
    onError: (error) => {
      console.error(error);
      Alert.alert('Fel', 'Kunde inte uppdatera sysslan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteChore(id as string),
    onSuccess: () => {
      setShowDeleteToast(true);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['chores'] });
        setShowDeleteToast(false);
        router.replace('/(tabs)/chores');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error deleting chore:', error);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Fel', 'Ange ett namn för sysslan');
      return;
    }

    updateMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const frequencyOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const weightOptions = [1, 2, 4, 6, 8];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!chore) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Ändra syssla"
        rightActions={[{
          icon: 'delete-outline',
          onPress: handleDelete
        }]}
      />

      <ScrollView style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Titel"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#C0C0C0"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Beskrivning"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#C0C0C0"
        />

        <TouchableOpacity 
          style={styles.card}
          onPress={() => setShowFrequencyPicker(true)}
        >
          <Text style={styles.cardLabel}>Återkommer:</Text>
          <View style={styles.frequencyContainer}>
            <Text style={styles.varText}>var</Text>
            <View style={styles.numberBadgeGreen}>
              <Text style={styles.numberBadgeText}>{frequency}</Text>
            </View>
            <Text style={styles.varText}>dag</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => setShowWeightPicker(true)}
        >
          <View>
            <Text style={styles.cardLabel}>Värde:</Text>
            <Text style={styles.cardSubtitle}>Hur energikrävande är sysslan?</Text>
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
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Återkommer väljare</Text>
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
                  style={[
                    styles.pickerItem,
                    frequency === num && styles.pickerItemActive
                  ]}
                >
                  <Text style={[
                    styles.pickerText,
                    frequency === num && styles.pickerTextActive
                  ]}>
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
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Värde väljare</Text>
            <View style={styles.weightPickerRow}>
              {weightOptions.map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    setWeight(num);
                    setShowWeightPicker(false);
                  }}
                  style={[
                    styles.weightPickerItem,
                    weight === num && styles.weightPickerItemActive
                  ]}
                >
                  <Text style={[
                    styles.pickerText,
                    weight === num && styles.pickerTextActive
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {showSuccessToast && (
        <View style={styles.successToast}>
          <Text style={styles.successToastText}>✅ Sysslan har sparats</Text>
        </View>
      )}
      {showDeleteToast && (
        <View style={styles.deleteToast}>
          <Text style={styles.deleteToastText}>🗑️ Sysslan har tagits bort</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={updateMutation.isPending || deleteMutation.isPending}
        >
          <View style={styles.circleIcon}>
            <Text style={styles.checkIcon}>+</Text>
          </View>
          <Text style={styles.saveButtonText}>Spara</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.push(`/chores/details/${id}`)}
          disabled={updateMutation.isPending || deleteMutation.isPending}
        >
          <View style={[styles.circleIcon, styles.circleIconDark]}>
            <Text style={[styles.checkIcon, styles.checkIconDark]}>×</Text>
          </View>
          <Text style={styles.closeButtonText}>Stäng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  varText: {
    fontSize: 16,
    color: '#000',
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
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  circleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  circleIconDark: {
    borderColor: '#000',
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: -2,
  },
  checkIconDark: {
    color: '#000',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E0E0E0',
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
    color: '#666',
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
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightPickerItemActive: {
    backgroundColor: '#9E9E9E',
  },
  successToast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successToastText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  deleteToast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteToastText: {
    fontSize: 16,
    color: '#C62828',
    fontWeight: '600',
  },
});