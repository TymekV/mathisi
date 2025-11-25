import { NoteComposer } from '@/components/note-composer';
import { apiClient } from '@/lib/providers/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';

export default function EditNoteScreen() {
    const theme = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<{ id?: string | string[] }>();

    const numericId = useMemo(() => {
        const raw = Array.isArray(params.id) ? params.id[0] : params.id;
        const parsed = raw ? Number(raw) : Number.NaN;
        return Number.isFinite(parsed) ? parsed : undefined;
    }, [params.id]);

    const queryEnabled = typeof numericId === 'number';

    const noteQuery = apiClient.useQuery(
        'get',
        '/api/notes/{id}',
        { params: { path: { id: numericId ?? 0 } } },
        { enabled: queryEnabled }
    );

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    const handleSuccess = useCallback(
        (id?: number) => {
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['note', id] });
            }
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
        [queryClient]
    );

    if (!queryEnabled) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onBackground, marginBottom: 12 }}
                >
                    A valid note id is required to edit.
                </Text>
                <Button mode="contained" onPress={handleClose}>
                    Go Back
                </Button>
            </View>
        );
    }

    if (noteQuery.isPending) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating />
            </View>
        );
    }

    if (!noteQuery.data) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onBackground, marginBottom: 12 }}
                >
                    We could not find that note.
                </Text>
                <Button mode="contained" onPress={handleClose}>
                    Go Back
                </Button>
            </View>
        );
    }

    return (
        <NoteComposer
            initialContent={noteQuery.data.content}
            initialTitle={noteQuery.data.title}
            noteId={noteQuery.data.id}
            onClose={handleClose}
            onSubmitSuccess={handleSuccess}
        />
    );
}
