import ArticleFeed from '@/components/article-feed';
import { apiClient } from '@/lib/providers/api';

export default function FeedScreen() {

    // change end point
    const notesQuery = apiClient.useQuery('get', '/api/notes', undefined, {
        staleTime: 1000 * 60,
    });

    const items = notesQuery.data?.notes ?? []

    return (
        <ArticleFeed
            feed={items}
            searchText='Search through global notes'
            isPending={notesQuery.isPending}
            isRefetching={notesQuery.isRefetching}
            refetch={notesQuery.refetch}
             />
    );
}