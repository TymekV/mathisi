import { apiBaseUrl } from '@/constants/apiBaseUrl';
import { getAuthToken } from '@/lib/auth/token';
import type { components, paths } from '@/types/api';
import {
    IconArrowBigDownLinesFilled,
    IconArrowBigUpLineFilled,
    IconBookmark,
    IconBookmarkFilled,
    IconCards,
    IconPencil,
    IconShare2,
} from '@tabler/icons-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import createClient from 'openapi-fetch';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, Surface, Text } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

type Props = {
    article: Note;
    onUpdate?: () => void;
    canEdit?: boolean;
};

// Create a single API client instance outside component
const $api = createClient<paths>({
    baseUrl: apiBaseUrl,
});

function ArticleCardComponent({ article, onUpdate, canEdit = false }: Props) {
    const queryClient = useQueryClient();

    // Use React Query for fetching note data - single source of truth
    const { data: note, refetch } = useQuery({
        queryKey: ['note', article.id],
        queryFn: async () => {
            const token = await SecureStore.getItemAsync('token');
            const { data, error } = await $api.GET('/api/notes/{id}', {
                params: {
                    path: { id: article.id },
                },
                headers: {
                    Authorization: token ?? '',
                },
            });

            if (error) {
                throw error;
            }
            return data;
        },
        initialData: article, // Use prop as initial data
        staleTime: 0, // Always consider data stale
    });

    // Derived state from the query data
    const vote = note?.user_vote ?? 0;
    const bookmarked = note?.user_bookmark ?? false;

    const createdLabel = useMemo(
        () => timeAgo(note?.created_at ?? article.created_at),
        [note?.created_at, article.created_at]
    );
    const excerpt = useMemo(
        () => (note?.content ?? article.content).slice(0, 180).trim(),
        [note?.content, article.content]
    );
    const title = note?.title ?? article.title;

    // Refetch on screen focus - wrapped in useCallback to prevent infinite loop
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleNavigate = useCallback(() => {
        router.push({
            pathname: '/article/[id]',
            params: { id: String(article.id) },
        });
    }, [article.id]);

    async function Quiz() {

        const token = await getAuthToken()
        const { data, error } = await $api.POST('/api/notes/{id}/quiz', {
            params: {
                path: { id: article.id },
            },
            headers: {
                Authorization: token ?? '',
            },
        });
    }

    async function Cards() {
        const token = await getAuthToken()
        const { data, error } = await $api.POST('/api/notes/{id}/cards', {
            params: {
                path: { id: article.id },
            },
            headers: {
                Authorization: token ?? '',
            },
        });
    }

    const handleQuizNavigate = useCallback(async () => {
        Quiz()
        Cards()

        router.push({
            pathname: '/quiz/[id]',
            params: { id: String(article.id) },
        });
    }, [article.id]);

    const handleEditNavigate = useCallback(() => {
        router.push({
            pathname: '/article/[id]/edit',
            params: { id: String(article.id) },
        });
    }, [article.id]);

    const handleShare = useCallback(async () => {
        try {
            await Share.share({
                message: `${title}\n\n${excerpt}`,
            });
        } catch (error) {
            console.error('Share failed', error);
        }
    }, [title, excerpt]);

    // Helper to invalidate queries and notify parent
    const invalidateAndUpdate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        queryClient.invalidateQueries({ queryKey: ['note', article.id] });
        onUpdate?.();
    }, [queryClient, article.id, onUpdate]);

    // --- Mutations ---

    const bookmarkMutation = useMutation({
        mutationFn: async () => {
            const token = await SecureStore.getItemAsync('token');
            const { data, error } = await $api.POST('/api/notes/{id}/bookmark', {
                params: {
                    path: { id: article.id },
                },
                headers: {
                    Authorization: token ?? '',
                },
            });

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: (data) => {
            // Optimistically update the cache
            queryClient.setQueryData(['note', article.id], (old: Note | undefined) => {
                if (!old) return old;
                return { ...old, user_bookmark: data.marked };
            });
            invalidateAndUpdate();
        },
        onError: (error) => {
            console.error('Bookmark failed', error);
        },
    });

    const upvoteMutation = useMutation({
        mutationFn: async () => {
            const token = await SecureStore.getItemAsync('token');
            const { data, error } = await $api.POST('/api/notes/{id}/upvote', {
                params: {
                    path: { id: article.id },
                },
                headers: {
                    Authorization: token ?? '',
                },
            });

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: (data) => {
            // Update cache with new vote value
            queryClient.setQueryData(['note', article.id], (old: Note | undefined) => {
                if (!old) return old;
                return { ...old, user_vote: data.is_upvoted };
            });
            invalidateAndUpdate();
        },
        onError: (error) => {
            console.error('Upvote failed', error);
        },
    });

    const downvoteMutation = useMutation({
        mutationFn: async () => {
            const token = await SecureStore.getItemAsync('token');
            const { data, error } = await $api.POST('/api/notes/{id}/downvote', {
                params: {
                    path: { id: article.id },
                },
                headers: {
                    Authorization: token ?? '',
                },
            });

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: (data) => {
            // Update cache with new vote value
            const newVote = (data as any).is_upvoted === -1 ? -1 : 0;
            queryClient.setQueryData(['note', article.id], (old: Note | undefined) => {
                if (!old) return old;
                return { ...old, user_vote: newVote };
            });
            invalidateAndUpdate();
        },
        onError: (error) => {
            console.error('Downvote failed', error);
        },
    });

    const anyVoteLoading = upvoteMutation.isPending || downvoteMutation.isPending;

    return (
        <Card mode="elevated" style={styles.card}>
            <Pressable onPress={handleNavigate}>
                <Card.Content style={styles.header}>
                    <Surface style={styles.avatar} elevation={1}>
                        <Text variant="titleMedium">{title[0]?.toUpperCase()}</Text>
                    </Surface>
                    <View style={styles.meta}>
                        <Text variant="titleMedium">{title}</Text>
                        <Text variant="bodySmall" style={styles.metaMuted}>
                            Updated {createdLabel}
                        </Text>
                    </View>
                </Card.Content>
                <Divider style={styles.divider} />
                <Card.Content style={styles.body}>
                    <Text variant="bodyMedium" numberOfLines={3}>
                        {excerpt}
                    </Text>
                </Card.Content>
            </Pressable>
            <Card.Actions style={styles.actions}>
                {/* I love material ui so much */}
                <IconButton icon={() => <></>} style={{ opacity: 0 }} />
                <IconButton
                    icon={({ color, size }) => (
                        <IconArrowBigUpLineFilled
                            color={vote === 1 ? '#2f9e44' : color}
                            size={size}
                        />
                    )}
                    onPress={() => upvoteMutation.mutate()}
                    disabled={anyVoteLoading}
                />
                <IconButton
                    icon={({ color, size }) => (
                        <IconArrowBigDownLinesFilled
                            color={vote === -1 ? '#f03e3e' : color}
                            size={size}
                        />
                    )}
                    onPress={() => downvoteMutation.mutate()}
                    disabled={anyVoteLoading}
                />
                <IconButton
                    icon={({ color, size }) => <IconCards color={color} size={size} />}
                    onPress={handleQuizNavigate}
                />
                {canEdit && (
                    <IconButton
                        icon={({ color, size }) => <IconPencil color={color} size={size} />}
                        onPress={handleEditNavigate}
                    />
                )}
                <IconButton
                    icon={({ color, size }) =>
                        bookmarked ? (
                            <IconBookmarkFilled color={color} size={size} />
                        ) : (
                            <IconBookmark color={color} size={size} />
                        )
                    }
                    onPress={() => bookmarkMutation.mutate()}
                    disabled={bookmarkMutation.isPending}
                />
                <IconButton
                    icon={({ color, size }) => <IconShare2 size={size} color={color} />}
                    onPress={handleShare}
                />
            </Card.Actions>
        </Card>
    );
}

function timeAgo(dateString: string): string {
    const now = Date.now();
    const timestamp = new Date(dateString).getTime();
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    const intervals: Array<[string, number]> = [
        ['year', 31_536_000],
        ['month', 2_592_000],
        ['week', 604_800],
        ['day', 86_400],
        ['hour', 3_600],
        ['minute', 60],
    ];

    for (const [label, value] of intervals) {
        const result = Math.floor(seconds / value);
        if (result >= 1) {
            return `${result} ${label}${result > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}

export default memo(ArticleCardComponent);

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    meta: {
        flex: 1,
        gap: 2,
    },
    metaMuted: {
        opacity: 0.7,
    },
    divider: {
        marginTop: 12,
    },
    body: {
        marginTop: 8,
    },
    actions: {
        justifyContent: 'flex-end',
    },
});
