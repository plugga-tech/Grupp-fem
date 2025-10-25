import { AVATAR_COLORS, AVATAR_EMOJI, AvatarKey } from '@/app/utils/avatar';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, IconButton } from 'react-native-paper';

export type HouseholdSummary = {
  id: string;
  name?: string;
  code?: string;
  avatar?: AvatarKey | null;
  membersCount?: number;
  isActive?: boolean; // Add this to track active household
};

type Props = {
  households: HouseholdSummary[];
  activeHouseholdId?: string | null; // Add this prop
  onHouseholdPress: (household: HouseholdSummary) => void;
  onSetActiveHousehold?: (household: HouseholdSummary) => void; // Add this prop
  onCreatePress: () => void;
  onJoinPress: () => void;
};

const getAvatarEmoji = (key?: AvatarKey | null) => (key ? AVATAR_EMOJI[key] : '');
const getAvatarColor = (key?: AvatarKey | null) => (key ? AVATAR_COLORS[key] : 'transparent');

export function HouseholdList({
  households,
  activeHouseholdId,
  onHouseholdPress,
  onSetActiveHousehold,
  onCreatePress,
  onJoinPress
}: Props) {
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
        renderItem={({ item }) => {
          const isActive = item.id === activeHouseholdId;

          return (
            <Card style={[styles.card, isActive && styles.activeCard]} mode="elevated">
              <View style={styles.cardContent}>
                <IconButton
                  icon="information-outline"
                  size={24}
                  style={styles.infoButton}
                  onPress={() => onHouseholdPress(item)}
                  accessibilityLabel="Visa hushållsinformation"
                />

                <View style={styles.textSection}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={1}>
                    {isActive ? "Aktivt hushåll" : `Kod: ${item.code}`}
                  </Text>
                </View>

                <View style={styles.rightSection}>
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

                  {!isActive && onSetActiveHousehold && (
                    <Button
                      mode="outlined"
                      compact
                      style={styles.activateButton}
                      labelStyle={styles.activateButtonLabel}
                      onPress={() => onSetActiveHousehold(item)}
                    >
                      Aktivera
                    </Button>
                  )}

                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <IconButton icon="check-circle" size={20} iconColor="#4CAF50" />
                    </View>
                  )}
                </View>
              </View>
            </Card>
          );
        }}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionBadge: {
    alignSelf: 'center',
    backgroundColor: '#2196F3',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 80, // Add minimum height to accommodate text
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  infoButton: {
    marginLeft: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 70,
  },
  textSection: {
    flex: 1,
    marginLeft: 8,
    marginRight: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 100,
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
    backgroundColor: '#FF9800',
  },
  activateButton: {
    minWidth: 95,
    height: 36,
    paddingHorizontal: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  activateButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 0,
    marginHorizontal: 4,
  },
  activeIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
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
