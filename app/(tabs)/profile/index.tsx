import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import {
  getAvailableAvatarsForHousehold,
  householdKeys,
  leaveHousehold,
  updateUserAvatar,
} from '../../../api/household';
import { getUserHouseholds, updateUserDisplayName } from '../../../api/user';
import { useActiveHousehold } from '../../../contexts/ActiveHouseholdContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ThemeMode, useTheme } from '../../../contexts/ThemeContext';
import { AvatarKey, getAvatarInfo } from '../../../utils/avatar';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { activeHouseholdId, setActiveHouseholdId } = useActiveHousehold();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const [name, setName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showHouseholdSelection, setShowHouseholdSelection] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initialName = user?.displayName || '';
    const hasChanges = name !== initialName && name.trim() !== '' && name.trim() !== initialName;

    if (hasChanges) {
      const timeoutId = setTimeout(() => {
        if (updateNameMutation && !updateNameMutation.isPending) {
          updateNameMutation.mutate(name.trim());
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [name, user?.displayName]);

  const { data: households = [] } = useQuery({
    queryKey: ['user-households', user?.uid],
    queryFn: () => getUserHouseholds(user!.uid),
    enabled: !!user?.uid,
  });

  const currentHousehold = activeHouseholdId
    ? households.find((h) => h.id === activeHouseholdId)
    : households[0];

  useEffect(() => {
    if (households.length > 0 && !activeHouseholdId) {
      setActiveHouseholdId(households[0].id);
    }
  }, [households, activeHouseholdId, setActiveHouseholdId]);

  const { data: availableAvatars = [] } = useQuery({
    queryKey: ['available-avatars', currentHousehold?.id],
    queryFn: () => getAvailableAvatarsForHousehold(currentHousehold!.id),
    enabled: !!currentHousehold?.id,
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (newAvatar: AvatarKey) => {
      if (!currentHousehold?.id) {
        throw new Error('Inget aktivt hushåll valt');
      }
      return updateUserAvatar(user!.uid, currentHousehold.id, newAvatar);
    },
    onSuccess: () => {
      console.log('Avatar updated successfully, invalidating queries...');

      queryClient.invalidateQueries({ queryKey: ['user-households'] });
      queryClient.invalidateQueries({ queryKey: ['available-avatars'] });

      if (user?.uid) {
        const householdListKey = householdKeys.list(user.uid);
        console.log('Invalidating household list with key:', householdListKey);
        queryClient.invalidateQueries({ queryKey: householdListKey });
        queryClient.invalidateQueries({ queryKey: householdKeys.all });
      }

      setShowAvatarSelection(false);
      Alert.alert('Framgång', 'Avatar uppdaterad!');
    },
    onError: (error) => {
      Alert.alert('Fel', error instanceof Error ? error.message : 'Kunde inte uppdatera avatar');
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: (newName: string) => {
      if (!user) {
        throw new Error('Ingen användare inloggad');
      }
      return updateUserDisplayName(user, newName);
    },
    onSuccess: () => {
      console.log('Name updated successfully');

      queryClient.invalidateQueries({ queryKey: ['user-households'] });

      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: householdKeys.list(user.uid) });
        queryClient.invalidateQueries({ queryKey: householdKeys.all });
      }

      Alert.alert('Framgång', 'Namn uppdaterat!');
    },
    onError: (error) => {
      Alert.alert('Fel', error instanceof Error ? error.message : 'Kunde inte uppdatera namn');
    },
  });

  const leaveHouseholdMutation = useMutation({
    mutationFn: (householdId: string) => leaveHousehold(user!.uid, householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-households'] });

      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: householdKeys.list(user.uid) });
        queryClient.invalidateQueries({ queryKey: householdKeys.all });
      }

      setActiveHouseholdId(null);
      Alert.alert('Framgång', 'Du har lämnat hushållet');
    },
    onError: (error) => {
      Alert.alert('Fel', error instanceof Error ? error.message : 'Kunde inte lämna hushållet');
    },
  });

  useEffect(() => {
    if (currentHousehold?.currentUserMember?.avatar) {
      setSelectedAvatar(currentHousehold.currentUserMember.avatar);
    }
  }, [currentHousehold?.id, currentHousehold?.currentUserMember?.avatar]);

  const handleSaveAvatar = () => {
    if (selectedAvatar && selectedAvatar !== currentHousehold?.currentUserMember?.avatar) {
      updateAvatarMutation.mutate(selectedAvatar);
    } else {
      setShowAvatarSelection(false);
    }
  };

  const handleHouseholdChange = (householdId: string) => {
    console.log('Changing household to:', householdId);
    setActiveHouseholdId(householdId);
    setShowHouseholdSelection(false);

    const newHousehold = households.find((h) => h.id === householdId);
    console.log('New household:', newHousehold);
    if (newHousehold?.currentUserMember?.avatar) {
      setSelectedAvatar(newHousehold.currentUserMember.avatar);
    }

    queryClient.invalidateQueries({ queryKey: ['available-avatars'] });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    setThemeMode(theme);
    Alert.alert(
      'Tema Uppdaterat',
      `Tema ändrat till "${theme}"${theme === 'Auto' ? ' (följer system)' : ''}`,
    );
  };

  const handleSwitchHousehold = () => {
    router.push('/household');
  };

  const handleLeaveHousehold = () => {
    if (!currentHousehold) {
      Alert.alert('Fel', 'Inget aktivt hushåll att lämna');
      return;
    }

    Alert.alert(
      'Lämna Hushåll',
      `Är du säker på att du vill lämna "${currentHousehold.name}"? Denna åtgärd kan inte ångras.`,
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Lämna',
          style: 'destructive',
          onPress: () => {
            if (currentHousehold.id) {
              leaveHouseholdMutation.mutate(currentHousehold.id);
            }
          },
        },
      ],
    );
  };

  const currentAvatarKey = currentHousehold?.currentUserMember?.avatar || 'Fox';
  const currentAvatarInfo = getAvatarInfo(currentAvatarKey);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.header, borderBottomColor: colors.border },
        ]}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          iconColor={colors.text}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.avatarSection} onPress={() => setShowAvatarSelection(true)}>
          <View style={[styles.avatarContainer, { backgroundColor: currentAvatarInfo.color }]}>
            <Text style={styles.avatarEmoji}>{currentAvatarInfo.emoji}</Text>
          </View>
          <Text style={[styles.avatarName, { color: colors.text }]}>
            {currentHousehold?.currentUserMember?.name || name}
          </Text>
          <Text style={[styles.changeAvatarText, { color: colors.textSecondary }]}>
            Tryck för att ändra avatar
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Namn {updateNameMutation.isPending && '(sparar...)'}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                opacity: updateNameMutation.isPending ? 0.7 : 1,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Ditt namn"
            placeholderTextColor={colors.textSecondary}
            editable={!updateNameMutation.isPending}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Mitt Hushåll</Text>
            {households.length > 1 && (
              <Text style={[styles.householdCount, { color: colors.textSecondary }]}>
                {households.length} hushåll
              </Text>
            )}
          </View>

          {households.length === 0 ? (
            <View style={styles.householdInfo}>
              <Text style={styles.householdName}>Inget hushåll hittades</Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.householdInfo,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.householdName, { color: colors.text }]}>
                  {currentHousehold?.name || 'Välj hushåll'}
                </Text>
                <Text style={[styles.householdCode, { color: colors.textSecondary }]}>
                  Kod: {currentHousehold?.code || 'N/A'}
                </Text>
                <View style={styles.householdStatus}>
                  <Text style={[styles.householdStatusText, { color: '#4CAF50' }]}>● Aktivt</Text>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleSwitchHousehold}>
            <Text style={[styles.actionButtonText, { color: colors.buttonPrimary }]}>
              Byt hushåll
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              leaveHouseholdMutation.isPending && styles.actionButtonDisabled,
            ]}
            onPress={handleLeaveHousehold}
            disabled={leaveHouseholdMutation.isPending}
          >
            <Text style={[styles.actionButtonText, styles.leaveButtonText]}>
              {leaveHouseholdMutation.isPending ? 'Lämnar...' : 'Lämna hushåll'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Utseende</Text>

          <View style={styles.themeContainer}>
            {(['Ljus', 'Mörk', 'Auto'] as const).map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  themeMode === theme && [
                    styles.themeButtonSelected,
                    { borderColor: colors.primary },
                  ],
                ]}
                onPress={() => handleThemeChange(theme)}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: colors.textSecondary },
                    themeMode === theme && [
                      styles.themeButtonTextSelected,
                      { color: colors.primary },
                    ],
                  ]}
                >
                  {theme}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {showAvatarSelection && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Välj Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarSelection(false)}>
                <IconButton icon="close" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.avatarGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarRowContainer}>
                {availableAvatars.map((avatarKey) => {
                  const avatarInfo = getAvatarInfo(avatarKey);
                  const isSelected = selectedAvatar === avatarKey;

                  return (
                    <TouchableOpacity
                      key={avatarKey}
                      style={[
                        styles.avatarOption,
                        { backgroundColor: avatarInfo.color },
                        isSelected && [
                          styles.avatarOptionSelected,
                          { borderColor: colors.buttonPrimary },
                        ],
                      ]}
                      onPress={() => setSelectedAvatar(avatarKey)}
                    >
                      <Text style={styles.avatarOptionEmoji}>{avatarInfo.emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAvatarSelection(false)}
                style={styles.modalCancelButton}
              >
                Avbryt
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveAvatar}
                style={[styles.modalSaveButton, { backgroundColor: colors.buttonPrimary }]}
                loading={updateAvatarMutation.isPending}
                disabled={!selectedAvatar || updateAvatarMutation.isPending}
              >
                Spara Avatar
              </Button>
            </View>
          </View>
        </View>
      )}

      {showHouseholdSelection && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Välj Aktivt Hushåll</Text>
              <TouchableOpacity onPress={() => setShowHouseholdSelection(false)}>
                <IconButton icon="close" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.householdsList} showsVerticalScrollIndicator={false}>
              {households.map((household) => {
                const isSelected = activeHouseholdId === household.id;
                const avatarInfo = getAvatarInfo(household.currentUserMember?.avatar || 'Fox');

                return (
                  <TouchableOpacity
                    key={household.id}
                    style={[
                      styles.householdOption,
                      isSelected && [
                        styles.householdOptionSelected,
                        {
                          backgroundColor: isDark ? '#1A2B3D' : '#E3F2FD',
                          borderColor: colors.buttonPrimary,
                        },
                      ],
                    ]}
                    onPress={() => {
                      handleHouseholdChange(household.id);
                    }}
                  >
                    <View style={[styles.householdAvatar, { backgroundColor: avatarInfo.color }]}>
                      <Text style={styles.householdAvatarEmoji}>{avatarInfo.emoji}</Text>
                    </View>
                    <View style={styles.householdDetails}>
                      <Text style={styles.householdOptionName}>{household.name}</Text>
                      <Text style={styles.householdOptionCode}>Kod: {household.code}</Text>
                      {household.currentUserMember?.isAdmin && (
                        <Text style={[styles.adminBadge, { color: colors.buttonSecondary }]}>
                          Admin
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <IconButton icon="check" size={20} iconColor={colors.buttonPrimary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    margin: 0,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '500',
  },
  changeAvatarText: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  householdCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  householdInfo: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    position: 'relative',
  },
  householdName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  householdCode: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  householdStatus: {
    position: 'absolute',
    top: 12,
    right: 16,
  },
  householdStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#E9ECEF',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  leaveButtonText: {
    color: '#FF3B30',
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  themeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    shadowOpacity: 0.15,
    elevation: 3,
  },
  themeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  themeButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  avatarGrid: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  avatarRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderWidth: 3,
  },
  avatarOptionEmoji: {
    fontSize: 28,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: '#E9ECEF',
  },
  modalSaveButton: {
    flex: 1,
  },
  // Household selection styles
  householdsList: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  householdOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  householdOptionSelected: {
    borderWidth: 1,
  },
  householdAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  householdAvatarEmoji: {
    fontSize: 20,
  },
  householdDetails: {
    flex: 1,
  },
  householdOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  householdOptionCode: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
