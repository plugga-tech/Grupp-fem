import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

export default function ProfileScreen() {
    const [name, setName] = useState('Emma');
    const [selectedTheme, setSelectedTheme] = useState<'Ljus' | 'Mörk' | 'Auto'>('Auto');

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

                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarEmoji}>🦊</Text>
                    </View>
                    <Text style={styles.avatarName}>Emma</Text>
                </View>

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
                    <Text style={styles.sectionLabel}>Hushåll</Text>

                    <View style={styles.householdInfo}>
                        <Text style={styles.householdName}>Familjen Andersson</Text>
                    </View>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Byt hushåll</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={[styles.actionButtonText, styles.leaveButtonText]}>Lämna hushåll</Text>
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
                        onPress={() => { }}
                        style={styles.saveButton}
                        labelStyle={styles.saveButtonText}
                    >
                        Spara
                    </Button>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
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
    actionButton: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        alignItems: 'center',
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
});