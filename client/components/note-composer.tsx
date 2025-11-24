import { apiClient } from '@/lib/providers/api';
import { IconCheck, IconEye, IconPencil, IconX } from '@tabler/icons-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Button, HelperText, SegmentedButtons, TextInput } from 'react-native-paper';

type Inputs = {
    title: string;
    content: string;
};

type Props = {
    initialContent: string;
    onClose: () => void;
    onContentChange?: (content: string) => void;
};

export function NoteComposer({ initialContent, onClose, onContentChange }: Props) {
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [submitError, setSubmitError] = useState('');

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<Inputs>({
        defaultValues: {
            title: '',
            content: initialContent,
        },
    });

    const contentValue = watch('content');

    const previewContent = useMemo(
        () => contentValue || '*Nothing to preview yet.*',
        [contentValue]
    );

    const createNoteMutation = apiClient.useMutation('post', '/api/notes', {
        onSuccess: () => {
            reset();
            onClose();
        },
        onError: () => {
            setSubmitError('We could not save your note. Please try again.');
        },
    });

    const onSubmit = useCallback(
        async (values: Inputs) => {
            setSubmitError('');
            try {
                await createNoteMutation.mutateAsync({ body: values });
            } catch (error) {
                console.error('Failed to create note', error);
            }
        },
        [createNoteMutation]
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.container}
        >
            <View style={styles.actionsRow}>
                <Button
                    mode="outlined"
                    icon={({ size, color }) => <IconX size={size} color={color} />}
                    onPress={onClose}
                    disabled={createNoteMutation.isPending}
                >
                    Close
                </Button>
                <Button
                    mode="contained"
                    icon={({ size, color }) => <IconCheck size={size} color={color} />}
                    onPress={handleSubmit(onSubmit)}
                    loading={createNoteMutation.isPending}
                >
                    Publish
                </Button>
            </View>

            <Controller
                control={control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Title"
                        mode="outlined"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={Boolean(errors.title)}
                    />
                )}
            />
            <HelperText type="error" visible={Boolean(errors.title)}>
                {errors.title?.message}
            </HelperText>

            <SegmentedButtons
                value={mode}
                onValueChange={(next) => setMode(next as 'edit' | 'preview')}
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

            {mode === 'edit' ? (
                <Controller
                    control={control}
                    name="content"
                    rules={{ required: 'Content is required' }}
                    render={({ field: { onChange, value } }) => (
                        <>
                            <TextInput
                                mode="outlined"
                                multiline
                                activeOutlineColor='#ffffff40'
                                value={value}
                                onChangeText={(nextValue) => {
                                    onChange(nextValue);
                                    onContentChange?.(nextValue);
                                }}
                                numberOfLines={10}
                                style={styles.textArea}
                                placeholder="Write using Markdown..."
                            />
                            <HelperText type="error" visible={Boolean(errors.content)}>
                                {errors.content?.message}
                            </HelperText>
                        </>
                    )}
                />
            ) : (
                <ScrollView style={styles.preview}>
                    <Markdown
                        style={{
                            body: { color: 'white' },
                            text: { color: 'white' },
                        }}
                    >{previewContent}</Markdown>
                </ScrollView>
            )}

            {submitError ? (
                <HelperText type="error" visible>
                    {submitError}
                </HelperText>
            ) : null}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        padding: 16,
        flex: 1,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textArea: {
        flex: 1,
        minHeight: 200,
        textAlignVertical: 'top',
        padding: 10
    },
    preview: {
        minHeight: 200,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ffffff12',

    },
});
