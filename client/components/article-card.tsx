import type { components } from '@/types/api';
import {
    IconArrowBigDownLinesFilled,
    IconArrowBigUpLineFilled,
    IconBookmark,
    IconBookmarkFilled,
    IconCards,
    IconShare2
} from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, Surface, Text } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

type Props = {
    article: Note;
};

function ArticleCardComponent({ article }: Props) {
    const [vote, setVote] = useState<-1 | 0 | 1>(0);
    const [bookmarked, setBookmarked] = useState(article.user_bookmark);
    const createdLabel = useMemo(() => timeAgo(article.created_at), [article.created_at]);
    const excerpt = useMemo(() => article.content.slice(0, 180).trim(), [article.content]);

    const handleNavigate = () => {
        router.push({
            pathname: '/article/[id]',
            params: { id: String(article.id) },
        });
    };
    const handleQuizNavigate = () => {
        router.push({
            pathname: '/quiz/[id]',
            params: { id: String(article.id) },
        });
    };

    useEffect(() =>{
        if(article.user_vote == -1){
            setVote(-1)  
        }else if(article.user_vote == 1){
            setVote(1)  
        }else{
            setVote(0)  
        }
    })

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${article.title}\n\n${excerpt}`,
            });
        } catch (error) {
            console.error('Share failed', error);
        }
    };

    const bookMark = async () =>{

    }

    return (
        <Card mode="elevated" style={styles.card}>
            <Pressable onPress={handleNavigate}>
                <Card.Content style={styles.header}>
                    <Surface style={styles.avatar} elevation={1}>
                        <Text variant="titleMedium">{article.title[0]?.toUpperCase()}</Text>
                    </Surface>
                    <View style={styles.meta}>
                        <Text variant="titleMedium">{article.title}</Text>
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
                <IconButton
                    icon={({ color, size }) => (
                        <IconArrowBigUpLineFilled
                            color={vote === 1 ? '#2f9e44' : color}
                            size={size}
                        />
                    )}
                    onPress={() => setVote((current) => (current === 1 ? 0 : 1))}
                />
                <IconButton
                    icon={({ color, size }) => (
                        <IconArrowBigDownLinesFilled
                            color={vote === -1 ? '#f03e3e' : color}
                            size={size}
                        />
                    )}
                    onPress={() => setVote((current) => (current === -1 ? 0 : -1))}
                />
                <IconButton
                    icon={({ color, size }) => <IconCards color={color} size={size} />}
                    onPress={() => handleQuizNavigate()}
                />
                <IconButton
                    icon={({ color, size }) =>
                        bookmarked ? (
                            <IconBookmarkFilled color={color} size={size} />
                        ) : (
                            <IconBookmark color={color} size={size} />
                        )
                    }
                    onPress={() => setBookmarked((prev) => !prev)}
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
