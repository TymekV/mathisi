import { apiClient } from '@/lib/providers/api';
import { IconEye, IconPencil } from '@tabler/icons-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Button, Checkbox, HelperText, SegmentedButtons, Surface, Text, useTheme } from 'react-native-paper';
import { SimpleInput } from './simple-input';

type Inputs = {
    title: string;
    content: string;
    public: boolean;
};

type Props = {
    initialContent: string;
    initialTitle?: string;
    initialPublic?: boolean;
    noteId?: number;
    onClose: () => void;
    onContentChange?: (content: string) => void;
    onSubmitSuccess?: (noteId?: number) => void;
};

export function NoteComposer({
    initialContent,
    initialTitle,
    initialPublic = false,
    noteId,
    onClose,
    onContentChange,
    onSubmitSuccess,
}: Props) {
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [submitError, setSubmitError] = useState('');
    const theme = useTheme();
    const isEditingExisting = typeof noteId === 'number';

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<Inputs>({
        defaultValues: {
            title: initialTitle ?? '',
            content: initialContent,
            public: initialPublic,
        },
    });

    useEffect(() => {
        reset({
            title: initialTitle ?? '',
            content: initialContent,
            public: initialPublic,
        });
    }, [initialContent, initialTitle, initialPublic, reset]);

    const contentValue = watch('content');
    const titleValue = watch('title');

    const previewContent = useMemo(
        () => (contentValue?.trim() ? contentValue : '*Nothing to preview yet.*'),
        [contentValue]
    );
    const previewTitle = useMemo(
        () => (titleValue?.trim() ? titleValue : 'Untitled note'),
        [titleValue]
    );

    const codeFontFamily = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

    const markdownStyles = useMemo(() => {
        const codeBackground = theme.colors.surfaceVariant;
        const codeBorder = theme.colors.outlineVariant || theme.colors.outline;

        const codeShell = {
            backgroundColor: codeBackground,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: codeBorder,
        } as const;

        return {
            body: {
                color: theme.colors.onSurface,
                fontSize: 16,
                lineHeight: 22,
            },
            heading1: {
                color: theme.colors.onSurface,
                marginTop: 16,
                marginBottom: 8,
            },
            heading2: {
                color: theme.colors.onSurface,
                marginTop: 14,
                marginBottom: 6,
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
            code_inline: {
                backgroundColor: theme.colors.secondaryContainer,
                color: theme.colors.onSecondaryContainer,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                fontFamily: codeFontFamily,
            },
            bullet_list: {
                marginVertical: 8,
            },
            ordered_list: {
                marginVertical: 8,
            },
            blockquote: {
                borderLeftColor: theme.colors.primary,
                borderLeftWidth: 3,
                paddingLeft: 12,
                marginVertical: 8,
            },
        };
    }, [
        codeFontFamily,
        theme.colors.onSurface,
        theme.colors.primary,
        theme.colors.surfaceVariant,
        theme.colors.outlineVariant,
        theme.colors.outline,
        theme.colors.secondaryContainer,
        theme.colors.onSecondaryContainer,
    ]);

    useEffect(() => {
        if (onContentChange) {
            onContentChange(contentValue ?? '');
        }
    }, [contentValue, onContentChange]);

    const createNoteMutation = apiClient.useMutation('post', '/api/notes');
    const editNoteMutation = apiClient.useMutation('patch', '/api/notes/{id}');

    const isSubmitting = createNoteMutation.isPending || editNoteMutation.isPending;

    const onSubmit = useCallback(
        async (values: Inputs) => {
            setSubmitError('');
            try {
                if (isEditingExisting && typeof noteId === 'number') {
                    await editNoteMutation.mutateAsync({
                        params: { path: { id: noteId } },
                        body: values,
                    });
                    onSubmitSuccess?.(noteId);
                } else {
                    await createNoteMutation.mutateAsync({ body: values });
                    reset({ title: '', content: '', public: false });
                    onSubmitSuccess?.();
                }
                onClose();
            } catch (error) {
                console.error('Failed to submit note', error);
                setSubmitError('We could not save your note. Please try again.');
            }
        },
        [
            createNoteMutation,
            editNoteMutation,
            isEditingExisting,
            noteId,
            onClose,
            onSubmitSuccess,
            reset,
        ]
    );

    const primaryActionLabel = isEditingExisting ? 'Save changes' : 'Publish';
    const secondaryActionLabel = isEditingExisting ? 'Back' : 'Cancel';

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            className="p-4 flex-1"
            style={{
                backgroundColor: theme.colors.background,
            }}
        >
            <View className="gap-1 flex-1">
                <View className="items-center mb-2">
                    <SegmentedButtons
                        value={mode}
                        onValueChange={(next) => setMode(next as 'edit' | 'preview')}
                        style={{ maxWidth: 220 }}
                        buttons={[
                            {
                                value: 'edit',
                                label: 'Edit',
                                icon: ({ size, color }) => <IconPencil size={size} color={color} />,
                            },
                            {
                                value: 'preview',
                                label: 'Preview',
                                icon: ({ size, color }) => <IconEye size={size} color={color} />,
                            },
                        ]}
                    />
                </View>
                {mode === 'edit' ? (
                    <>
                        <Controller
                            control={control}
                            name="title"
                            rules={{ required: 'Title is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <SimpleInput
                                    value={value}
                                    onBlur={onBlur}
                                    placeholder="Name"
                                    onChangeText={onChange}
                                    containerStyle={{ height: 52 }}
                                />
                            )}
                        />
                        {errors.title && (
                            <HelperText type="error" visible={Boolean(errors.title)}>
                                {errors.title?.message}
                            </HelperText>
                        )}
                        <Controller
                            control={control}
                            name="content"
                            rules={{ required: 'Content is required' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <SimpleInput
                                    value={value}
                                    onBlur={onBlur}
                                    placeholder="Content"
                                    onChangeText={onChange}
                                    side="bottom"
                                    multiline
                                    containerStyle={{ flex: 1 }}
                                />
                            )}
                        />
                        {errors.content && (
                            <HelperText type="error" visible={Boolean(errors.content)}>
                                {errors.content?.message}
                            </HelperText>
                        )}
                    </>
                ) : (
                    <Surface
                        mode="flat"
                        style={[
                            styles.previewSurface,
                            {
                                borderColor: theme.colors.outlineVariant || theme.colors.outline,
                                backgroundColor: theme.colors.surface,
                            },
                        ]}
                    >
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={styles.previewScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text
                                style={[styles.previewTitle, { color: theme.colors.onSurface }]}
                                numberOfLines={2}
                            >
                                {previewTitle}
                            </Text>
                            <Markdown style={markdownStyles}>{previewContent}</Markdown>
                        </ScrollView>
                    </Surface>
                )}
                {Boolean(submitError) && (
                    <HelperText type="error" visible>
                        {submitError}
                    </HelperText>
                )}
                <View className="flex-row justify-end items-center gap-2 mt-2">
                    <Controller
                        control={control}
                        name="public"
                        render={({ field: { onChange, value } }) => (
                            <View className="flex-row items-center">
                                <Checkbox
                                    status={value ? 'checked' : 'unchecked'}
                                    onPress={() => onChange(!value)}
                                />
                                <Text
                                    onPress={() => onChange(!value)}
                                    style={{ color: theme.colors.onSurface }}
                                >
                                    Public
                                </Text>
                            </View>
                        )}
                    />
                    <Button mode="elevated" disabled={isSubmitting} onPress={onClose}>
                        {secondaryActionLabel}
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isSubmitting}
                    >
                        {primaryActionLabel}
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    previewSurface: {
        borderRadius: 20,
        padding: 16,
        flex: 1,
        borderWidth: 1,
    },
    previewTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 12,
    },
    previewScrollContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
});