import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/state/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { choreKeys, getChoresWithStatus } from '../../../api/chores';
import { currentHouseholdAtom, currentUserAtom } from '../../../atoms';

export default function ChoreScreen() {
  const router = useRouter();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const [currentUser] = useAtom(currentUserAtom);
  const canAddChore = !!currentUser?.is_admin;
  const householdName = currentHousehold?.name ?? 'Okänt';
  const { colors } = useTheme();

  const {
    data: chores,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: choreKeys.list(currentHousehold?.id || ''),
    queryFn: () => getChoresWithStatus(currentHousehold?.id || ''),
    enabled: !!currentHousehold?.id,
  });

  const getAvatarEmoji = (userId: string) => {
    if (userId === currentUser?.id) {
      //admin avatar
      return '🦁';
    }
    // Andra användare får en annan avatar just nu
    return '👤';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.header}>
          <Text style={styles.title}>{householdName}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Laddar sysslor...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.header}>
          <Text style={styles.title}>{householdName}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kunde inte ladda sysslor</Text>
          <IconButton icon="refresh" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={householdName}
        leftAction={{ icon: 'home-group', onPress: () => router.push('/(tabs)/household') }}
        rightActions={
          canAddChore
            ? [{ icon: 'plus-circle-outline', onPress: () => router.push('/chores/create') }]
            : undefined
        }
      />

      {!chores || chores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>Inga sysslor än</Text>
          <Text style={styles.emptySubtitle}>Tryck på + för att lägga till din första syssla</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {chores.map((chore) => {
            const hasAvatars = chore.completed_by_avatars && chore.completed_by_avatars.length > 0;

            return (
              <Card
                key={chore.id}
                style={styles.card}
                onPress={() => router.push(`/chores/details/${chore.id}`)}
              >
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.choreName}>{chore.name}</Text>

                  {hasAvatars ? (
                    <View style={styles.avatarContainer}>
                      {chore.completed_by_avatars!.slice(0, 3).map((userId, index) => (
                        <View key={index} style={styles.avatarCircle}>
                          <Text style={styles.avatarEmoji}>{getAvatarEmoji(userId)}</Text>
                        </View>
                      ))}
                      {chore.completed_by_avatars!.length > 3 && (
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarMore}>
                            +{chore.completed_by_avatars!.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    // Visa dagssiffra
                    <View
                      style={[
                        styles.dayBadge,
                        chore.is_overdue ? styles.dayBadgeOverdue : styles.dayBadgeNormal,
                      ]}
                    >
                      <Text style={styles.dayNumber}>{chore.days_since_last}</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  plusButton: {
    position: 'absolute',
    right: 16,
    top: 30,
    margin: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollViewContent: {
    paddingBottom: 65,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  choreName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6AC08B',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  avatarMore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6AC08B',
  },
  dayBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 10,
  },
  dayBadgeNormal: {
    backgroundColor: '#D3D3D3',
  },
  dayBadgeOverdue: {
    backgroundColor: '#CD5D6F',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    borderStyle: 'dashed',
  },
  iconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 16,
  },
});
