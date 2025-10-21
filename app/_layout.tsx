import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}