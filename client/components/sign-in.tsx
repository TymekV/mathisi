import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch"; // Corrected import
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Surface, Text, TextInput, useTheme } from "react-native-paper";

type Props = {
    onLoginPress: () => void;
    onLogin?: () => void;
};

type Inputs = {
    email: string;
    username: string;
    password: string;
    repeat_password: string;
};

const $api = createClient<paths>({
    baseUrl: apiBaseUrl,
});

export default function SignInCard({ onLoginPress,onLogin }: Props) {

    const theme = useTheme();
    const [registerMessage, setRegisterMessage] = useState<string>("");

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    });

    type ApiError = {
        error: string;
        // Add other potential error fields if they exist, like status, message, etc.
    };

    type ApiRegisterSuccesResponse = {
        succes: boolean
    }

    const passwordValue = watch("password");

    // Define the submission function
    const onSubmit = async (data_input: Inputs) => {
        const { data, error, response } = await $api.POST("/api/register", { body: { email: data_input.email, username: data_input.username, password: data_input.password } });


        if (data) {
            console.log(data)
            if ('success' in data) {

                await login(data_input)
            }
        }

        if (error) {
            const err = error as ApiError
            console.log(err.error)
            if (err.error === `Query Error: error returned from database: duplicate key value violates unique constraint "users_username_key"`) {
                setRegisterMessage("This username is already taken!");
            } else if (err.error === `Query Error: error returned from database: duplicate key value violates unique constraint "users_email_key"`) {
                setRegisterMessage("This email was already used!");
            } else {
                setRegisterMessage("An unexpected registration error occurred.");
            }
        }
    };

    const login = async (data_input: Inputs) => {
        const { data, error, response } = await $api.POST("/api/login", { body: { email: data_input.email, username: data_input.username, password: data_input.password } });
        if (data) {

            console.log("succes in logging");
            await SecureStore.setItemAsync('token', data?.token);

            if (await SecureStore.getItemAsync('token')) {
                console.log("succes in logging");
                onLogin?.();
            }
        }
    }


    return (
        <Card style={styles.card}>
            <Card.Title title="Register" />
            <Card.Content>

                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: "Email is required",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Email address is invalid",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                label="Email"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
                                error={!!errors.email}
                            />
                            <HelperText type="error" visible={!!errors.email}>
                                {errors.email?.message}
                            </HelperText>
                        </>
                    )}
                />

                <Controller
                    control={control}
                    name="username"
                    rules={{
                        required: "Password is required",
                        minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                label="Username"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry
                                error={!!errors.username}
                            />
                            <HelperText type="error" visible={!!errors.username}>
                                {errors.username?.message}
                            </HelperText>
                        </>
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    rules={{
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                label="Password"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry
                                error={!!errors.password}
                            />
                            <HelperText type="error" visible={!!errors.password}>
                                {errors.password?.message}
                            </HelperText>
                        </>
                    )}
                />

                <Controller
                    control={control}
                    name="repeat_password"
                    rules={{
                        required: "Repeat password is required",
                        validate: value =>
                            value === passwordValue || "Passwords do not match",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                label="Repeat Password"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry
                                error={!!errors.repeat_password}
                            />
                            <HelperText type="error" visible={!!errors.repeat_password}>
                                {errors.repeat_password?.message}
                            </HelperText>
                        </>
                    )}
                />
                {
                    registerMessage.trim() !== "" ?
                        <Surface style={{ backgroundColor: theme.colors.errorContainer, padding: 15 }}>
                            <Text>{registerMessage}</Text>
                        </Surface>
                        :
                        <View>

                        </View>
                }
            </Card.Content>

            <Card.Actions>
                <View style={styles.bottom}>
                    <Button onPress={onLoginPress}>Login</Button>
                    <Button onPress={handleSubmit(onSubmit)}>Submit</Button>
                </View>
            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    bottom: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingTop: 5
    },
    card: {
        width: '90%',
    },
    error: {
        fontSize: 12,
        marginBottom: 8
    },
});