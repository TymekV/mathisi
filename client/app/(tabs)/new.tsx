import { NoteComposer } from '@/components/note-composer';
import { SimpleInput } from '@/components/simple-input';
import { useNew } from '@/hooks/use-new';
import {
    addAttachments,
    clearAttachments,
    removeAttachment as removeAttachmentFromStore,
    useAiNoteAttachments,
} from '@/lib/state/ai-note-draft';
import { registerAiNoteStatusHandlers } from '@/lib/state/ai-note-status-bridge';
import { apiClient } from '@/lib/providers/api';
import {
    IconArrowLeft,
    IconBulb,
    IconPhotoPlus,
    IconShield,
    IconSparkles,
    IconTrash,
    IconWand,
    IconWorld,
} from '@tabler/icons-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Chip,
    HelperText,
    IconButton,
    SegmentedButtons,
    Surface,
    Text,
    useTheme,
} from 'react-native-paper';

type GeneratedNote = {
    id: number;
    title: string;
    content: string;
};

export default function AddNewScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [activeNote, setActiveNote] = useState<GeneratedNote | null>(null);

    useEffect(() => {
        return () => {
            clearAttachments();
        };
    }, []);

    const handleOpenEditor = useCallback((note: GeneratedNote) => {
        setActiveNote(note);
    }, []);

    const handleCloseEditor = useCallback(() => {
        setActiveNote(null);
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.generatorWrapper, activeNote ? styles.hidden : undefined]}>
                <AiNoteGenerator onGenerated={handleOpenEditor} />
            </View>
            {activeNote ? (
                <View style={styles.editorWrapper}>
                    <Surface
                        elevation={1}
                        style={[styles.editorHeader, { backgroundColor: theme.colors.surface }]}
                    >
                        <IconButton
                            icon={({ color }) => <IconArrowLeft color={color} size={22} />}
                            onPress={handleCloseEditor}
                            accessibilityLabel="Back to AI workspace"
                        />
                        <View style={styles.editorHeaderText}>
                            <Text style={[styles.editorTitle, { color: theme.colors.onSurface }]}>
                                Fine-tune your AI note
                            </Text>
                            <Text
                                style={[
                                    styles.editorSubtitle,
                                    { color: theme.colors.onSurfaceVariant },
                                ]}
                                numberOfLines={1}
                            >
                                Note #{activeNote.id}
                            </Text>
                        </View>
                        <Button
                            compact
                            onPress={() =>
                                router.push({
                                    pathname: '/(tabs)/(home)/article/[id]',
                                    params: { id: String(activeNote.id) },
                                })
                            }
                        >
                            View note
                        </Button>
                    </Surface>
                    <View style={styles.composerContainer}>
                        <NoteComposer
                            key={activeNote.id}
                            initialContent={activeNote.content}
                            initialTitle={activeNote.title}
                            noteId={activeNote.id}
                            onClose={handleCloseEditor}
                            onSubmitSuccess={(id) => {
                                if (id) {
                                    router.push({
                                        pathname: '/(tabs)/(home)/article/[id]',
                                        params: { id: String(id) },
                                    });
                                }
                            }}
                        />
                    </View>
                </View>
            ) : null}
        </View>
    );
}

type VisibilityOption = 'private' | 'public';

type GeneratorForm = {
    title: string;
    prompt: string;
    visibility: VisibilityOption;
};

type AiNoteGeneratorProps = {
    onGenerated: (note: GeneratedNote) => void;
};

