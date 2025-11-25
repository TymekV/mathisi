import { apiClient } from '@/lib/providers/api';
import { useAuth } from '@/lib/providers/auth';
import { IconKey, IconUser } from '@tabler/icons-react-native';
import { Controller, useForm } from 'react-hook-form';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';

type LoginFields = {
    username: string;
    password: string;
};

type Props = {
    onNavigateToRegister: () => void;
};

export function LoginForm({ onNavigateToRegister }: Props) {
    const { signIn } = useAuth();
    const [formError, setFormError] = useState('');
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFields>({
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const loginMutation = apiClient.useMutation('post', '/api/login');

    const onSubmit = useCallback(
        async (values: LoginFields) => {
            setFormError('');
            try {
                const response = await loginMutation.mutateAsync({ body: values });
                if (response?.token) {
                    await signIn(response.token);
                }
            } catch (error) {
                console.error('Login failed', error);
                setFormError('Invalid username or password.');
            }
        },
        [loginMutation, signIn]
    );

    return (
        <Surface style={styles.card} elevation={2}>
            <Text variant="headlineSmall" style={styles.title}>
                Welcome back
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Sign in to continue
            </Text>

            <View style={styles.formSpacing}>
                <Controller
                    control={control}
                    name="username"
                    rules={{
                        required: 'Username is required',
                        // minLength: {
                        //     value: 3,
                        //     message: 'Username must have at least 3 characters.',
                        // },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Username"
                            mode="outlined"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            error={Boolean(errors.username)}
                            left={
                                <TextInput.Icon
                                    icon={({ color, size }) => (
                                        <IconUser size={size} color={color} />
                                    )}
                                />
                            }
                        />
                    )}
                />
                <HelperText type="error" visible={Boolean(errors.username)}>
                    {errors.username?.message}
                </HelperText>

                <Controller
                    control={control}
                    name="password"
                    rules={{
                        required: 'Password is required',
                        // minLength: {
                        //     value: 6,
                        //     message: 'Password must have at least 6 characters.',
                        // },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Password"
                            mode="outlined"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            secureTextEntry
                            error={Boolean(errors.password)}
                            left={
                                <TextInput.Icon
                                    icon={({ color, size }) => (
                                        <IconKey size={size} color={color} />
                                    )}
                                />
                            }
                        />
                    )}
                />
                <HelperText type="error" visible={Boolean(errors.password)}>
                    {errors.password?.message}
                </HelperText>
            </View>

            {formError ? (
                <HelperText type="error" visible>
                    {formError}
                </HelperText>
            ) : null}

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loginMutation.isPending}
                style={styles.submitBtn}
            >
                Sign in
            </Button>

            <Button mode="text" onPress={onNavigateToRegister} disabled={loginMutation.isPending}>
                Create an account
            </Button>
        </Surface>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        gap: 8,
    },
    title: {
        marginBottom: 4,
    },
    subtitle: {
        opacity: 0.7,
    },
    formSpacing: {
        marginTop: 16,
        gap: 4,
    },
    submitBtn: {
        marginTop: 16,
    },
});
