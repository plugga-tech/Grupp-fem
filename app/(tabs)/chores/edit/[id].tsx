import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChoresWithStatus, updateChore, deleteChore } from '../../../../api/chores';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { currentHouseholdAtom } from '../../../../atoms';

export default function EditChoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState(7);
  const [weight, setWeight] = useState(2);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const { data: chores, isLoading } = useQuery({
    queryKey: ['chores', currentHousehold?.id],
    queryFn: () => getChoresWithStatus(currentHousehold?.id || ''),
    enabled: !!currentHousehold?.id,
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
        router.replace('/chores');
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

      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24}
          onPress={() => router.back()}
          style={{ margin: 0 }}
        />
        <Text style={styles.headerTitle}>Ändra syssla</Text>
        <IconButton 
          icon="delete-outline" 
          size={24}
          onPress={handleDelete}
          style={{ margin: 0 }}
          iconColor="#CD5D6F"
          disabled={deleteMutation.isPending}
        />
      </View>

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

      {/* Frequency Picker Modal */}
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

      