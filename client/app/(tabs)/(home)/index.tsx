import ArticleFeed from '@/components/article-feed';
import { apiClient } from '@/lib/providers/api';
import { FeedSyncProvider } from '@/reducer/forcereload';
import { useNavigation } from 'expo-router';
import React from 'react';

export default function HomeScreen() {
    const navigation = useNavigation();
    React.useEffect(() => {
        navigation.setOptions({ title: 'Home' });
    }, [navigation]);
    const notesQuery = apiClient.useQuery('get', '/api/notes', undefined, {
        staleTime: 1000 * 1,
        refetchOnWindowFocus: true,
    });

    const items = notesQuery.data?.notes ?? [];

    return (
        <FeedSyncProvider>
            <ArticleFeed
                feed={items}
                searchText="Search through your notes"
                isPending={notesQuery.isPending}
                isRefetching={notesQuery.isRefetching}
                refetch={notesQuery.refetch}
                allowEditing
            />
        </FeedSyncProvider>
    );
}
