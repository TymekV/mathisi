import { apiClient } from '@/lib/providers/api';
import type { components } from '@/types/api';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ActivityIndicator, Text } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

export default function NoteDetailsScreen() {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const numericId = rawId ? Number(rawId) : Number.NaN;

    const queryEnabled = Number.isFinite(numericId);
    const noteQuery = apiClient.useQuery(
        'get',
        '/api/notes/{id}',
        { params: { path: { id: queryEnabled ? numericId : 0 } } },
        {
            enabled: queryEnabled,
        }
    );

    if (!queryEnabled) {
        return (
            <View style={styles.loaderContainer}>
                <Text variant="bodyMedium">Invalid note identifier.</Text>
            </View>
        );
    }

    if (noteQuery.isPending) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating />
            </View>
        );
    }

    const note: Note | undefined = noteQuery.data;

    if (!note) {
        return (
            <View style={styles.loaderContainer}>
                <Text variant="bodyMedium">Note not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.detailsContainer}>
            <Text style={markdownStylesDisplay.heading1}>{note.title}</Text>
            <View style={styles.previewContainer}>
                <Markdown style={markdownStylesDisplay}>{note.content}</Markdown>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    previewContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#252525',
        borderRadius: 12,
    },
    loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    detailsContainer: {
        padding: 16,
        gap: 16,
    },
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
