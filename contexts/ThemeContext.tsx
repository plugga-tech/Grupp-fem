import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'Ljus' | 'Mörk' | 'Auto';

export interface ThemeColors {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    header: string;
    buttonPrimary: string;
    buttonSecondary: string;
}

const lightColors: ThemeColors = {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#007AFF',
    secondary: '#2196F3',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5E5',
    card: '#FFFFFF',
    header: '#FFFFFF',
    buttonPrimary: '#007AFF',
    buttonSecondary: '#2196F3',
};

const darkColors: ThemeColors = {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#0A84FF',
    secondary: '#64B5F6',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    card: '#1E1E1E',
    header: '#1E1E1E',
    buttonPrimary: '#0A84FF',
    buttonSecondary: '#5A9FD4',
};

interface ThemeContextType {
    themeMode: ThemeMode;
    colors: ThemeColors;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [themeMode, setThemeMode] = useState<ThemeMode>('Auto');
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
        Appearance.getColorScheme()
    );

    // Listen to system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme);
        });

        return () => subscription?.remove();
    }, []);

    // Determine if dark mode should be active
    const isDark = React.useMemo(() => {
        if (themeMode === 'Mörk') return true;
        if (themeMode === 'Ljus') return false;
        return systemColorScheme === 'dark';
    }, [themeMode, systemColorScheme]);

    // Get current colors based on theme
    const colors = React.useMemo(() => {
        return isDark ? darkColors : lightColors;
    }, [isDark]);

    const value = {
        themeMode,
        colors,
        isDark,
        setThemeMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}