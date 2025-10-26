import { getHouseholds, householdKeys } from '@/api/household';
import AppHeader from '@/components/AppHeader';
import CreateHouseholdModal from '@/components/CreateHouseholdModal';
import JoinHouseholdModal from '@/components/JoinHouseholdModal';
import { useActiveHousehold } from '@/contexts/ActiveHouseholdContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useHouseholdMutations } from '@/hooks/useHouseholdMutations';
import { AvatarKey } from '@/utils/avatar';
import { useQuery } from '@tanstack/react-query';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { HouseholdList } from '../../../components/HouseholdList';

export default function HouseholdScreen() {
  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid ?? null;
  const { createHouseholdMutation, joinHouseholdMutation } = useHouseholdMutations(userId ?? '');
  const { activeHouseholdId, setActiveHouseholdId } = useActiveHousehold();
  const { colors } = useTheme();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  type Household = {
    id: string;
    name?: string;
    code?: string;
    avatar?: AvatarKey;
    membersCount?: number;
  };

  const {
    data: household = [],
    error,
    refetch,
  } = useQuery<Household[]>({
    queryKey: householdKeys.list(userId || ''),
    enabled: !!userId,
    queryFn: () => getHouseholds(userId!),
    refetchOnWindowFocus: true, // Correct property name
  });

  // Set first household as active by default
  useEffect(() => {
    const householdList = household as Household[];
    if (householdList.length > 0 && !activeHouseholdId) {
      setActiveHouseholdId(householdList[0].id);
    }
  }, [household, activeHouseholdId, setActiveHouseholdId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleSetActiveHousehold = (selectedHousehold: any) => {
    setActiveHouseholdId(selectedHousehold.id);
    Alert.alert(
      'Hushåll Aktiverat',
      `"${selectedHousehold.name}" är nu ditt aktiva hushåll. Du kan se detta i din profil.`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.push('/profile');
          },
        },
      ],
    );
  };

  if (error) return <Text>Kunde inte hämta hushåll.</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader
        title="Dina hushåll"
        rightActions={[{ icon: 'account', onPress: () => router.push('/(tabs)/profile') }]}
        leftAction={{ icon: 'chevron-left', onPress: () => router.back() }}
      />

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
