import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChore } from '../../../api/chores';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { currentHouseholdAtom } from '../../../atoms';

export default function CreateChoreScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState(7);
  const [weight, setWeight] = useState(2);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: createChore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 2000);
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
    <View style={styles.container}>

      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24}
          onPress={() => router.back()}
          style={{ margin: 0 }}
        />
        <Text style={styles.headerTitle}>Skapa ny syssla</Text>
        <View style={{ width: 48 }} />
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
            <View style={styles.numberBadge}>
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

     