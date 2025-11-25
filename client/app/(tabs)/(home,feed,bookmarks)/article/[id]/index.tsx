import { apiClient } from '@/lib/providers/api';
import type { components } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ActivityIndicator, Button, Surface, Text, useTheme } from 'react-native-paper';

type Note = components['schemas']['NoteResponse'];

export default function NoteDetailsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const numericId = rawId ? Number(rawId) : Number.NaN;

    const queryEnabled = Number.isFinite(numericId);
    const noteQuery = apiClient.useQuery(
        'get',
        '/api/notes/{id}',
        { params: { path: { id: queryEnabled ? numericId : 0 } } },
        {
            enabled: queryEnabled,
        }
    );

    const note: Note | undefined = noteQuery.data;
    const codeFontFamily = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
    const markdownStyles = useMemo(
        () => createMarkdownStyles(theme, codeFontFamily),
        [theme, codeFontFamily]
    );

    const createdRelative = useMemo(
        () => (note ? formatRelativeTime(note.created_at) : ''),
        [note?.created_at]
    );
    const createdAbsolute = useMemo(
        () => (note ? formatAbsoluteDate(note.created_at) : ''),
        [note?.created_at]
    );

    const handleEditPress = useCallback(() => {
        if (!Number.isFinite(numericId)) {
            return;
        }
        router.push({
            pathname: '/article/[id]/edit',
            params: { id: String(numericId) },
        });
    }, [numericId, router]);
    const metaStats = useMemo(
        () =>
            note
                ? [
                      { label: 'Votes', value: `${note.votes}` },
                      { label: 'Saves', value: `${note.saves}` },
                      { label: 'Visibility', value: note.public ? 'Public' : 'Private' },
                  ]
                : [],
        [note]
    );

    const loaderBackground = { backgroundColor: theme.colors.background };
    const loaderText = { color: theme.colors.onBackground };

    if (!queryEnabled) {
        return (
            <View style={[styles.loaderContainer, loaderBackground]}>
                <Text variant="bodyMedium" style={loaderText}>
                    Invalid note identifier.
                </Text>
            </View>
        );
    }

    if (noteQuery.isPending) {
        return (
            <View style={[styles.loaderContainer, loaderBackground]}>
                <ActivityIndicator animating />
            </View>
        );
    }

    if (!note) {
        return (
            <View style={[styles.loaderContainer, loaderBackground]}>
                <Text variant="bodyMedium" style={loaderText}>
                    Note not found.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            contentContainerStyle={styles.detailsContainer}
        >
            <View style={styles.headerSection}>
                <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                    {note.title}
                </Text>
                <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
                    Created {createdAbsolute} · {createdRelative}
                </Text>
                <View style={styles.metaRow}>
                    {metaStats.map((stat) => (
                        <Surface
                            key={stat.label}
                            elevation={0}
                            style={[
                                styles.metaPill,
                                {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderColor:
                                        theme.colors.outlineVariant || theme.colors.outline,
                                },
                            ]}
                        >
                            <Text
                                style={[styles.metaLabel, { color: theme.colors.onSurfaceVariant }]}
                            >
                                {stat.label}
                            </Text>
                            <Text
                                style={[styles.metaValue, { color: theme.colors.onSurface }]}
                            >{` ${stat.value}`}</Text>
                        </Surface>
                    ))}
                </View>
                <View style={styles.headerActions}>
                    <Button mode="outlined" onPress={handleEditPress}>
                        Edit note
                    </Button>
                </View>
            </View>
            <Surface
                elevation={0}
                style={[
                    styles.previewContainer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outlineVariant || theme.colors.outline,
                    },
                ]}
            >
                <Markdown style={markdownStyles}>{note.content}</Markdown>
            </Surface>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    previewContainer: {
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
    },
    loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    detailsContainer: {
        padding: 20,
        gap: 20,
    },
    headerSection: {
        gap: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    timestamp: {
        fontSize: 14,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    headerActions: {
        marginTop: 8,
        alignItems: 'flex-start',
    },
    metaPill: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});

function createMarkdownStyles(theme: any, codeFontFamily: string) {
    const codeShell = {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant || theme.colors.outline,
        backgroundColor: theme.colors.surfaceVariant,
    } as const;

    return StyleSheet.create({
        body: {
            color: theme.colors.onSurface,
            fontSize: 16,
            lineHeight: 24,
        },
        heading1: {
            color: theme.colors.onSurface,
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 12,
        },
        heading2: {
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: '600',
            marginTop: 18,
            marginBottom: 8,
        },
        list_item: {
            color: theme.colors.onSurface,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        code_inline: {
            ...codeShell,
            fontFamily: codeFontFamily,
            color: theme.colors.onSecondaryContainer,
            paddingHorizontal: 8,
            paddingVertical: 2,
            backgroundColor: theme.colors.secondaryContainer,
        },
        code_block: {
            ...codeShell,
            paddingHorizontal: 14,
            paddingVertical: 12,
        },
        fence: {
            ...codeShell,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontFamily: codeFontFamily,
            color: theme.colors.onSurface,
        },
    });
}

function formatRelativeTime(dateString: string): string {
    const now = Date.now();
    const timestamp = new Date(dateString).getTime();
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    const intervals: [string, number][] = [
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

function formatAbsoluteDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
