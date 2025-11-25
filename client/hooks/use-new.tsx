import { apiClient } from '@/lib/providers/api';
import { OCR } from '@dccarmo/react-native-ocr';
import { IconFileDescription, IconPhoto } from '@tabler/icons-react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';

export function useNew() {
    const uploadFilesMutation = apiClient.useMutation('post', '/api/files');
    const updateFileMutation = apiClient.useMutation('patch', '/api/files/{id}');
    const pickImage = async () => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (pickerResult.canceled || !pickerResult.assets?.length) {
            return;
        }

        const assets = pickerResult.assets;
        const ocrEntries: { filename: string; text: string }[] = [];
        const formData = new FormData();

        for (const asset of assets) {
            formData.append('files', {
                uri: asset.uri,
                name: asset.fileName || `image-${asset.assetId || Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            } as any);

            try {
                const text = (await OCR.recognizeText(asset.uri))?.trim() ?? '';
                ocrEntries.push({ filename: asset.fileName || asset.uri, text });
            } catch (error) {
                console.error('OCR failed for asset', asset.uri, error);
                ocrEntries.push({ filename: asset.fileName || asset.uri, text: '' });
            }
        }

        const combinedText = ocrEntries
            .map((entry) => entry.text)
            .filter(Boolean)
            .join('\n\n');

        try {
            const uploadResponse = await uploadFilesMutation.mutateAsync({
                body: formData as any,
            });

            await Promise.all(
                uploadResponse?.files.map((file, index) =>
                    updateFileMutation.mutateAsync({
                        params: { path: { id: file.id } },
                        body: {
                            filename: file.filename,
                            ocr: ocrEntries[index]?.text ?? '',
                        },
                    })
                ) ?? []
            );
        } catch (error) {
            console.error('Failed to process files', error);
        }
    };

    return { pickImage };
}
