import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function FeedLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home' }} />
            <Stack.Screen name="article/[id]" options={{ headerShown: true, headerTitle: "" }} />
        </Stack>
    );
}
