import { createHousehold, getHouseholds, householdKeys } from '@/api/household';
import CreateHouseholdModal from '@/components/CreateHouseholdModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Appbar, Badge, Button, Card, IconButton, List } from 'react-native-paper';
import React, { useState } from 'react';

export default function HouseholdScreen() {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (name: string) => createHousehold({ name, ownerId: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: householdKeys.list(userId!) });
    },
  });

  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid ?? null;

  const [createOpen, setCreateOpen] = useState(false);

  type Household = {
    id: string;
    name?: string;
    code?: string;
  };

  const { data: household = [], error } = useQuery<Household[]>({
    queryKey: householdKeys.list(userId || ''),
    enabled: !!userId,
    queryFn: () => getHouseholds(userId!),
  });

  if (error) return <Text>Kunde inte hämta hushåll.</Text>;

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Dina hushåll" />
        <Appbar.Action icon="account" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hushåll</Text>
        <Badge size={24} style={{ alignSelf: 'center', backgroundColor: 'grey' }}>
          {household.length}
        </Badge>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={household}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} mode="elevated">
            <List.Item
              title={item.name}
              left={() => (
                <IconButton
                  icon="information-outline"
                  size={24}
                  style={{ marginLeft: 10 }}
                  onPress={() =>
                    router.push({
                      pathname: '/household/details/[id]',
                      params: { id: item.id, name: item.name, code: item.code },
                    })
                  }
                  accessibilityLabel="Visa hushållsinformation"
                />
              )}
              right={() => (
                <View style={styles.rightBadges}>
                  <Badge size={24} style={{ alignSelf: 'center', backgroundColor: 'green' }}>
                    🐸
                  </Badge>
                  <Badge size={24} style={{ alignSelf: 'center', backgroundColor: 'grey' }}>
                    3
                  </Badge>
                </View>
              )}
            />
          </Card>
        )}
        ListEmptyComponent={<Text style={{ padding: 16 }}>Inga hushåll ännu.</Text>}
      />
      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          icon="plus"
          style={styles.barBtn}
          onPress={() => setCreateOpen(true)}
        >
          Skapa
        </Button>
        <Button mode="contained" icon="key-variant" style={styles.barBtn} onPress={() => {}}>
          Gå med
        </Button>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 20,
    marginRight: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionChip: {
    height: 32,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  rightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallChip: {
    height: 32,
    minWidth: 32,
    lineHeight: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  barBtn: {
    flex: 1,
    borderRadius: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});
