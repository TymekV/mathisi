import { apiClient } from '@/lib/providers/api';
import { useAuth } from '@/lib/providers/auth';
import { IconAt, IconLock, IconUser } from '@tabler/icons-react-native';
import { Controller, useForm } from 'react-hook-form';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';

type RegisterFields = {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
};

type Props = {
    onNavigateToLogin: () => void;
};

export function RegisterForm({ onNavigateToLogin }: Props) {
    const { signIn } = useAuth();
    const [formError, setFormError] = useState('');
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFields>({
        defaultValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
        },
    });

    const passwordValue = watch('password');

    const registerMutation = apiClient.useMutation('post', '/api/register');
    const loginMutation = apiClient.useMutation('post', '/api/login');

    const extractMessage = useCallback((error: unknown) => {
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object' && 'error' in error) {
            const message = (error as { error?: string }).error;
            if (typeof message === 'string') {
                if (message.includes('users_username_key')) {
                    return 'This username is already taken.';
                }
                if (message.includes('users_email_key')) {
                    return 'This email is already registered.';
                }
                return message;
            }
        }
        return 'Something went wrong while creating your account.';
    }, []);

    const onSubmit = useCallback(
        async (values: RegisterFields) => {
            setFormError('');
            try {
                await registerMutation.mutateAsync({
                    body: {
                        email: values.email,
                        username: values.username,
                        password: values.password,
                    },
                });
                const loginResponse = await loginMutation.mutateAsync({
                    body: { username: values.username, password: values.password },
                });
                if (loginResponse?.token) {
                    await signIn(loginResponse.token);
                }
            } catch (error) {
                console.error('Registration failed', error);
                setFormError(extractMessage(error));
            }
        },
        [extractMessage, loginMutation, registerMutation, signIn]
    );

    const isSubmitting = useMemo(
        () => registerMutation.isPending || loginMutation.isPending,
        [loginMutation.isPending, registerMutation.isPending]
    );

    return (
        <Surface style={styles.card} elevation={2}>
            <Text variant="headlineSmall" style={styles.title}>
                Create account
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                We just need a few details
            </Text>

            <View style={styles.formSpacing}>
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /\S+@\S+\.\S+/, // simple email validation
                            message: 'Enter a valid email address.',
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Email"
                            mode="outlined"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            error={Boolean(errors.email)}
                            left={
                                <TextInput.Icon
                                    icon={({ color, size }) => <IconAt size={size} color={color} />}
                                />
                            }
                        />
                    )}
                />
                <HelperText type="error" visible={Boolean(errors.email)}>
                    {errors.email?.message}
                </HelperText>

                <Controller
                    control={control}
                    name="username"
                    rules={{
                        required: 'Username is required',
                        minLength: {
                            value: 3,
                            message: 'Username must have at least 3 characters.',
                        },
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
                        minLength: {
                            value: 6,
                            message: 'Password must have at least 6 characters.',
                        },
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
                                        <IconLock size={size} color={color} />
                                    )}
                                />
                            }
                        />
                    )}
                />
                <HelperText type="error" visible={Boolean(errors.password)}>
                    {errors.password?.message}
                </HelperText>

                <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{
                        required: 'Please confirm your password',
                        validate: (value) => value === passwordValue || 'Passwords do not match',
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Confirm password"
                            mode="outlined"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            secureTextEntry
                            error={Boolean(errors.confirmPassword)}
                            left={
                                <TextInput.Icon
                                    icon={({ color, size }) => (
                                        <IconLock size={size} color={color} />
                                    )}
                                />
                            }
                        />
                    )}
                />
                <HelperText type="error" visible={Boolean(errors.confirmPassword)}>
                    {errors.confirmPassword?.message}
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
                loading={isSubmitting}
                style={styles.submitBtn}
            >
                Sign up
            </Button>

            <Button mode="text" onPress={onNavigateToLogin} disabled={isSubmitting}>
                Already have an account?
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
        gap: 2,
    },
    submitBtn: {
        marginTop: 16,
    },
});
