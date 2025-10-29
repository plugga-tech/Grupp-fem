import { currentHouseholdAtom } from "@/atoms";
import AppHeader from "@/components/AppHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, IconButton } from "react-native-paper";
import {
  getAvailableAvatarsForHousehold,
  householdKeys,
  leaveHousehold,
  updateUserAvatar,
} from "../../../api/household";
import {
  getUserHouseholds,
  updateUserDisplayName
} from "../../../api/user";
import { useAuth } from "../../../state/AuthContext";
import { ThemeMode, useTheme } from "../../../state/ThemeContext";
import { AvatarKey, getAvatarInfo } from "../../../utils/avatar";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedHousehold, setSelectedHousehold] =
    useAtom(currentHouseholdAtom);

  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const [name, setName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey | null>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showHouseholdSelection, setShowHouseholdSelection] = useState(false);
  const [hasLeftHousehold, setHasLeftHousehold] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (name !== user?.displayName && name.trim() !== "" && name.trim() !== user?.displayName) {
      if (updateNameMutation && !updateNameMutation.isPending) {
        updateNameMutation.mutate(name.trim());
      }
    }
  }, [name, user?.displayName]);

  const { data: households = [] } = useQuery({
    queryKey: ["user-households", user?.uid],
    queryFn: () => getUserHouseholds(user!.uid),
    enabled: !!user?.uid,
  });

  const activeHouseholdId = hasLeftHousehold
    ? null
    : selectedHousehold?.id ?? null;

  const activeHousehold = households.find(h => h.id === activeHouseholdId) ?? null;

  const { data: availableAvatars = [] } = useQuery({
    queryKey: ["available-avatars", activeHouseholdId],
    queryFn: () => getAvailableAvatarsForHousehold(activeHouseholdId!),
    enabled: !!activeHouseholdId,
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (newAvatar: AvatarKey) => {
      if (!activeHouseholdId) {
        throw new Error("Inget aktivt hushåll valt");
      }
      return updateUserAvatar(user!.uid, activeHouseholdId, newAvatar);
    },
    meta: { invalidateStatsForHousehold: activeHouseholdId },
    onSuccess: () => {
      console.log("Avatar updated successfully, invalidating queries...");

      queryClient.invalidateQueries({ queryKey: ["user-households"] });
      queryClient.invalidateQueries({ queryKey: ["available-avatars"] });

      if (user?.uid) {
        const householdListKey = householdKeys.list(user.uid);
        console.log("Invalidating household list with key:", householdListKey);
        queryClient.invalidateQueries({ queryKey: householdListKey });
        queryClient.invalidateQueries({ queryKey: householdKeys.all });
      }

      setShowAvatarSelection(false);
    },
    onError: (error) => {
      Alert.alert(
        "Fel",
        error instanceof Error ? error.message : "Kunde inte uppdatera avatar"
      );
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: (newName: string) => {
      if (!user) {
        throw new Error("Ingen användare inloggad");
      }
      return updateUserDisplayName(user, newName);
    },
    onSuccess: () => {
      console.log("Name updated successfully");

      queryClient.invalidateQueries({ queryKey: ["user-households"] });

      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: householdKeys.list(user.uid),
        });
        queryClient.invalidateQueries({ queryKey: householdKeys.all });
      }
    },
    onError: (error) => {
      Alert.alert(
        "Fel",
        error instanceof Error ? error.message : "Kunde inte uppdatera namn"
      );
    },
  });

  const leaveHouseholdMutation = useMutation({
    mutationFn: (householdId: string) => leaveHousehold(user!.uid, householdId),
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: ["user-households"] });

      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: householdKeys.list(user.uid),
        });
        queryClient.invalidateQueries({ queryKey: householdKeys.all });
      }

      // Clear selected household
      setSelectedHousehold(null);
      setHasLeftHousehold(true);

      // The household will be automatically removed from the list after query invalidation
      // and since hasLeftHousehold is true, no household will be shown as active

      Alert.alert("Framgång", "Du har lämnat hushållet");
    },
    onError: (error) => {
      Alert.alert(
        "Fel",
        error instanceof Error ? error.message : "Kunde inte lämna hushållet"
      );
    },
  });

  useEffect(() => {
    if (activeHousehold?.currentUserMember?.avatar) {
      setSelectedAvatar(activeHousehold.currentUserMember.avatar);
    }
  }, [activeHousehold?.id, activeHousehold?.currentUserMember?.avatar]);

  const handleSaveAvatar = () => {
    if (
      selectedAvatar &&
      selectedAvatar !== activeHousehold?.currentUserMember?.avatar
    ) {
      updateAvatarMutation.mutate(selectedAvatar);
    } else {
      setShowAvatarSelection(false);
    }
  };

  const handleHouseholdChange = (householdId: string) => {
    console.log("Changing household to:", householdId);

    const newHousehold = households.find((h) => h.id === householdId) ?? null;
    setSelectedHousehold(newHousehold);
    setShowHouseholdSelection(false);

    console.log("New household:", newHousehold);
    if (newHousehold?.currentUserMember?.avatar) {
      setSelectedAvatar(newHousehold.currentUserMember.avatar);
    }

    queryClient.invalidateQueries({ queryKey: ["available-avatars"] });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    setThemeMode(theme);
  };

  const handleSwitchHousehold = () => {
    setHasLeftHousehold(false); // Reset state when user wants to switch household
    router.push("/household");
  };

  const handleLeaveHousehold = () => {
    if (!activeHousehold) {
      Alert.alert("Fel", "Inget aktivt hushåll att lämna");
      return;
    }
    Alert.alert(
      "Lämna Hushåll",
      `Är du säker på att du vill lämna "${activeHousehold.name}"? Denna åtgärd kan inte ångras.`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Lämna",
          style: "destructive",
          onPress: () =>
            activeHousehold.id &&
            leaveHouseholdMutation.mutate(activeHousehold.id),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logga ut", "Är du säker på att du vill logga ut?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Logga ut",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/sign-in");
          } catch (error) {
            Alert.alert("Fel", "Kunde inte logga ut. Försök igen.");
          }
        },
      },
    ]);
  };

  const handleCopyHouseholdCode = async () => {
    if (!activeHousehold?.code) {
      Alert.alert("Fel", "Ingen hushållskod att kopiera");
      return;
    }

    try {
      await Clipboard.setString(activeHousehold.code);
      Alert.alert(
        "Kopierat!",
        `Hushållskod "${activeHousehold.code}" har kopierats till urklipp`
      );
    } catch (error) {
      Alert.alert("Fel", "Kunde inte kopiera hushållskoden");
    }
  };

  const currentAvatarKey = activeHousehold?.currentUserMember?.avatar ?? "Fox";

  const currentAvatarInfo = getAvatarInfo(currentAvatarKey);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Profil"
        leftAction={{ icon: "chevron-left", onPress: () => router.back() }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() => setShowAvatarSelection(true)}
        >
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: currentAvatarInfo.color },
            ]}
          >
            <Text style={styles.avatarEmoji}>{currentAvatarInfo.emoji}</Text>
          </View>
          <Text style={[styles.avatarName, { color: colors.text }]}>
            {activeHousehold?.currentUserMember?.name || name}
          </Text>
          <Text
            style={[styles.changeAvatarText, { color: colors.textSecondary }]}
          >
            Tryck för att ändra avatar
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Namn
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Ditt namn"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Mitt Hushåll
            </Text>
            {households.length > 1 && (
              <Text
                style={[styles.householdCount, { color: colors.textSecondary }]}
              >
                {households.length} hushåll
              </Text>
            )}
          </View>

          {households.length === 0 ? (
            <View style={[
              styles.householdInfo,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
              <Text style={[styles.householdName, { color: colors.text }]}>Inget hushåll hittades</Text>
            </View>
          ) : !activeHousehold ? (
            <View style={[
              styles.householdInfo,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
              <Text style={[styles.householdName, { color: colors.text }]}>Inget aktivt hushåll</Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.householdInfo,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.householdHeader}>
                  <Text style={[styles.householdName, { color: colors.text }]}>
                    {activeHousehold.name}
                  </Text>
                  <View style={styles.householdStatus}>
                    <Text
                      style={[styles.householdStatusText, { color: "#4CAF50" }]}
                    >
                      ● Aktivt
                    </Text>
                  </View>
                </View>
                {activeHousehold?.code && (
                  <TouchableOpacity
                    style={[
                      styles.householdCodeButton,
                      {
                        backgroundColor: colors.buttonSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleCopyHouseholdCode}
                  >
                    <Text
                      style={[styles.householdCodeText, { color: colors.text }]}
                    >
                      Kod: {activeHousehold.code}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={handleSwitchHousehold}
          >
            <Text
              style={[styles.actionButtonText, { color: colors.buttonPrimary }]}
            >
              Byt hushåll
            </Text>
          </TouchableOpacity>

          {activeHousehold && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.surface },
                leaveHouseholdMutation.isPending && styles.actionButtonDisabled,
              ]}
              onPress={handleLeaveHousehold}
              disabled={leaveHouseholdMutation.isPending}
            >
              <Text style={[styles.actionButtonText, styles.leaveButtonText]}>
                {leaveHouseholdMutation.isPending ? "Lämnar..." : "Lämna hushåll"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Utseende
          </Text>

          <View style={styles.themeContainer}>
            {(["Ljus", "Mörk", "Auto"] as const).map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
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

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surface }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: "#FF3B30" }]}>
              Logga ut
            </Text>
          </TouchableOpacity>
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

            <ScrollView
              style={styles.avatarGrid}
              showsVerticalScrollIndicator={false}
            >
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
                      <Text style={styles.avatarOptionEmoji}>
                        {avatarInfo.emoji}
                      </Text>
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
                style={[
                  styles.modalSaveButton,
                  { backgroundColor: colors.buttonPrimary },
                ]}
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
              <TouchableOpacity
                onPress={() => setShowHouseholdSelection(false)}
              >
                <IconButton icon="close" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.householdsList}
              showsVerticalScrollIndicator={false}
            >
              {households.map((household) => {
                const isSelected = activeHouseholdId === household.id;
                const avatarInfo = getAvatarInfo(
                  household.currentUserMember?.avatar || "Fox"
                );

                return (
                  <TouchableOpacity
                    key={household.id}
                    style={[
                      styles.householdOption,
                      isSelected && [
                        styles.householdOptionSelected,
                        {
                          backgroundColor: isDark ? "#1A2B3D" : "#E3F2FD",
                          borderColor: colors.buttonPrimary,
                        },
                      ],
                    ]}
                    onPress={() => {
                      handleHouseholdChange(household.id);
                    }}
                  >
                    <View
                      style={[
                        styles.householdAvatar,
                        { backgroundColor: avatarInfo.color },
                      ]}
                    >
                      <Text style={styles.householdAvatarEmoji}>
                        {avatarInfo.emoji}
                      </Text>
                    </View>
                    <View style={styles.householdDetails}>
                      <Text style={styles.householdOptionName}>
                        {household.name}
                      </Text>
                      <Text style={styles.householdOptionCode}>
                        Kod: {household.code}
                      </Text>
                      {household.currentUserMember?.isAdmin && (
                        <Text
                          style={[
                            styles.adminBadge,
                            { color: colors.buttonSecondary },
                          ]}
                        >
                          Admin
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <IconButton
                        icon="check"
                        size={20}
                        iconColor={colors.buttonPrimary}
                      />
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
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: "500",
  },
  changeAvatarText: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  householdCount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
  },
  householdInfo: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  householdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  householdInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  householdInfoMain: {
    flex: 1,
    marginRight: 12,
  },
  householdName: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    flex: 1,
  },
  householdCode: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  householdCodeButton: {
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#E0E4E7",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  householdCodeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  householdStatus: {
    alignItems: "flex-end",
  },
  householdStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  copyButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  actionButtonDisabled: {
    backgroundColor: "#E9ECEF",
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  leaveButtonText: {
    color: "#FF3B30",
  },
  themeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  themeButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  themeButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    shadowOpacity: 0.15,
    elevation: 3,
  },
  themeButtonText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  themeButtonTextSelected: {
    color: "#2196F3",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  avatarGrid: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  avatarRowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    borderWidth: 3,
  },
  avatarOptionEmoji: {
    fontSize: 28,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: "#E9ECEF",
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "transparent",
  },
  householdOptionSelected: {
    borderWidth: 1,
  },
  householdAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "500",
    color: "#000000",
  },
  householdOptionCode: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
