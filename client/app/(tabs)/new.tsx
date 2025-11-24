import { NoteComposer } from '@/components/note-composer';
import { apiClient } from '@/lib/providers/api';
import { OCR } from '@dccarmo/react-native-ocr';
import { IconFileDescription, IconPhoto } from '@tabler/icons-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

export default function AddNewScreen() {
    const [isWriting, setIsWriting] = useState<boolean>(false);
    const [writing, setWriting] = useState<string>('');
    const uploadFilesMutation = apiClient.useMutation('post', '/api/files');
    const updateFileMutation = apiClient.useMutation('patch', '/api/files/{id}');

    const startScratch = () => {
        setWriting('');
        setIsWriting(true);
    };

    const pickImage = async () => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
        });

        if (pickerResult.canceled) return;

        const uri = pickerResult.assets[0].uri;
        const text = await OCR.recognizeText(uri);
        setWriting(text || '');
        setIsWriting(true);

        const files = await askFiles();

        if (files) {
            try {
                const uploadResponse = await uploadFilesMutation.mutateAsync({
                    body: files as any,
                });
                await Promise.all(
                    uploadResponse?.files.map((file) =>
                        updateFileMutation.mutateAsync({
                            params: { path: { id: file.id } },
                            body: { filename: file.filename, ocr: text },
                        })
                    ) ?? []
                );
            } catch (error) {
                console.error('Failed to process files', error);
            }
        }
    };

    async function askFiles() {
        const files = await DocumentPicker.getDocumentAsync({
            multiple: true,
            copyToCacheDirectory: true,
        });

        if (!files.assets || files.assets.length === 0) {
            return null;
        }

        const formData = new FormData();
        files.assets.forEach((file) => {
            formData.append('files', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/octet-stream',
            } as any);
        });

        return formData;
    }

    const handleComposerClose = () => {
        setWriting('');
        setIsWriting(false);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            {isWriting ? (
                <NoteComposer
                    initialContent={writing}
                    onContentChange={setWriting}
                    onClose={handleComposerClose}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <FAB
                        icon={({ size, color }) => <IconPhoto size={size} color={color} />}
                        label="Add from photo"
                        style={styles.fab}
                        onPress={pickImage}
                    />
                    <FAB
                        icon={({ size, color }) => (
                            <IconFileDescription size={size} color={color} />
                        )}
                        label="Start from scratch"
                        style={styles.fab}
                        onPress={startScratch}
                    />
                </View>
            )}
        </ScrollView>
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