function AiNoteGenerator({ onGenerated }: AiNoteGeneratorProps) {
    const theme = useTheme();
    const { pickImage } = useNew();
    const attachments = useAiNoteAttachments();
    const [form, setForm] = useState<GeneratorForm>({
        title: '',
        prompt: '',
        visibility: 'private',
    });
    const [uploadError, setUploadError] = useState('');
    const [generationError, setGenerationError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const aiNoteMutation = apiClient.useMutation('post', '/api/notes/ai');

    useEffect(() => {
        return registerAiNoteStatusHandlers({
            setStatus: setStatusMessage,
            setUploading: setIsUploading,
        });
    }, []);

    const handleFormChange = useCallback((key: keyof GeneratorForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleRemoveAttachment = useCallback((id: number) => {
        removeAttachmentFromStore(id);
    }, []);

    const handlePickReferences = useCallback(async () => {
        setUploadError('');
        setIsUploading(true);
        try {
            const uploaded = await pickImage({
                onStatus: (message) => setStatusMessage(message),
            });

            if (uploaded.length) {
                addAttachments(uploaded);
            }
        } catch (error) {
            console.error('Failed to upload references', error);
            setUploadError('We could not process those files. Please try again.');
        } finally {
            setIsUploading(false);
            setStatusMessage('');
        }
    }, [pickImage]);

    const handleSuggestionPress = useCallback((text: string) => {
        setForm((prev) => ({
            ...prev,
            prompt: prev.prompt ? `${prev.prompt}\n\n${text}` : text,
        }));
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!form.title.trim() || !form.prompt.trim()) {
            setGenerationError('Give the AI a title and a rich prompt before generating.');
            return;
        }

        setGenerationError('');
        setStatusMessage('Asking the AI to build your note...');
        try {
            const response = await aiNoteMutation.mutateAsync({
                body: {
                    title: form.title.trim(),
                    prompt: form.prompt.trim(),
                    files: attachments.map((file) => file.id),
                    public: form.visibility === 'public',
                },
            });

            if (response?.id && response?.content) {
                clearAttachments();
                onGenerated({
                    id: response.id,
                    title: form.title.trim(),
                    content: response.content,
                });
            }
        } catch (error) {
            console.error('AI generation failed', error);
            setGenerationError(
                'The AI could not finish your note. Refine the prompt and try again.'
            );
        } finally {
            setStatusMessage('');
        }
    }, [aiNoteMutation, attachments, form, onGenerated]);

    const wordCount = useMemo(() => {
        if (!form.prompt.trim()) {
            return 0;
        }
        return form.prompt.trim().split(/\s+/).length;
    }, [form.prompt]);

    const canGenerate = Boolean(form.title.trim()) && Boolean(form.prompt.trim());

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
                styles.generatorContent,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Surface
                elevation={0}
                style={[
                    styles.heroCard,
                    {
                        backgroundColor: theme.colors.primaryContainer,
                        borderColor: theme.colors.outlineVariant || theme.colors.outline,
                    },
                ]}
            >
                <Text style={[styles.heroEyebrow, { color: theme.colors.onPrimaryContainer }]}>
                    Vision studio
                </Text>
                <Text style={[styles.heroTitle, { color: theme.colors.onPrimaryContainer }]}>
                    Generate notes from your photos
                </Text>
                <Text style={[styles.heroSubtitle, { color: theme.colors.onPrimaryContainer }]}>
                    Drop in workbook captures, describe what matters, and Mathisi stitches together
                    a polished Markdown note you can keep refining.
                </Text>
            </Surface>

            <Surface elevation={1} mode="flat" style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                        Describe your note
                    </Text>
                    <IconSparkles color={theme.colors.primary} size={20} />
                </View>
                <SimpleInput
                    value={form.title}
                    onChangeText={(text) => handleFormChange('title', text)}
                    placeholder="Working title"
                    containerStyle={{ marginBottom: 8, height: 52 }}
                    elevation={3}
                />
                <SimpleInput
                    value={form.prompt}
                    onChangeText={(text) => handleFormChange('prompt', text)}
                    placeholder="Tell the AI what to emphasize, formatting rules, languages..."
                    containerStyle={{ minHeight: 160 }}
                    side="bottom"
                    elevation={3}
                />
                <HelperText type="info" visible>
                    {wordCount} words · {attachments.length} references attached
                </HelperText>
                <SegmentedButtons
                    value={form.visibility}
                    onValueChange={(value) =>
                        handleFormChange('visibility', value as VisibilityOption)
                    }
                    buttons={[
                        {
                            value: 'private',
                            label: 'Private',
                            icon: ({ color }) => <IconShield color={color} size={18} />,
                        },
                        {
                            value: 'public',
                            label: 'Share to feed',
                            icon: ({ color }) => <IconWorld color={color} size={18} />,
                        },
                    ]}
                    style={{ marginTop: 16 }}
                />
            </Surface>

            <Surface elevation={1} mode="flat" style={[styles.sectionCard, { gap: 12 }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                        Reference material
                    </Text>
                    <Button
                        compact
                        icon={({ color }) => <IconPhotoPlus color={color} size={18} />}
                        onPress={handlePickReferences}
                        disabled={isUploading}
                    >
                        Add images
                    </Button>
                </View>
                {attachments.length === 0 ? (
                    <View style={styles.emptyState}>
                        {isUploading ? (
                            <ActivityIndicator animating />
                        ) : (
                            <IconPhotoPlus color={theme.colors.onSurfaceVariant} size={36} />
                        )}
                        <Text
                            style={[
                                styles.emptyStateText,
                                { color: theme.colors.onSurfaceVariant },
                            ]}
                        >
                            Upload scans or board photos so the AI can read every formula and
                            annotation.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.attachmentRow}
                    >
                        {attachments.map((file) => (
                            <Surface
                                key={file.id}
                                style={[
                                    styles.attachmentCard,
                                    {
                                        borderColor:
                                            theme.colors.outlineVariant || theme.colors.outline,
                                    },
                                ]}
                                elevation={1}
                            >
                                {file.uri ? (
                                    <Image
                                        source={{ uri: file.uri }}
                                        style={styles.attachmentImage}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <View
                                        style={[styles.attachmentImage, styles.attachmentFallback]}
                                    >
                                        <IconPhotoPlus
                                            color={theme.colors.onSurfaceVariant}
                                            size={20}
                                        />
                                    </View>
                                )}
                                <View style={styles.attachmentBody}>
                                    <Text
                                        style={[
                                            styles.attachmentTitle,
                                            { color: theme.colors.onSurface },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {file.filename}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.attachmentExcerpt,
                                            { color: theme.colors.onSurfaceVariant },
                                        ]}
                                        numberOfLines={3}
                                    >
                                        {file.ocr?.trim() ? file.ocr : 'No OCR text detected yet.'}
                                    </Text>
                                </View>
                                <IconButton
                                    icon={({ color }) => <IconTrash color={color} size={18} />}
                                    onPress={() => handleRemoveAttachment(file.id)}
                                    accessibilityLabel={`Remove ${file.filename}`}
                                />
                            </Surface>
                        ))}
                    </ScrollView>
                )}
                {uploadError ? (
                    <HelperText type="error" visible>
                        {uploadError}
                    </HelperText>
                ) : null}
            </Surface>

            <View style={styles.generateActions}>
                <Button
                    mode="contained"
                    icon={({ color }) => <IconSparkles color={color} size={18} />}
                    onPress={handleGenerate}
                    disabled={!canGenerate || aiNoteMutation.isPending}
                    loading={aiNoteMutation.isPending}
                >
                    Generate note
                </Button>
                {generationError ? (
                    <HelperText type="error" visible>
                        {generationError}
                    </HelperText>
                ) : null}
                {statusMessage ? (
                    <HelperText type="info" visible>
                        {statusMessage}
                    </HelperText>
                ) : null}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    generatorWrapper: {
        flex: 1,
    },
    hidden: {
        display: 'none',
    },
    editorWrapper: {
        flex: 1,
    },
    editorHeader: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editorHeaderText: {
        flex: 1,
    },
    editorTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    editorSubtitle: {
        fontSize: 13,
    },
    composerContainer: {
        flex: 1,
    },
    generatorContent: {
        padding: 16,
        paddingBottom: 40,
        gap: 18,
    },
    heroCard: {
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        gap: 10,
    },
    heroEyebrow: {
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 12,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '700',
        lineHeight: 32,
    },
    heroSubtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    heroChipsRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        marginTop: 8,
    },
    heroChip: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    sectionCard: {
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptyState: {
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 14,
    },
    attachmentRow: {
        gap: 12,
    },
    attachmentCard: {
        width: 240,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    attachmentImage: {
        width: '100%',
        height: 120,
    },
    attachmentFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    attachmentBody: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 6,
    },
    attachmentTitle: {
        fontWeight: '600',
        fontSize: 14,
    },
    attachmentExcerpt: {
        fontSize: 13,
        lineHeight: 18,
    },
    chipCloud: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    promptChip: {
        borderRadius: 999,
    },
    generateActions: {
        gap: 4,
    },
});
