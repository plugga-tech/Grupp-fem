import { useReactQuerySetup } from "@/hooks/use-react-query-setup";
import { AuthProvider, useAuth } from "@/state/AuthContext";
import { ThemeProvider } from "@/state/ThemeContext";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider as JotaiProvider } from "jotai";
import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

// Global error handling för Firebase och andra API calls
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      console.error("Query Error:", error);
      if (error?.cause) console.error("Error Cause:", error.cause);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      console.error("Mutation Error:", error);
      if (error?.cause) console.error("Error Cause:", error.cause);
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      const meta = (mutation.meta ?? {}) as any;
      const householdId = meta?.invalidateStatsForHousehold as
        | string
        | undefined;
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: ["stats", householdId],
          exact: false,
        });
        queryClient.refetchQueries({
          queryKey: ["stats", householdId],
          exact: false,
          type: "all",
        });
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

    const inAuthGroup = segments[0] === "(tabs)";

    if (!user && inAuthGroup) {
      router.replace("/sign-in");
    } else if (user && !inAuthGroup) {
      router.replace("/(tabs)/household");
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
  anchor: "(tabs)",
};

export default function RootLayout() {
  useReactQuerySetup(); // Mobile optimizations för React Query

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <ThemeProvider>
          <AuthProvider>
            <PaperProvider>
              <RootLayoutNav />
            </PaperProvider>
          </AuthProvider>
        </ThemeProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
