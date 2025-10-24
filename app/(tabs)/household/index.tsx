import {
  createHousehold,
  getHouseholds,
  householdKeys,
  joinHouseholdByCode,
} from '@/api/household';
import CreateHouseholdModal from '@/app/(tabs)/household/components/CreateHouseholdModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import React, { useState } from 'react';
import JoinHouseholdModal from '@/app/(tabs)/household/components/JoinHouseholdModal';
import { AvatarKey } from '@/app/utils/avatar';
import { HouseholdList } from './components/HouseholdList';
import { AppHeader } from '@/app/components/AppHeader';

export default function HouseholdScreen() {
  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid ?? null;

  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (name: string) => createHousehold({ name, ownerId: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.list(userId!) });
    },
  });
  const joinMutation = useMutation({
    mutationFn: (code: string) => joinHouseholdByCode({ code, userId: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.list(userId!) });
    },
  });

  type Household = {
    id: string;
    name?: string;
    code?: string;
    avatar?: AvatarKey;
    membersCount?: number;
  };

  const { data: household = [], error } = useQuery<Household[]>({
    queryKey: householdKeys.list(userId || ''),
    enabled: !!userId,
    queryFn: () => getHouseholds(userId!),
  });

  if (error) return <Text>Kunde inte hämta hushåll.</Text>;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Dina hushåll"
        rightActions={[{ icon: 'account', onPress: () => {} }]}
        leftAction={{ icon: 'chevron-left', onPress: () => router.back() }}
      />

      <HouseholdList
        households={household}
        onHouseholdPress={(item) =>
          router.push({
            pathname: '/household/details/[id]',
            params: { id: item.id, name: item.name, code: item.code },
          })
        }
        onCreatePress={() => setCreateOpen(true)}
        onJoinPress={() => setJoinOpen(true)}
      />

      <CreateHouseholdModal
        visible={createOpen}
        onClose={() => {
          setCreateOpen(false);
          createMutation.reset();
        }}
        onSubmit={(name) => {
          if (!userId) return;
          createMutation.mutate(name);
        }}
        pending={createMutation.isPending}
        error={createMutation.error ? (createMutation.error as Error).message : null}
        result={createMutation.data ?? null}
      />
      <JoinHouseholdModal
        visible={joinOpen}
        onClose={() => {
          setJoinOpen(false);
          joinMutation.reset();
        }}
        onSubmit={(code) => userId && joinMutation.mutate(code)}
        pending={joinMutation.isPending}
        error={joinMutation.error ? (joinMutation.error as Error).message : null}
        result={joinMutation.data ?? null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 2,
  },
});
