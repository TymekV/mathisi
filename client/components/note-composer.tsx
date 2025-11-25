import { apiClient } from '@/lib/providers/api';
import { IconCheck, IconEye, IconPencil, IconX } from '@tabler/icons-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Button, HelperText, SegmentedButtons, TextInput, useTheme } from 'react-native-paper';

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
    const theme = useTheme();

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
            className="p-4 flex-1"
            style={{
                backgroundColor: theme.colors.background,
            }}
        ></KeyboardAvoidingView>
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
        padding: 10,
    },
    preview: {
        minHeight: 200,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ffffff12',
    },
});
