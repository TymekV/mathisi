import { useAuth } from '@/lib/providers/auth';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';

export default function IndexScreen() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/(home)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
