import type { AiNoteAttachment } from '@/lib/state/ai-note-draft';
import { apiClient } from '@/lib/providers/api';
import { OCR } from '@dccarmo/react-native-ocr';
import * as ImagePicker from 'expo-image-picker';

type PickImageOptions = {
    onStatus?: (message: string) => void;
};

export function useNew() {
    const uploadFilesMutation = apiClient.useMutation('post', '/api/files');
    const updateFileMutation = apiClient.useMutation('patch', '/api/files/{id}');

    const pickImage = async ({ onStatus }: PickImageOptions = {}): Promise<AiNoteAttachment[]> => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (pickerResult.canceled || !pickerResult.assets?.length) {
            onStatus?.('');
            return [];
        }

        const assets = pickerResult.assets;
        const formData = new FormData();
        const ocrEntries: { filename: string; text: string; uri: string }[] = [];

        onStatus?.('Scanning pages with OCR...');
        for (const asset of assets) {
            formData.append('files', {
                uri: asset.uri,
                name: asset.fileName || `image-${asset.assetId || Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            } as any);

            try {
                const text = (await OCR.recognizeText(asset.uri))?.trim() ?? '';
                ocrEntries.push({ filename: asset.fileName || asset.uri, text, uri: asset.uri });
            } catch (error) {
                console.error('OCR failed for asset', asset.uri, error);
                ocrEntries.push({
                    filename: asset.fileName || asset.uri,
                    text: '',
                    uri: asset.uri,
                });
            }
        }

        try {
            onStatus?.('Uploading references...');
            const uploadResponse = await uploadFilesMutation.mutateAsync({
                body: formData as any,
            });

            const uploadedFiles = uploadResponse?.files ?? [];

            onStatus?.('Attaching context for the AI...');
            await Promise.all(
                uploadedFiles.map((file, index) =>
                    updateFileMutation.mutateAsync({
                        params: { path: { id: file.id } },
                        body: {
                            filename: file.filename,
                            ocr: ocrEntries[index]?.text ?? '',
                        },
                    })
                )
            );

            const decorated: AiNoteAttachment[] = uploadedFiles.map((file, index) => ({
                id: file.id,
                filename: file.filename,
                ocr: ocrEntries[index]?.text ?? '',
                uri: ocrEntries[index]?.uri,
            }));

            onStatus?.('');
            return decorated;
        } catch (error) {
            onStatus?.('');
            throw error;
        }
    };

    return { pickImage };
}
