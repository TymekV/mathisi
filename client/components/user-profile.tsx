import { apiClient } from '@/lib/providers/api';
import type { components } from '@/types/api';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Surface, Text } from 'react-native-paper';

type User = components['schemas']['UserResponse'];

function UserProfileComponent() {
    const userQuery = apiClient.useQuery('get', '/api/user');

    const joinedLabel = useMemo(() => {
        if (!userQuery.data?.created_at) {
            return '';
        }

        return new Date(userQuery.data.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, [userQuery.data?.created_at]);

    if (userQuery.isPending) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator animating />
            </View>
        );
    }

    const user: User | undefined = userQuery.data;

    if (!user) {
        return (
            <View style={styles.loader}>
                <Text variant="bodyMedium">We couldn't load your profile.</Text>
            </View>
        );
    }

    return (
        <Surface style={styles.container} elevation={1}>
            <Avatar.Text label={user.username.slice(0, 2).toUpperCase()} size={56} />
            <View style={styles.details}>
                <Text variant="titleMedium">{user.username}</Text>
                <Text variant="bodyMedium" style={styles.subtle}>
                    {user.email}
                </Text>
                <Text variant="bodySmall" style={styles.subtle}>
                    Member since {joinedLabel}
                </Text>
            </View>
        </Surface>
    );
}

export const UserProfile = memo(UserProfileComponent);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    details: {
        flex: 1,
    },
    subtle: {
        opacity: 0.7,
    },
    loader: {
        padding: 24,
        alignItems: 'center',
    },
});
