import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function FeedLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
            <Stack.Screen name="article/[id]" options={{ headerShown: false, headerTitle: "" }} />
        </Stack>
    );
}
