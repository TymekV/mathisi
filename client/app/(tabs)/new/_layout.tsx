import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'manual',
};

export default function Layout() {
    return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
