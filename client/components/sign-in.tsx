import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, TextInput } from "react-native-paper";

type Props = {
    onLoginPress: () => void;
};

type Inputs = {
    email: string;
    password: string;
    repeat_password: string;
};

export default function SignInCard({ onLoginPress }: Props) {

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            email: "",
            password: "",
            repeat_password: "",
        },
    });

    const onSubmit = (data: Inputs) => {
        console.log("Form submitted:", data);
    };

    const passwordValue = watch("password");

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