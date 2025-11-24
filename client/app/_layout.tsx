import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import Query from '@/lib/providers/query';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import {
    DarkTheme as NavDarkTheme,
    DefaultTheme as NavLightTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    adaptNavigationTheme,
    MD3DarkTheme,
    MD3LightTheme,
    PaperProvider,
} from 'react-native-paper';
import 'react-native-reanimated';

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

    const [isLoged, setIsLoged] = useState<boolean>(false);

    useEffect(() => {
        checkLogin();
    }, []);

    async function checkLogin() {
        const token = await SecureStore.getItemAsync('token');
        setIsLoged(!!token);
        if (!isLoged) {
            router.replace('/');
        }
    }


    return (
        <Query>
            <ThemeProvider
                value={
                    colorScheme === 'light'
                        ? { ...LightTheme, fonts: NavLightTheme.fonts }
                        : { ...DarkTheme, fonts: NavDarkTheme.fonts }
                }
            >
                <PaperProvider theme={paperTheme}>
                    <Stack initialRouteName='index'>

                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen
                            name="modal"
                            options={{ presentation: 'modal', title: 'Modal' }}
                        />
                    </Stack>
                    <StatusBar style="auto" />
                </PaperProvider>
            </ThemeProvider>
        </Query>
    );
}
