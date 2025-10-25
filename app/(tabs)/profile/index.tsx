import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { getAvailableAvatarsForHousehold, householdKeys, leaveHousehold, updateUserAvatar } from '../../../api/household';
import { getUserHouseholds } from '../../../api/user';
import { AvatarKey, getAvatarInfo } from '../../../app/utils/avatar';
import { useActiveHousehold } from '../../../contexts/ActiveHouseholdContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProfileScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { activeHouseholdId, setActiveHouseholdId } = useActiveHousehold();
    const [name, setName] = useState(user?.displayName || '');
    const [selectedTheme, setSelectedTheme] = useState<'Ljus' | 'Mörk' | 'Auto'>('Auto');
    const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey | null>(null);
    const [showAvatarSelection, setShowAvatarSelection] = useState(false);
    const [showHouseholdSelection, setShowHouseholdSelection] = useState(false);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Get user's all households
    const { data: households = [] } = useQuery({
        queryKey: ['user-households', user?.uid],
        queryFn: () => getUserHouseholds(user!.uid),
        enabled: !!user?.uid,
    });

    // Get current selected household (use global active household)
    const currentHousehold = activeHouseholdId
        ? households.find(h => h.id === activeHouseholdId)
        : households[0];

    // Set global active household when households load
    useEffect(() => {
        if (households.length > 0 && !activeHouseholdId) {
            setActiveHouseholdId(households[0].id);
        }
    }, [households, activeHouseholdId, setActiveHouseholdId]);

    // Get available avatars for the selected household
    const { data: availableAvatars = [] } = useQuery({
        queryKey: ['available-avatars', currentHousehold?.id],
        queryFn: () => getAvailableAvatarsForHousehold(currentHousehold!.id),
        enabled: !!currentHousehold?.id,
    });

    // Update avatar mutation
    const updateAvatarMutation = useMutation({
        mutationFn: (newAvatar: AvatarKey) => {
            if (!currentHousehold?.id) {
                throw new Error('Inget aktivt hushåll valt');
            }
            return updateUserAvatar(user!.uid, currentHousehold.id, newAvatar);
        },
        onSuccess: () => {
            console.log('Avatar updated successfully, invalidating queries...');

            // Invalidate user households data
            queryClient.invalidateQueries({ queryKey: ['user-households'] });
            queryClient.invalidateQueries({ queryKey: ['available-avatars'] });

            // Invalidate household list (for households page)
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

    // Leave household mutation
    const leaveHouseholdMutation = useMutation({
        mutationFn: (householdId: string) => leaveHousehold(user!.uid, householdId),
        onSuccess: () => {
            // Invalidate user households data
            queryClient.invalidateQueries({ queryKey: ['user-households'] });

            // Invalidate household list (for households page)
            if (user?.uid) {
                queryClient.invalidateQueries({ queryKey: householdKeys.list(user.uid) });
                queryClient.invalidateQueries({ queryKey: householdKeys.all });
            }

            setActiveHouseholdId(null); // Reset selection
            Alert.alert('Framgång', 'Du har lämnat hushållet');
        },
        onError: (error) => {
            Alert.alert('Fel', error instanceof Error ? error.message : 'Kunde inte lämna hushållet');
        },
    });

    // Set initial avatar when household data loads or changes
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
        setActiveHouseholdId(householdId); // Use global state
        setShowHouseholdSelection(false);

        // Reset avatar selection when household changes
        const newHousehold = households.find(h => h.id === householdId);
        console.log('New household:', newHousehold);
        if (newHousehold?.currentUserMember?.avatar) {
            setSelectedAvatar(newHousehold.currentUserMember.avatar);
        }

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['available-avatars'] });
    };

    const handleSwitchHousehold = () => {
        // Navigate to household page where user can create or join new household
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
            ]
        );
    };

    const currentAvatarKey = currentHousehold?.currentUserMember?.avatar || 'Fox';
    const currentAvatarInfo = getAvatarInfo(currentAvatarKey);

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => { }}
                    style={styles.backButton}
                />
                <Text style={styles.headerTitle}>Profil</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <TouchableOpacity
                    style={styles.avatarSection}
                    onPress={() => setShowAvatarSelection(true)}
                >
                    <View style={[styles.avatarContainer, { backgroundColor: currentAvatarInfo.color }]}>
                        <Text style={styles.avatarEmoji}>{currentAvatarInfo.emoji}</Text>
                    </View>
                    <Text style={styles.avatarName}>{currentHousehold?.currentUserMember?.name || name}</Text>
                    <Text style={styles.changeAvatarText}>Tryck för att ändra avatar</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Namn</Text>
                    <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ditt namn"
                        placeholderTextColor="#C0C0C0"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Aktivt Hushåll</Text>

                    {households.length === 0 ? (
                        <View style={styles.householdInfo}>
                            <Text style={styles.householdName}>Inget hushåll hittades</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.householdInfo}
                                onPress={() => setShowHouseholdSelection(true)}
                            >
                                <Text style={styles.householdName}>
                                    {currentHousehold?.name || 'Välj hushåll'}
                                </Text>
                                <Text style={styles.householdCode}>
                                    Kod: {currentHousehold?.code || 'N/A'}
                                </Text>
                            </TouchableOpacity>

                            {households.length > 1 && (
                                <Text style={styles.householdHint}>
                                    Tryck för att växla mellan {households.length} hushåll
                                </Text>
                            )}
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSwitchHousehold}
                    >
                        <Text style={styles.actionButtonText}>Byt hushåll</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            leaveHouseholdMutation.isPending && styles.actionButtonDisabled
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
                    <Text style={styles.sectionLabel}>Utseende</Text>

                    <View style={styles.themeContainer}>
                        {(['Ljus', 'Mörk', 'Auto'] as const).map((theme) => (
                            <TouchableOpacity
                                key={theme}
                                style={[
                                    styles.themeButton,
                                    selectedTheme === theme && styles.themeButtonSelected
                                ]}
                                onPress={() => setSelectedTheme(theme)}
                            >
                                <Text style={[
                                    styles.themeButtonText,
                                    selectedTheme === theme && styles.themeButtonTextSelected
                                ]}>
                                    {theme}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.saveSection}>
                    <Button
                        mode="contained"
                        onPress={() => {
                            // For now just show an alert - name updates can be implemented later
                            Alert.alert('Information', 'Namnuppdatering kommer snart!');
                        }}
                        style={styles.saveButton}
                        labelStyle={styles.saveButtonText}
                    >
                        Spara
                    </Button>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Avatar Selection Modal */}
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
                                                isSelected && styles.avatarOptionSelected
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
                                style={styles.modalSaveButton}
                                loading={updateAvatarMutation.isPending}
                                disabled={!selectedAvatar || updateAvatarMutation.isPending}
                            >
                                Spara Avatar
                            </Button>
                        </View>
                    </View>
                </View>
            )}

            {/* Household Selection Modal */}
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
                                            isSelected && styles.householdOptionSelected
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
                                                <Text style={styles.adminBadge}>Admin</Text>
                                            )}
                                        </View>
                                        {isSelected && (
                                            <IconButton icon="check" size={20} iconColor="#007AFF" />
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
    },
    backButton: {
        margin: 0,
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
        color: '#000000',
    },
    changeAvatarText: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 12,
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
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    householdName: {
        fontSize: 16,
        color: '#000000',
    },
    householdCode: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
    },
    householdHint: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
        fontStyle: 'italic',
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
        color: '#007AFF',
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
    },
    themeButtonSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
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
    saveSection: {
        marginTop: 24,
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
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
        borderColor: '#007AFF',
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
        backgroundColor: '#007AFF',
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
        backgroundColor: '#E3F2FD',
        borderColor: '#007AFF',
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
        color: '#007AFF',
        fontWeight: '500',
        marginTop: 2,
    },
});