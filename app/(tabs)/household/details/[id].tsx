import {
  AVATAR_COLORS,
  AVATAR_EMOJI,
  AvatarKey,
  getHouseholdMembers,
  householdKeys,
} from '@/api/household';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Appbar, Badge, Card, TextInput } from 'react-native-paper';

const getAvatarEmoji = (key?: AvatarKey | null) => (key ? AVATAR_EMOJI[key] : '');
const getAvatarColor = (key?: AvatarKey | null) => (key ? AVATAR_COLORS[key] : 'transparent');

export default function HouseholdInfoScreen() {
  const router = useRouter();
  const { id, name, code } = useLocalSearchParams<{ id: string; name: string; code: string }>();

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: householdKeys.members(id),
    enabled: !!id,
    queryFn: () => getHouseholdMembers(id),
  });

  const [householdName, setHouseholdName] = useState(name);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleToggleEdit = () => {
    if (isEditingName) {
      setIsEditingName(false);
    } else {
      setIsEditingName(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header mode="center-aligned">
        <Appbar.Action icon="arrow-left" onPress={() => router.back()} />

        <View style={styles.titleContainer}>
          {isEditingName ? (
            <TextInput
              style={styles.titleInput}
              value={householdName}
              onChangeText={setHouseholdName}
              autoFocus
              onSubmitEditing={handleToggleEdit}
              returnKeyType="done"
            />
          ) : (
            <Text>{householdName}</Text>
          )}
        </View>

        <Appbar.Action icon={isEditingName ? 'check' : 'pen'} onPress={handleToggleEdit} />
      </Appbar.Header>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text>Code: </Text>
          <Text>{code}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Title title="Medlemmar" />
        <Card.Content>
          {isLoading && <Text>Laddar medlemmar…</Text>}
          {error && <Text>Kunde inte hämta medlemmar.</Text>}
          {!isLoading &&
            members.map((member, index) => (
              <View key={`${member.name ?? 'member'}-${index}`} style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Badge
                    size={24}
                    style={[styles.memberBadge, { backgroundColor: getAvatarColor(member.avatar) }]}
                  >
                    {getAvatarEmoji(member.avatar)}
                  </Badge>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name ?? 'Okänd medlem'}</Text>
                  {member.isAdmin && <Text style={styles.adminBadge}>Admin</Text>}
                </View>
              </View>
            ))}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleInput: {
    minWidth: 180,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    textAlign: 'center',
    fontSize: 18,
  },
  infoCard: {
    margin: 16,
    borderRadius: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberBadge: {
    alignSelf: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  adminBadge: {
    fontSize: 12,
    color: '#888',
  },
});
