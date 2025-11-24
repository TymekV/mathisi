import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import Markdown from 'react-native-markdown-display';
import { FAB, HelperText, SegmentedButtons, TextInput } from "react-native-paper";

type Inputs = {
    title: string,
    content: string
}
interface Props {
    remove: () => void,
    text: string, // External state for content
    updateText: React.Dispatch<React.SetStateAction<string>>
}

export default function NoteAddScreen({ remove, text, updateText }: Props) {
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

    const {
        control,
        handleSubmit,
        // REMOVE watch here: watch,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            title: "",
            content: text,
        },
    });



    // REMOVE const contentValue = watch('content');

    const $api = createClient<paths>({
        baseUrl: apiBaseUrl,
    });

    const add = async (data_input: Inputs) => {
        const res = await SecureStore.getItemAsync('token')
        const { data, error } = await $api.POST("/api/notes", {
            body: data_input,
            headers: {
                Authorization: res || ""
            }
        })
        if (data) {
            alert("success")
            remove(); // Close after success
        }
        if (error) {
            alert("something went wrong")
        }
    }

    return (
        <View style={styles.container}>
            {/* Header Actions */}
            <View style={styles.centerContainer}>
                <FAB
                    icon="close"
                    size="small"
                    onPress={remove}
                />
                <FAB
                    icon="check"
                    size="small"
                    onPress={handleSubmit(add)}
                />
                <Controller
                    control={control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.fill1}>
                            <TextInput
                                label="Title"
                                mode="outlined"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                error={!!errors.title}
                            />
                        </View>
                    )}
                />
            </View>

            {/* Toggle Edit / Preview */}
            <View style={{ marginBottom: 10 }}>
                <SegmentedButtons
                    value={mode}
                    onValueChange={setMode}
                    buttons={[
                        { value: 'edit', label: 'Edit' },
                        { value: 'preview', label: 'Preview MarkDown' },
                    ]}
                />
            </View>

            {/* Content Area */}
            {mode === 'edit' ? (
                <Controller
                    control={control}
                    name="content"
                    rules={{ required: "Content is required" }}
                    render={({ field: { onChange, value } }) => (
                        <>
                            <TextInput
                                onChangeText={(text) => {
                                    onChange(text); // Update react-hook-form state
                                    updateText(text); // Update external state for preview
                                }}
                                mode="outlined"
                                value={value}
                                multiline={true}
                                style={styles.markdownInput}
                                placeholder="Type Markdown here..."
                                placeholderTextColor="gray"
                            />
                            <HelperText type="error" visible={!!errors.content}>
                                {errors.content?.message}
                            </HelperText>
                        </>
                    )}
                />
            ) : (
                /* --- THIS IS WHERE THE PARSING HAPPENS --- */

                <View style={styles.editorContainer}>
                    <ScrollView style={styles.previewContainer}>
                        <Markdown style={markdownStylesDisplay}>
                            {/* Use the external 'text' prop instead of contentValue */}
                            {text}
                        </Markdown>
                    </ScrollView>

                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#1e1e1e',
    },
    centerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    fill1: {
        flex: 1,
    },
    editorContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        backgroundColor: '#1e1e1e',
    },
    markdownInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        padding: 10,
        textAlignVertical: 'top',
    },
    previewContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#252525',
        color: 'white'
    }
});

// Styles for the 'react-native-markdown-display' renderer
const markdownStylesDisplay = StyleSheet.create({
    body: { color: 'white' },
    heading1: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    heading2: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    list_item: { color: 'white', flexDirection: 'row', alignItems: 'flex-start' },
    bullet_list_icon: { color: 'white', fontSize: 20 },
    code_inline: { backgroundColor: '#333', color: '#ff79c6' },
    code_block: { backgroundColor: '#333', padding: 10, borderRadius: 4 },
});
