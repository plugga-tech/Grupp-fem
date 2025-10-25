import { ActiveHouseholdProvider } from '@/contexts/ActiveHouseholdContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useReactQuerySetup } from '@/hooks/use-react-query-setup';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as JotaiProvider } from 'jotai';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

// Global error handling för Firebase och andra API calls
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query Error:', error);
      // Här kan du lägga till Toast notifications eller andra error handling
      if (error.cause) {
        console.error('Error Cause:', error.cause);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation Error:', error);
      // Här kan du lägga till Toast notifications eller andra error handling
      if (error.cause) {
        console.error('Error Cause:', error.cause);
      }
    },
  }),
});

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
      router.replace('/(tabs)/chores');
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
  useReactQuerySetup(); // Mobile optimizations för React Query

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <AuthProvider>
          <ActiveHouseholdProvider>
            <PaperProvider>
              <RootLayoutNav />
            </PaperProvider>
          </ActiveHouseholdProvider>
        </AuthProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
