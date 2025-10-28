import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { completeChore, getChoresWithStatus } from '../../../../api/chores';
import { getHouseholdMembers, householdKeys } from '@/api/household';
import { getAuth } from 'firebase/auth';
import { currentHouseholdAtom } from '../../../../atoms';
import AppHeader from '@/components/AppHeader';

export default function ChoreDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;
  const [showCompleteToast, setShowCompleteToast] = useState(false);

  // Hämta current user från Firebase Auth
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Hämta household members för att kolla om användaren är admin
  const { data: members = [] } = useQuery({
    queryKey: householdKeys.members(activeHouseholdId || ''),
    queryFn: () => getHouseholdMembers(activeHouseholdId || ''),
    enabled: !!activeHouseholdId,
  });

  // Kolla om current user är admin
  const currentMember = members.find((m) => m.userId === userId);
  const isAdmin = currentMember?.isAdmin ?? false;

  const { data: chores, isLoading } = useQuery({
    queryKey: ['chores', activeHouseholdId],
    queryFn: () => getChoresWithStatus(activeHouseholdId || ''),
    enabled: !!activeHouseholdId,
  });

  const chore = chores?.find((c) => c.id === id);

  const completeMutation = useMutation({
    mutationFn: () => completeChore(id as string, activeHouseholdId || '', userId || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      setShowCompleteToast(true);
      setTimeout(() => {
        setShowCompleteToast(false);
        router.push('/(tabs)/chores');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error completing chore:', error);
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
      <AppHeader
        title="Sysslans information"
        leftAction={{ icon: 'arrow-left', onPress: () => router.back() }}
        rightActions={
          isAdmin
            ? [{ icon: 'pen', onPress: () => router.push(`/chores/edit/${chore.id}`) }]
            : undefined
        }
      />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.choreName}>{chore.name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>{chore.description}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Återkommer:</Text>
          <View style={styles.frequencyContainer}>
            <Text style={styles.varText}>var</Text>
            <View
              style={[
                styles.numberBadge,
                chore.is_overdue ? styles.numberBadgeRed : styles.numberBadgeGreen,
              ]}
            >
              <Text style={styles.numberBadgeText}>{chore.frequency}</Text>
            </View>
            <Text style={styles.varText}>dag</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View>
            <Text style={styles.infoLabel}>Värde:</Text>
            <Text style={styles.infoSubtitle}>Hur energikrävande är sysslan?</Text>
          </View>
          <View style={styles.numberBadgeGray}>
            <Text style={styles.numberBadgeText}>{chore.weight}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
        >
          <Text style={styles.completeButtonText}>
            {completeMutation.isPending ? 'Markerar...' : 'Markera som gjord ✓'}
          </Text>
        </TouchableOpacity>
      </View>

      {showCompleteToast && (
        <View style={styles.completeToast}>
          <Text style={styles.completeToastText}>✅ Sysslan är markerad som gjord!</Text>
        </View>
      )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  choreName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  infoCard: {
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
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  infoSubtitle: {
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
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeGreen: {
    backgroundColor: '#6AC08B',
  },
  numberBadgeRed: {
    backgroundColor: '#CD5D6F',
  },
  numberBadgeGray: {
    backgroundColor: '#9E9E9E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  completeButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeToast: {
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
  completeToastText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
