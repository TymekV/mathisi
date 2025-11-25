import { useFocusEffect } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
    label_frontsize: string;
    label_backside: string;
}

export default function FlashCard({ label_frontsize, label_backside }: Props) {
    const rotation = useSharedValue(0);

    useFocusEffect(() => {
        rotation.value = 0;
    });

    const flip = () => {
        rotation.value = withTiming(rotation.value === 0 ? 180 : 0, {
            duration: 400,
        });
    };

    const frontStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
        opacity: interpolate(rotation.value, [0, 90, 90, 180], [1, 0, 0, 0]),
        backfaceVisibility: 'hidden',
        position: 'absolute',
        width: '100%',
        height: '100%',
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
        opacity: interpolate(rotation.value, [0, 90, 90, 180], [0, 0, 0, 1]),
        backfaceVisibility: 'hidden',
        position: 'absolute',
        width: '100%',
        height: '100%',
    }));

    return (
        <Pressable onPress={flip} style={styles.pressable}>
            <Animated.View style={styles.container}>
                <Animated.View style={[styles.cardWrapper, frontStyle]}>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.hint}>Tap to flip</Text>
                            <Text style={styles.label}>Question</Text>
                            <Text>{label_frontsize}</Text>
                        </Card.Content>
                    </Card>
                </Animated.View>

                <Animated.View style={[styles.cardWrapper, backStyle]}>
                    <Card style={[styles.card]}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.hint}>Tap to flip</Text>
                            <Text style={styles.label}>Answer</Text>
                            <Text>{label_backside}</Text>
                        </Card.Content>
                    </Card>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        width: width - 40,
        height: 220,
        position: 'relative',
        margin: 25,
    },
    cardWrapper: {
        width: '100%',
        height: '100%',
    },
    card: {
        height: '100%',
    },
    cardBack: {},
    cardContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        padding: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    hint: {
        opacity: 0.5,
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
});
