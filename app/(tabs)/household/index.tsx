import { householdKeys } from '@/api/household';
import { getUserHouseholds, UserHousehold } from '@/api/user';
import { currentHouseholdAtom } from '@/atoms';
import AppHeader from '@/components/AppHeader';
import CreateHouseholdModal from '@/components/CreateHouseholdModal';
import JoinHouseholdModal from '@/components/JoinHouseholdModal';
import { useHouseholdMutations } from '@/hooks/useHouseholdMutations';
import { useTheme } from '@/state/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { useAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HouseholdList, HouseholdSummary } from '../../../components/HouseholdList';

export default function HouseholdScreen() {
  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid ?? null;
  const { createHouseholdMutation, joinHouseholdMutation } = useHouseholdMutations(userId ?? '');
  const [currentHousehold, setCurrentHousehold] = useAtom(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;
  const { colors } = useTheme();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const {
    data: household = [],
    error,
    refetch,
  } = useQuery<UserHousehold[]>({
    queryKey: householdKeys.list(userId || ''),
    enabled: !!userId,
    queryFn: () => getUserHouseholds(userId!),
    refetchOnWindowFocus: true,
  });

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleSetActiveHousehold = (selectedHousehold: HouseholdSummary) => {
    setCurrentHousehold(selectedHousehold as UserHousehold);
    router.push('/(tabs)/chores');
  };

  if (error) return <Text>Kunde inte hämta hushåll.</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader title="Dina hushåll" />

      <HouseholdList
        households={household as any}
        activeHouseholdId={activeHouseholdId}
        onHouseholdPress={(item) =>
          router.push({
            pathname: '/household/details/[id]',
            params: { id: item.id, name: item.name, code: item.code },
          })
        }
        onSetActiveHousehold={handleSetActiveHousehold}
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
