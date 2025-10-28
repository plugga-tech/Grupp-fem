import { getHouseholdMembers, householdKeys } from '@/api/household';
import { currentHouseholdAtom } from '@/atoms';
import AppHeader from '@/components/AppHeader';
import { useHouseholdMutations } from '@/hooks/useHouseholdMutations';
import { useTheme } from '@/state/ThemeContext';
import { AVATAR_COLORS, AVATAR_EMOJI, AvatarKey } from '@/utils/avatar';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, IconButton, TextInput } from 'react-native-paper';

const getAvatarEmoji = (key?: AvatarKey | null) => (key ? AVATAR_EMOJI[key] : '');
const getAvatarColor = (key?: AvatarKey | null) => (key ? AVATAR_COLORS[key] : 'transparent');

export default function HouseholdInfoScreen() {
  const router = useRouter();
  const { id, name, code } = useLocalSearchParams<{ id: string; name: string; code: string }>();
  const { colors } = useTheme();

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: householdKeys.members(id),
    enabled: !!id,
    queryFn: () => getHouseholdMembers(id),
  });

  const userId = getAuth().currentUser?.uid;

  const { removeMemberMutation, renameHouseholdMutation, deleteHouseholdMutation } = useHouseholdMutations(userId ?? '');

  const [currentHousehold, setCurrentHousehold] = useAtom(currentHouseholdAtom);
  const activeHouseholdId = currentHousehold?.id ?? null;

  const currentMember = members.find((m) => m.userId === userId);
  const canEdit = currentMember?.isAdmin ?? false;

  const isOwner = canEdit;

  const [householdName, setHouseholdName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => {
    if (!canEdit) return;

    if (isEditing) {
      const trimmed = householdName?.trim() ?? '';
      if (!trimmed) return;
      renameHouseholdMutation.mutate({ id, name: trimmed });
    }
    setIsEditing((prev) => !prev);
  };

  const handleRemoveMember = (memberId: string, memberName?: string | null) => {
    if (!id) return;
    Alert.alert('Ta bort medlem', `Vill du ta bort ${memberName ?? 'denna medlem'}?`, [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Ta bort',
        style: 'destructive',
        onPress: () =>
          removeMemberMutation.mutate(
            { householdId: id, memberId },
            {
              onSuccess: () => {
                if (memberId === activeHouseholdId) {
                  setCurrentHousehold(null);
                }
              },
            },
          ),
      },
    ]);
  };

  const handleDeleteHousehold = () => {
    if (!id || !isOwner) return;
    Alert.alert(
      'Ta bort hushåll',
      `Är du säker på att du vill ta bort "${name}"? Detta tar bort alla medlemmar och kan inte ångras.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort hushåll',
          style: 'destructive',
          onPress: () =>
            deleteHouseholdMutation.mutate(id, {
              onSuccess: () => {
                // Clear current household if it was the active one
                if (id === activeHouseholdId) {
                  setCurrentHousehold(null);
                }
                // Navigate back to household list
                router.back();
              },
            }),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader
        leftAction={{ icon: 'arrow-left', onPress: () => router.back() }}
        rightActions={
          canEdit ? [{ icon: isEditing ? 'check' : 'pen', onPress: handleToggleEdit }] : undefined
        }
        title={isEditing ? undefined : householdName ?? 'Hushåll'}
        titleContent={
          isEditing ? (
            <TextInput
              mode="flat"
              style={[
                styles.titleInput,
                { backgroundColor: colors.surface, color: colors.text }
              ]}
              value={householdName ?? ''}
              onChangeText={setHouseholdName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleToggleEdit}
              placeholder="Namn på hushållet"
              placeholderTextColor={colors.textSecondary}
            />
          ) : undefined
        }
      />

      <View style={styles.content}>
        <Card style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Text style={{ color: colors.text }}>Code: </Text>
            <Text style={{ color: colors.text }}>{code}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Card.Title title="Medlemmar" titleStyle={{ color: colors.text }} />
          <Card.Content>
            {isLoading && <Text style={{ color: colors.text }}>Laddar medlemmar…</Text>}
            {error && <Text style={{ color: colors.text }}>Kunde inte hämta medlemmar.</Text>}
            {!isLoading &&
              members.map((member, index) => (
                <View key={`${member.name ?? 'member'}-${index}`} style={styles.memberRow}>
                  {isEditing && member.userId !== userId && (
                    <IconButton
                      icon="trash-can-outline"
                      onPress={() => handleRemoveMember(member.userId)}
                      accessibilityLabel={`Ta bort ${member.name ?? 'denna medlem'}`}
                      iconColor={colors.text}
                    />
                  )}

                  <View style={styles.memberAvatar}>
                    <Badge
                      size={24}
                      style={[styles.memberBadge, { backgroundColor: getAvatarColor(member.avatar) }]}
                    >
                      {getAvatarEmoji(member.avatar)}
                    </Badge>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.name ?? 'Okänd medlem'}
                    </Text>
                    {member.isAdmin && (
                      <Text style={[styles.adminBadge, { color: colors.textSecondary }]}>
                        Admin
                      </Text>
                    )}
                  </View>
                </View>
              ))}
          </Card.Content>
        </Card>
      </View>

      {isOwner && (
        <View style={styles.deleteButtonContainer}>
          <Button
            mode="contained"
            onPress={handleDeleteHousehold}
            style={styles.deleteButton}
            buttonColor="#FF3B30"
            textColor="#FFFFFF"
            loading={deleteHouseholdMutation.isPending}
            disabled={deleteHouseholdMutation.isPending}
          >
            Ta bort hushåll
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 90,
  },
  titleContainer: {
    flex: 1,
    paddingTop: 2,
  },
  titleInput: {
    minWidth: 180,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
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
  },
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  deleteButton: {
    marginTop: 0,
  },
});
