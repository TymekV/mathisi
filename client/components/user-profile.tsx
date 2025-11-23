import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

interface User {
    email: string;
    username: string;
    id: number;
}

export default function UserProfile() {

    const [user, setUser] = useState<User | null>(null);

    const $api = createClient<paths>({
        baseUrl: apiBaseUrl,
    });

    useEffect(() => {
        getUser();
    }, []);

    async function getUser() {
        const token = await SecureStore.getItemAsync("token");

        const { data, error } = await $api.GET("/api/user", {
            headers: {
                Authorization: token
            },
        });

        if (error) {
            console.error(error);
            return;
        }

        if (data) {
            setUser({
                username: data.username,
                email: data.email,
                id: data.id,
            });
        }
    }

    return (
        <View>
            {!user ? (
                <ActivityIndicator animating={true} />
            ) : (
                <>
                        <Text>Hello {user.username}</Text>
                </>
            )}
        </View>
    );
}
