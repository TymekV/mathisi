import { RegisterForm } from '@/components/auth/register-form';
import { useAuth } from '@/lib/providers/auth';
import { IconFeather } from '@tabler/icons-react-native';
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

export default function RegisterScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const theme = useTheme();

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/(home)" />;
    }

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator animating />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.hero}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
                    <IconFeather size={48} color={theme.colors.onSecondary} strokeWidth={1.4} />
                </View>
                <Text variant="headlineMedium" style={styles.heroTitle}>
                    Join Mathisi
                </Text>
                <Text variant="bodyLarge" style={styles.heroSubtitle}>
                    Create an account to sync notes across every device.
                </Text>
            </View>
            <RegisterForm onNavigateToLogin={() => router.replace('/(auth)/login')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        gap: 32,
        justifyContent: 'center',
    },
    hero: {
        alignItems: 'center',
        gap: 8,
    },
    heroTitle: {
        marginTop: 8,
    },
    heroSubtitle: {
        textAlign: 'center',
        opacity: 0.8,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
