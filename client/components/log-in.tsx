import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Surface, Text, TextInput, useTheme } from "react-native-paper";

type Props = {
    onRegisterPress: () => void;
    onLogin?: () => void;
};

type Inputs = {
    username: string;
    password: string;
};


const $api = createClient<paths>({
    baseUrl: apiBaseUrl,
});

export default function LogInCard({ onRegisterPress, onLogin}: Props) {
    const theme = useTheme();
    const [registerMessage, setRegisterMessage] = useState<string>("");

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const login = async (data_input: Inputs) => {
        const { data, error, response } = await $api.POST("/api/login", { body: { username: data_input.username, password: data_input.password } });
        if (data) {

            await SecureStore.setItemAsync('token', data?.token);
            if (await SecureStore.getItemAsync('token')) {
                console.log("succes in logging");
                onLogin?.();
            }
        }
        if (error) {
            setRegisterMessage("Invalid username or password");
        }
    }

    return (
        <Card style={styles.card}>
            <Card.Title title="Log In" />
            <Card.Content>

                <Controller
                    control={control}
                    name="username"
                    rules={{
                        required: "Username is required",
                        minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters"
                        }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                label="Username"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCapitalize="none"
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
                        maxLength: 100
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                label="Password"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry
                            />
                            <HelperText type="error" visible={!!errors.password}>
                                {errors.password?.message}
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
                    <Button onPress={onRegisterPress}>Register</Button>
                    <Button mode="contained" onPress={handleSubmit(login)}>
                        Submit
                    </Button>
                </View>
            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    bottom: {
        flex: 1,
        justifyContent: "space-between",
        flexDirection: "row",
        paddingTop: 5,
    },
    card: {
        width: "90%",
    },
});
