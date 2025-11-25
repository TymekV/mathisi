import ArticleCard from '@/components/article-card';
import type { components } from '@/types/api';
import { article } from '@/types/article';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

interface Props  {
    feed : article[],
    isPending : boolean,
    isRefetching: boolean,
    refetch : () => void, 
    searchText : string,
}

export default function ArticleFeed({ feed,isPending,isRefetching,refetch,searchText }: Props) {
    const [searchQuery, setSearchQuery] = useState('');


    const filteredNotes = useMemo(() => {
        const items = feed ?? [];
        if (searchQuery.trim() === "") {
            return items;
        }

        return items.filter(
            (note) =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

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
            placeholder={searchText}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
        />
    );

    if (isPending) {
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
            refreshing={isRefetching}
            onRefresh={() => {
                refetch
                setSearchQuery("")
            }}
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