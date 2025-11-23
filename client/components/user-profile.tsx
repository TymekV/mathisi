import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import { useEffect } from "react";
import { View } from "react-native";

export default function UserProfile() {

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
        console.log(data)
        console.log(response)
        console.log(error)
    }

    return (
        <View>

        </View>
    )
}