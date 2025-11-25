import { NoteComposer } from '@/components/note-composer';
import { apiClient } from '@/lib/providers/api';
import { OCR } from '@dccarmo/react-native-ocr';
import { IconFileDescription, IconPhoto } from '@tabler/icons-react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';

export default function AddNewScreen() {
    const [isWriting, setIsWriting] = useState<boolean>(false);
    const [writing, setWriting] = useState<string>('');
    const uploadFilesMutation = apiClient.useMutation('post', '/api/files');
    const updateFileMutation = apiClient.useMutation('patch', '/api/files/{id}');
    const theme = useTheme();

    const startScratch = () => {
        setWriting('');
        setIsWriting(true);
    };

    const handleComposerClose = () => {
        setWriting('');
        setIsWriting(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <NoteComposer
                initialContent={writing}
                onContentChange={setWriting}
                onClose={handleComposerClose}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        gap: 15,
    },
    fab: {
        width: '50%',
    },
});
