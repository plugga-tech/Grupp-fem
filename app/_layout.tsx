import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // User not logged in but trying to access protected route
      router.replace('/sign-in');
    } else if (user && !inAuthGroup) {
      // User is logged in but not in protected area
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <AuthProvider>
          <PaperProvider>
            <RootLayoutNav />
          </PaperProvider>
        </AuthProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}