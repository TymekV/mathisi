import { UserProfile } from '@/components/user-profile';
import { useAuth } from '@/lib/providers/auth';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const theme = useTheme();

    async function handleLogout() {
        await signOut();
        router.replace('/(auth)/login');
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16 }}
            style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
            <UserProfile />

            <Button mode="outlined" onPress={handleLogout} style={{ marginTop: 20 }}>
                Log Out
            </Button>
        </ScrollView>
    );
}
