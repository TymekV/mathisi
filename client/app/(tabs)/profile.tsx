import { UserProfile } from '@/components/user-profile';
import { useAuth } from '@/lib/providers/auth';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

export default function ProfileScreen() {
    const { signOut } = useAuth();

    async function handleLogout() {
        await signOut();
        router.replace('/(auth)/login');
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <UserProfile />
            <Button mode="outlined" onPress={handleLogout} style={{ marginTop: 20 }}>
                Log Out
            </Button>
        </ScrollView>
    );
}
