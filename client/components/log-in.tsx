import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, TextInput } from "react-native-paper";

type Props = {
    onRegisterPress: () => void;
};

type Inputs = {
    email: string;
    password: string;
};

export default function LogInCard({ onRegisterPress }: Props) {

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: Inputs) => {
        console.log("Form submitted:", data);
    };

    return (
        <Card style={styles.card}>
            <Card.Title title="Log In" />
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

            </Card.Content>

            <Card.Actions>
                <View style={styles.bottom}>
                    <Button onPress={onRegisterPress}>Register</Button>
                    <Button mode="contained" onPress={handleSubmit(onSubmit)}>
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
