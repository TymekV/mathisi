import { apiBaseUrl } from '@/constants/apiBaseUrl';
import { paths } from '@/types/api';
import { article } from '@/types/article';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import createClient from 'openapi-fetch';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

export default function Users() {
    const { id } = useLocalSearchParams();
    const [note, setNote] = useState<article>();

    const $api = createClient<paths>({
        baseUrl: apiBaseUrl,
    });

    useEffect(() => {
        if (id) getArticle();
    }, [id]);

    async function getArticle() {
        const token = await SecureStore.getItemAsync("token");

        const { data, error } = await $api.GET("/api/notes/{id}", {
            params: { path: { id: parseInt(id[0]) } },
            headers: {
                Authorization: token ?? "",
            },
        });

        if (error) {
            console.error(error);
            return;
        }

        if (data) {
            setNote(data);
        }
    }

    return (
        <ScrollView>
            <Text>Article id: {id}</Text>

            {note ? (
                <>
                    <Text>Title: {note.title}</Text>
                    <Text>{note.content}</Text>
                </>
            ) : (
                <Text>Loading...</Text>
            )}
        </ScrollView>
    );
}
