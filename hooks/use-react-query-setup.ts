import { focusManager, onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

export function useReactQuerySetup() {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const eventSubscription = Network.addNetworkStateListener((state) => {
        setOnline(!!state.isConnected);
      });
      return eventSubscription.remove;
    });

    const appStateSubscription = AppState.addEventListener(
      'change',
      (status) => {
        if (Platform.OS !== 'web') {
          focusManager.setFocused(status === 'active');
        }
      }
    );

    return () => {
      appStateSubscription.remove();
    };
  }, []);
}