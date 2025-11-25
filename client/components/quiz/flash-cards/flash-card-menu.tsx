import {
    IconArrowsShuffle,
    IconChevronLeft,
    IconChevronRight,
    IconX,
} from '@tabler/icons-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, ProgressBar, Surface, Text, useTheme } from 'react-native-paper';
import FlashCard from './flash-card';

const example = [
    { front: '1', back: '2' },
    { front: 'front2', back: 'back2' },
    { front: '1', back: '2' },
    { front: 'front1', back: 'back1' },
];

interface Props {
    onBack: () => void;
}

export default function FlashCardMenu({ onBack }: Props) {
    const theme = useTheme();
    const [index, setIndex] = useState<number>(0);

    const prev = () => setIndex((i) => (i - 1 + example.length) % example.length);
    const next = () => setIndex((i) => (i + 1) % example.length);
    const random = () => setIndex(Math.floor(Math.random() * example.length));

    const progress = (index + 1) / example.length;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <FAB
                    icon={({ size, color }) => <IconX size={size} color={color} />}
                    onPress={onBack}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Flashcards
                </Text>
                <View style={{ width: 48 }} /> {/* Spacer for balance */}
            </View>

            {/* Progress Section */}
            <Surface style={styles.progressContainer} elevation={0}>
                <View style={styles.progressHeader}>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                        {index + 1}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {' / '}
                        {example.length}
                    </Text>
                </View>
                <ProgressBar
                    progress={progress}
                    style={styles.progressBar}
                    color={theme.colors.primary}
                />
            </Surface>

            {/* Card Area */}
            <View style={styles.cardContainer}>
                <FlashCard
                    label_frontsize={example[index].front}
                    label_backside={example[index].back}
                />
            </View>

            {/* Navigation Controls */}
            <Surface style={styles.controls} elevation={2}>
                <FAB
                    icon={({ size, color }) => <IconChevronLeft size={size} color={color} />}
                    onPress={prev}
                />

                <FAB
                    icon={({ size, color }) => <IconArrowsShuffle size={size} color={color} />}
                    onPress={random}
                />

                <FAB
                    icon={({ size, color }) => <IconChevronRight size={size} color={color} />}
                    onPress={next}
                />
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 28,
        alignSelf: 'center',
    },
});
