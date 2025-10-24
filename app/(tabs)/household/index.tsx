import { getHouseholds, householdKeys } from '@/api/household';
import CreateHouseholdModal from '@/app/(tabs)/household/components/CreateHouseholdModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import JoinHouseholdModal from '@/app/(tabs)/household/components/JoinHouseholdModal';
import { AvatarKey } from '@/app/utils/avatar';
import { HouseholdList } from './components/HouseholdList';
import { AppHeader } from '@/app/components/AppHeader';
import { useHouseholdMutations } from '@/hooks/useHouseholdMutations';

export default function HouseholdScreen() {
  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid ?? null;
  const { createHouseholdMutation, joinHouseholdMutation } = useHouseholdMutations(userId ?? '');

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

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
      <Stack.Screen options={{ headerShown: false }} />
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
          createHouseholdMutation.reset();
        }}
        onSubmit={(name) => {
          if (!userId) return;
          createHouseholdMutation.mutate(name);
        }}
        pending={createHouseholdMutation.isPending}
        error={
          createHouseholdMutation.error ? (createHouseholdMutation.error as Error).message : null
        }
        result={createHouseholdMutation.data ?? null}
      />
      <JoinHouseholdModal
        visible={joinOpen}
        onClose={() => {
          setJoinOpen(false);
          joinHouseholdMutation.reset();
        }}
        onSubmit={(code) => userId && joinHouseholdMutation.mutate(code)}
        pending={joinHouseholdMutation.isPending}
        error={joinHouseholdMutation.error ? (joinHouseholdMutation.error as Error).message : null}
        result={joinHouseholdMutation.data ?? null}
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
