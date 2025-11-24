import ArticleCard from '@/components/article-card';
import { apiClient } from '@/lib/providers/api';
import type { components } from '@/types/api';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const notesQuery = apiClient.useQuery('get', '/api/notes', undefined, {
        staleTime: 1000 * 60,
    });

    const filteredNotes = useMemo(() => {
        const items = notesQuery.data?.notes ?? [];
        if (!searchQuery.trim()) {
            return items;
        }

        return items.filter(
            (note) =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notesQuery.data?.notes, searchQuery]);

    const renderItem = useCallback<ListRenderItem<Note>>(
        ({ item }) => (
            <View style={styles.cardContainer}>
                <ArticleCard article={item} />
            </View>
        ),
        []
    );

    const listHeader = (
        <Searchbar
            placeholder="Search notes"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
        />
    );

    if (notesQuery.isPending) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating />
            </View>
        );
    }

    return (
        <FlatList<Note>
            data={filteredNotes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
            refreshing={notesQuery.isRefetching}
            onRefresh={notesQuery.refetch}
            ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                    <Text variant="titleMedium">No notes yet</Text>
                    <Text variant="bodyMedium" style={styles.emptyStateDescription}>
                        Start by creating your first note.
                    </Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    searchbar: {
        marginVertical: 16,
    },
    cardContainer: {
        paddingVertical: 8,
    },
    loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyStateDescription: {
        marginTop: 4,
        textAlign: 'center',
        opacity: 0.7,
    },
});
