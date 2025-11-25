import ArticleFeed from '@/components/article-feed';
import { apiClient } from '@/lib/providers/api';
import { FeedSyncProvider } from '@/reducer/forcereload';

export default function BookMarkScreen() {
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
