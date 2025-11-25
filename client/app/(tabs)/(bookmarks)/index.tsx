import ArticleFeed from '@/components/article-feed';
import { apiClient } from '@/lib/providers/api';
import { FeedSyncProvider } from '@/reducer/forcereload';
import { useNavigation } from 'expo-router';
import React from 'react';

export default function BookMarkScreen() {
    const navigation = useNavigation();
    React.useEffect(() => {
        navigation.setOptions({ title: 'Bookmarks' });
    }, [navigation]);
    // change end point
    const notesQuery = apiClient.useQuery('get', '/api/notes/bookmark', undefined, {
        staleTime: 1000 * 1,
    });

    const items = notesQuery.data?.notes ?? [];

    return (
        <FeedSyncProvider>
            <ArticleFeed
                feed={items}
                searchText="Search through bookmarks notes"
                isPending={notesQuery.isPending}
                isRefetching={notesQuery.isRefetching}
                refetch={notesQuery.refetch}
            />
        </FeedSyncProvider>
    );
}
