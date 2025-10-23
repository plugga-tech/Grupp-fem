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

 
}

