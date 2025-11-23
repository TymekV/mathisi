import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

interface user{
    email : string,
    username : string,
    id : string,
}

export default function UserProfile() {

    const [user, setUser] = useState<user | undefined>(undefined);

    const $api = createClient<paths>({
        baseUrl: apiBaseUrl,
    });

    useEffect(() => {
        get()
    })



    async function get() {
        const token = await SecureStore.getItemAsync('token');
        const { data, error, response } = await $api.GET("/api/user", {
            headers: {
                "Authorization": token,
            }
        });
    
    }

    return (
        <View>
            {
                user ?
                <ActivityIndicator animating={true}  />
                :
                <Text>Hello {}</Text>
            }
        </View>
    )
}