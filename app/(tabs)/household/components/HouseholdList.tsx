import { AVATAR_COLORS, AVATAR_EMOJI, AvatarKey } from '@/app/utils/avatar';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, IconButton, List } from 'react-native-paper';

export type HouseholdSummary = {
  id: string;
  name?: string;
  code?: string;
  avatar?: AvatarKey | null;
  membersCount?: number;
};

type Props = {
  households: HouseholdSummary[];
  onHouseholdPress: (household: HouseholdSummary) => void;
  onCreatePress: () => void;
  onJoinPress: () => void;
};

const getAvatarEmoji = (key?: AvatarKey | null) => (key ? AVATAR_EMOJI[key] : '');
const getAvatarColor = (key?: AvatarKey | null) => (key ? AVATAR_COLORS[key] : 'transparent');

export function HouseholdList({ households, onHouseholdPress, onCreatePress, onJoinPress }: Props) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hushåll</Text>
        <Badge size={24} style={styles.sectionBadge}>
          {households.length}
        </Badge>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={households}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} mode="elevated">
            <List.Item
              title={item.name}
              left={() => (
                <IconButton
                  icon="information-outline"
                  size={24}
                  style={styles.infoButton}
                  onPress={() => onHouseholdPress(item)}
                  accessibilityLabel="Visa hushållsinformation"
                />
              )}
              right={() => (
                <View style={styles.badgeGroup}>
                  <Badge
                    size={24}
                    style={[styles.avatarBadge, { backgroundColor: getAvatarColor(item.avatar) }]}
                  >
                    {getAvatarEmoji(item.avatar)}
                  </Badge>
                  <Badge size={24} style={styles.countBadge}>
                    {item.membersCount ?? 0}
                  </Badge>
                </View>
              )}
            />
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Inga hushåll ännu.</Text>}
      />

      <View style={styles.bottomBar}>
        <Button mode="contained" icon="plus" style={styles.barBtn} onPress={onCreatePress}>
          Skapa
        </Button>
        <Button onPress={onJoinPress}>Gå med</Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  sectionBadge: {
    alignSelf: 'center',
    backgroundColor: 'grey',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  infoButton: {
    marginLeft: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarBadge: {
    alignSelf: 'center',
  },
  countBadge: {
    alignSelf: 'center',
    backgroundColor: 'grey',
  },
  emptyText: {
    padding: 16,
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
});
