import PaperAppbarHeader from '@/components/navigation/paper-appbar-header';
import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'manual',
};

export default function Layout() {
    return (
        <Stack screenOptions={{ header: (props) => <PaperAppbarHeader {...props} /> }}></Stack>
    );
}
