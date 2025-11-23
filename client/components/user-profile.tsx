import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import createClient from "openapi-fetch";
import { useEffect } from "react";
import { View } from "react-native";

export default function UserProfile() {

    const $api = createClient<paths>({
        baseUrl: apiBaseUrl,
    });

    useEffect(() => {
    })

    return (
        <View>

        </View>
    )
}