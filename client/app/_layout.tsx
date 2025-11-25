import React from 'react';
import { SheetProvider } from 'react-native-actions-sheet';
import '../global.css';
import '@/lib/sheets';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/lib/providers/auth';
import Query from '@/lib/providers/query';
import PaperAppbarHeader from '@/components/navigation/paper-appbar-header';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import {
    DarkTheme as NavDarkTheme,
    DefaultTheme as NavLightTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    adaptNavigationTheme,
    MD3DarkTheme,
    MD3LightTheme,
    PaperProvider,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
    initialRouteName: 'index',
    anchor: 'index',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { theme } = useMaterial3Theme();

    const paperTheme =
        colorScheme === 'dark'
            ? { ...MD3DarkTheme, colors: theme.dark }
            : { ...MD3LightTheme, colors: theme.light };

    const { DarkTheme, LightTheme } = adaptNavigationTheme({
        reactNavigationDark: NavDarkTheme,
        reactNavigationLight: NavLightTheme,
        materialDark: MD3DarkTheme,
        materialLight: MD3LightTheme,
    });

    const queryClient = new QueryClient();

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <Query>
                    <ThemeProvider
                        value={
                            colorScheme === 'light'
                                ? { ...LightTheme, fonts: NavLightTheme.fonts }
                                : { ...DarkTheme, fonts: NavDarkTheme.fonts }
                        }
                    >
                        <SafeAreaProvider>
                            <PaperProvider theme={paperTheme}>
                                <SheetProvider>
                                    <Stack
                                        initialRouteName="index"
                                        screenOptions={{
                                            header: (props) => <PaperAppbarHeader {...props} />,
                                        }}
                                    >
                                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                        <Stack.Screen
                                            name="modal"
                                            options={{ presentation: 'modal', title: 'Modal' }}
                                        />
                                    </Stack>
                                    <StatusBar style="auto" />
                                </SheetProvider>
                            </PaperProvider>
                        </SafeAreaProvider>
                    </ThemeProvider>
                </Query>
            </QueryClientProvider>
        </AuthProvider>
    );
}
