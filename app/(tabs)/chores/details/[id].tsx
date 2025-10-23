import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { completeChore, deleteChore, getChoresWithStatus } from '../../../../api/chores';
import { currentHouseholdAtom, currentUserAtom } from '../../../../atoms';

export default function ChoreDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const [currentUser] = useAtom(currentUserAtom);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const { data: chores, isLoading } = useQuery({
    queryKey: ['chores', currentHousehold?.id],
    queryFn: () => getChoresWithStatus(currentHousehold?.id || ''),
    enabled: !!currentHousehold?.id,
  });

  const chore = chores?.find((c) => c.id === id);

  // Kolla om användaren har gjort sysslan idag
  const isCompletedToday = chore?.last_completed_at 
    ? Math.floor((Date.now() - chore.last_completed_at.getTime()) / (1000 * 60 * 60 * 24)) === 0
    : false;

  const completeMutation = useMutation({
    mutationFn: () => completeChore(
      id as string,
      currentHousehold?.id || '',
      currentUser?.id || ''
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError: (error) => {
      console.error('Error completing chore:', error);
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
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24}
          onPress={() => router.back()}
          style={{ margin: 0 }}
        />
        <Text style={styles.headerTitle}>Sysslans information</Text>
        
        {isCompletedToday ? (
          <IconButton 
            icon="delete-outline"
            size={24}
            onPress={() => deleteMutation.mutate()}
            style={{ margin: 0 }}
            iconColor="#CD5D6F"
            disabled={deleteMutation.isPending}
          />
        ) : (
          <IconButton 
            icon="lead-pencil"
            size={24}
            onPress={() => router.push(`/chores/edit/${chore.id}`)}
            style={{ margin: 0 }}
            iconColor="#4A90E2"
          />
        )}
      </View>

     