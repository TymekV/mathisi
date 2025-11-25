import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/lib/providers/auth';
import { IconNotebook } from '@tabler/icons-react-native';
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

export default function LoginScreen() {
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
        <KeyboardAvoidingView
            style={[styles.flex, { backgroundColor: theme.colors.background }]}
            behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.hero}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                        <IconNotebook size={48} color={theme.colors.onPrimary} strokeWidth={1.4} />
                    </View>
                    <Text variant="headlineMedium" style={styles.heroTitle}>
                        Mathisi
                    </Text>
                    <Text variant="bodyLarge" style={styles.heroSubtitle}>
                        Capture, search, and revisit your handwritten knowledge.
                    </Text>
                </View>
                <LoginForm onNavigateToRegister={() => router.push('/(auth)/register')} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
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
