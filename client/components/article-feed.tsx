import ArticleCard from '@/components/article-card';
import type { components } from '@/types/api';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text, useTheme } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

interface Props {
    feed: Note[];
    isPending: boolean;
    isRefetching: boolean;
    refetch: () => void;
    searchText: string;
    onUpdate?: () => void;
    allowEditing?: boolean;
}

export default function ArticleFeed({
    feed,
    isPending,
    isRefetching,
    refetch,
    searchText,
    onUpdate,
    allowEditing = false,
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();

    const filteredNotes = useMemo(() => {
        const items = feed ?? [];
        if (searchQuery.trim() === '') {
            return items;
        }

        return items.filter(
            (note) =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, feed]);

    const renderItem = useCallback<ListRenderItem<Note>>(
        ({ item }) => (
            <View style={styles.cardContainer}>
                <ArticleCard
                    article={item}
                    onUpdate={onUpdate}
                    canEdit={allowEditing}
                    key={isRefetching ? 1 : 0 + item.id}
                />
            </View>
        ),
        [allowEditing, isRefetching, onUpdate]
    );

    const handleRefresh = useCallback(() => {
        refetch();
        setSearchQuery('');
    }, [refetch]);

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
        <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            <FlatList<Note>
                data={filteredNotes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                contentContainerStyle={styles.listContent}
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Text variant="titleMedium">No notes yet</Text>
                        <Text variant="bodyMedium" style={styles.emptyStateDescription}>
                            Start by creating your first note.
                        </Text>
                    </View>
                )}
            />
        </View>
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
