import { UserProfile } from '@/components/user-profile';
import { useAuth } from '@/lib/providers/auth';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const theme = useTheme();

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);

        // If your UserProfile component has a reload func, call it here
        // await reloadUserProfile();

        // Simulate delay or real data fetching
        await new Promise(resolve => setTimeout(resolve, 800));

        setRefreshing(false);
    }, []);

    async function handleLogout() {
        await signOut();
        router.replace('/(auth)/login');
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16 }}
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                />
            }
        >
            <UserProfile />
            <Button mode="outlined" onPress={handleLogout} style={{ marginTop: 20 }}>
                Log Out
            </Button>
        </ScrollView>
    );
}
