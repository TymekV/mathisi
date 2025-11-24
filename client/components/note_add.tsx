import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { FAB, HelperText, TextInput } from "react-native-paper";

type Inputs = {
    title: string,
    content: string
}
interface Props {
    remove: () => void,
    text: string,
    updateText: React.Dispatch<React.SetStateAction<string>>
}

export default function NoteAddScreen({ remove, text, updateText }: Props) {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            title: "",
            content: text,
        },
    });


    const $api = createClient<paths>({
        baseUrl: apiBaseUrl,
    });

    const add = async (data_input: Inputs) => {
        const res = await SecureStore.getItemAsync('token')
        const { data, error } = await $api.POST("/api/notes", {
            body: data_input,
            headers: {
                Authorization: res
            }
        })
        if (data) {
            alert("succes")
        }
        if (error) {
            alert("something went wrong")
        }
    }

    return (
        <View>
            <View style={styles.centerContainer}>
                <FAB
                    icon="close"
                    variant="primary"
                    size="medium"
                    onPress={remove}
                />
                <FAB
                    icon="check"
                    variant="primary"
                    size="medium"
                    onPress={handleSubmit(add)}
                />
                <Controller
                    control={control}
                    name="title"
                    rules={{
                        required: "Title is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                style={styles.fill1}
                                label="Title"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                error={!!errors.title}
                            />
                            <HelperText type="error" visible={!!errors.title}>
                                {errors.title?.message}
                            </HelperText>
                        </>
                    )}
                />
                </View>
                <Controller
                    control={control}
                    name="content"
                    rules={{
                        required: "Content is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                style={styles.fill1}
                                label="Title"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                error={!!errors.title}
                            />
                            <HelperText type="error" visible={!!errors.title}>
                                {errors.title?.message}
                            </HelperText>
                        </>
                    )}
                />

            </View>
    )
}
const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        gap: 15,
        flexDirection: 'row',
    },
    fill1: {
        flexGrow: 1,
    }
});