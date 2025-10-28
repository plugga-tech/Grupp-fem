import { useAuth } from '@/state/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View, Image } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('./register');
  };

  const handleForgotPassword = () => {
    Alert.alert('Info', 'Forgot password feature coming soon');
  };

    return (
        <View style={styles.container}>
           {/* Logo Section */}
<View style={styles.logoContainer}>
    <Image
        source={require('@/assets/images/logo.png')} // byt till din faktiska sökväg
        style={styles.logo}
        resizeMode="contain"
    />
</View>
            {/* Title */}
            <Text style={styles.title}>Hushållet</Text>
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

      {/* Login Form */}
      <View style={styles.formContainer}>
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

        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          labelStyle={styles.loginButtonText}
        >
          Logga in
        </Button>

                <Button
                    mode="text"
                    onPress={handleSignUp}
                    style={styles.linkButton}
                    labelStyle={styles.linkText}
                >
                    Skapa konto
                </Button>
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
    loginButton: {
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#20B2AA',
        borderRadius: 24,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    linkButton: {
        marginTop: 8,
    },
    linkText: {
        fontSize: 14,
        color: '#6C757D',
    },
    logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 60, // flyttar ner loggan lite om den sitter för högt
},
logo: {
    width: 180, // anpassa storlek efter hur stor du vill att loggan ska vara
    height: 180,
},


});
        <Button
          mode="text"
          onPress={handleSignUp}
          style={styles.linkButton}
          labelStyle={styles.linkText}
        >
          Skapa konto
        </Button>

        <Button
          mode="text"
          onPress={handleForgotPassword}
          style={styles.linkButton}
          labelStyle={styles.linkText}
        >
          Glömt lösenord?
        </Button>
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
  loginButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#20B2AA',
    borderRadius: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#6C757D',
  },
});
