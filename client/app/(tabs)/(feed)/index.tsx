import ArticleFeed from '@/components/article-feed';
import { apiClient } from '@/lib/providers/api';
import { FeedSyncProvider } from '@/reducer/forcereload';
import { useNavigation } from 'expo-router';
import React from 'react';

export default function FeedScreen() {
    const navigation = useNavigation();
    React.useEffect(() => {
        navigation.setOptions({ title: 'Feed' });
    }, [navigation]);
    const notesQuery = apiClient.useQuery('get', '/api/feed', undefined, {
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
    });

    const { refetch, data, isPending, isRefetching } = notesQuery;

    return (
        <FeedSyncProvider>
            <ArticleFeed
                feed={data?.notes ?? []}
                searchText="Search through global notes"
                isPending={isPending}
                isRefetching={isRefetching}
                refetch={refetch}
            />
        </FeedSyncProvider>
    );
}