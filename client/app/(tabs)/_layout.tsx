import TabBar from '@/components/TabBar';
import PaperAppbarHeader from '@/components/navigation/paper-appbar-header';
import { useAuth } from '@/lib/providers/auth';
import {
    IconBookmark,
    IconCamera,
    IconHome,
    IconPlus,
    IconUser,
    IconWorld,
} from '@tabler/icons-react-native';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function Layout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator animating />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                header: (props) => <PaperAppbarHeader {...props} />,
            }}
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    headerShown: false,
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <IconHome color={color} size={24} strokeWidth={focused ? 2.2 : 1.6} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(feed)"
                options={{
                    headerShown: false,
                    title: 'Feed',
                    tabBarIcon: ({ color, focused }) => (
                        <IconWorld color={color} size={24} strokeWidth={focused ? 2.2 : 1.6} />
                    ),
                }}
            />
            <Tabs.Screen
                name="new"
                options={{
                    title: 'New',
                    tabBarIcon: ({ color, focused }) => (
                        <IconPlus color={color} size={24} strokeWidth={focused ? 2.2 : 1.6} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(bookmarks)"
                options={{
                    headerShown: false,
                    title: 'Bookmarks',
                    tabBarIcon: ({ color, focused }) => (
                        <IconBookmark color={color} size={24} strokeWidth={focused ? 2.2 : 1.6} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <IconUser color={color} size={24} strokeWidth={focused ? 2.2 : 1.6} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
