import { apiBaseUrl } from '@/constants/apiBaseUrl';
import { paths } from '@/types/api';
import { article } from '@/types/article';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import createClient from 'openapi-fetch';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
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
                Authorization: token,
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

            {note ? (
                <>
                    <Text style={markdownStylesDisplay.heading1}>{note.title}</Text>
                    <ScrollView style={styles.previewContainer}>
                        <Markdown style={markdownStylesDisplay}>
                            {note.content}
                        </Markdown>
                    </ScrollView>
                </>
            ) : (
                <Text>Loading...</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#1e1e1e',
    },
    centerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    fill1: {
        flex: 1,
    },
    editorContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        backgroundColor: '#1e1e1e',
    },
    markdownInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        padding: 10,
        textAlignVertical: 'top',
    },
    previewContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#252525',
        color: 'white'
    }
});
// Styles for the 'react-native-markdown-display' renderer
const markdownStylesDisplay = StyleSheet.create({
    body: { color: 'white' },
    heading1: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    heading2: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    list_item: { color: 'white', flexDirection: 'row', alignItems: 'flex-start' },
    bullet_list_icon: { color: 'white', fontSize: 20 },
    code_inline: { backgroundColor: '#333', color: '#ff79c6' },
    code_block: { backgroundColor: '#333', padding: 10, borderRadius: 4 },
});
