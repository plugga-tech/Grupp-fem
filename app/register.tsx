import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Fel', 'Vänligen fyll i alla fält');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Fel', 'Lösenorden matchar inte');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Fel', 'Lösenordet måste vara minst 6 tecken');
            return;
        }

        setLoading(true);
        try {
            await register(email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Registrering misslyckades', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>🦊</Text>
                </View>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>🐙</Text>
                </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Hushållet</Text>

            {/* Registration Form */}
            <View style={styles.formContainer}>
                <TextInput
                    label="Fullständigt namn"
                    value={fullName}
                    onChangeText={setFullName}
                    mode="outlined"
                    autoCapitalize="words"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    textColor="#000000"
                />

                <TextInput
                    label="E-postadress"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    textColor="#000000"
                />

                <TextInput
                    label="Lösenord"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    textColor="#000000"
                />

                <TextInput
                    label="Bekräfta lösenord"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    textColor="#000000"
                />

                <Button
                    mode="outlined"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.createButton}
                    labelStyle={styles.createButtonText}
                >
                    Skapa konto
                </Button>

                <View style={styles.loginSection}>
                    <Text style={styles.loginText}>Har du redan ett konto?</Text>
                    <Button
                        mode="text"
                        onPress={handleSignIn}
                        style={styles.loginButton}
                        labelStyle={styles.loginLinkText}
                    >
                        Logga in
                    </Button>
                </View>

                <Text style={styles.termsText}>
                    Genom att skapa ett konto godkänner du våra villkor och integritetspolicy.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingTop: 80,
    },
    avatarSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 16,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF0E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        fontSize: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 48,
        color: '#000000',
    },
    formContainer: {
        gap: 16,
    },
    input: {
        backgroundColor: '#F8F9FA',
    },
    inputOutline: {
        borderColor: '#E9ECEF',
        borderWidth: 1,
    },
    createButton: {
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderColor: '#E9ECEF',
        borderWidth: 1,
        borderRadius: 24,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 4,
    },
    loginText: {
        fontSize: 14,
        color: '#6C757D',
    },
    loginButton: {
        minWidth: 0,
    },
    loginLinkText: {
        fontSize: 14,
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    termsText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 16,
    },
});