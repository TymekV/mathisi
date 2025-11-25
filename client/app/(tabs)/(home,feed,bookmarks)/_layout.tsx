import PaperAppbarHeader from '@/components/navigation/paper-appbar-header';
import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function FeedLayout() {
    return (
        <Stack screenOptions={{ header: (props) => <PaperAppbarHeader {...props} /> }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="article/[id]" options={{ title: 'Article' }} />
            <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz' }} />
        </Stack>
    );
}
