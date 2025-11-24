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
    created_at: string
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
            console.log(data);
            const date = new Date(data.created_at);
            setUser({
                username: data.username,
                email: data.email,
                id: data.id,
                created_at: date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
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
                    <Text>Create at {user.created_at}</Text>
                </>
            )}
        </View>
    );
}
