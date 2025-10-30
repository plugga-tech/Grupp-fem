import { getHouseholdMembers, householdKeys } from '@/api/household';
import AppHeader from '@/components/AppHeader';
import { AVATAR_COLORS, AVATAR_EMOJI, AvatarKey } from '@/utils/avatar';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { useAtom } from 'jotai';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge, Card, IconButton } from 'react-native-paper';
import { choreKeys, getChoresWithStatus } from '../../../api/chores';
import { currentHouseholdAtom } from '../../../atoms';
import { useTheme } from '../../../state/ThemeContext';

export default function ChoreScreen() {
  const router = useRouter();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;
  const { colors, isDark } = useTheme();
  // Hämta current user från Firebase Auth
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  // Hämta household members för att få deras avatarer OCH kolla admin
  const { data: members = [] } = useQuery({
    queryKey: householdKeys.members(activeHouseholdId || ''),
    queryFn: () => getHouseholdMembers(activeHouseholdId || ''),
    enabled: !!activeHouseholdId,
  });
  // Kolla om current user är admin
  const currentMember = members.find((m) => m.userId === userId);
  const canAddChore = currentMember?.isAdmin ?? false;

  const {
    data: chores,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: choreKeys.list(activeHouseholdId || ''),
    queryFn: () => getChoresWithStatus(activeHouseholdId || ''),
    enabled: !!activeHouseholdId,
  });

  const getUserAvatar = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    if (member?.avatar) {
      return {
        emoji: AVATAR_EMOJI[member.avatar as AvatarKey],
        color: AVATAR_COLORS[member.avatar as AvatarKey],
      };
    }
    return { emoji: '👤', color: '#D3D3D3' };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Laddar sysslor...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Kunde inte ladda sysslor</Text>
          <IconButton icon="refresh" onPress={() => refetch()} iconColor={colors.primary} />
        </View>
      </View>
    );
  }

  const householdName = currentHousehold?.name ?? 'Mitt Hushåll';

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
          <View
            style={[
              styles.iconPlaceholder,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.iconText}>📋</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Inga sysslor än</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tryck på + för att lägga till din första syssla
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {chores.map((chore) => {
            const hasAvatars = chore.completed_by_avatars && chore.completed_by_avatars.length > 0;

            return (
              <TouchableOpacity
                key={chore.id}
                onPress={() => {
                  router.push(`/(tabs)/chores/details/${chore.id}`);
                }}
                activeOpacity={0.7}
              >
                <Card style={[styles.card, { backgroundColor: colors.card }]}>
                  <Card.Content style={styles.cardContent}>
                    <Text style={[styles.choreName, { color: colors.text }]}>{chore.name}</Text>

                    {hasAvatars ? (
                      // Visa avatarer om någon gjort sysslan idag
                      <View style={styles.avatarContainer}>
                        {chore.completed_by_avatars!.slice(0, 3).map((userId, index) => {
                          const { emoji, color } = getUserAvatar(userId);
                          return (
                            <Badge
                              key={index}
                              size={36}
                              style={[styles.avatarBadge, { backgroundColor: color }]}
                            >
                              {emoji}
                            </Badge>
                          );
                        })}
                        {chore.completed_by_avatars!.length > 3 && (
                          <View
                            style={[
                              styles.avatarMore,
                              { backgroundColor: isDark ? '#333' : '#E0E0E0' },
                            ]}
                          >
                            <Text style={[styles.avatarMoreText, { color: colors.textSecondary }]}>
                              +{chore.completed_by_avatars!.length - 3}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : chore.days_since_last > 0 ? (
                      <View
                        style={[
                          styles.dayBadge,
                          chore.is_overdue ? styles.dayBadgeOverdue : styles.dayBadgeNormal,
                        ]}
                      >
                        <Text style={styles.dayNumber}>{chore.days_since_last}</Text>
                      </View>
                    ) : null}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
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
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 12,
    elevation: 2,
    minHeight: 60,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 60,
  },
  choreName: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 12,
  },
  avatarBadge: {
    alignSelf: 'center',
  },
  avatarMore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#9E9E9E',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  iconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
});
