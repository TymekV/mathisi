import { apiClient } from '@/lib/providers/api';
import {
    IconArrowsShuffle,
    IconChevronLeft,
    IconChevronRight,
    IconX,
} from '@tabler/icons-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, ProgressBar, Surface, Text, useTheme } from 'react-native-paper';
import FlashCard from './flash-card';

interface Props {
    onBack: () => void;
    id: string;
}

export default function FlashCardMenu({ onBack, id }: Props) {
    const theme = useTheme();
    const [index, setIndex] = useState<number>(0);

    const cardsQuery = apiClient.useQuery(
        'get',
        '/api/notes/{id}/cards',
        { params: { path: { id: id } } },
        {
            refetchOnMount: 'always',
            refetchOnWindowFocus: false,
        }
    );

    const cards = cardsQuery.data?.questions ?? [];

    // Reset index when id changes or when cards length changes
    useEffect(() => {
        setIndex(0);
    }, [id]);

    // Ensure index stays within bounds
    useEffect(() => {
        if (cards.length > 0 && index >= cards.length) {
            setIndex(0);
        }
    }, [cards.length, index]);

    const prev = () => setIndex((i) => (i - 1 + cards.length) % cards.length);
    const next = () => setIndex((i) => (i + 1) % cards.length);
    const random = () => setIndex(Math.floor(Math.random() * cards.length));

    // Loading state
    if (cardsQuery.isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                    Loading flashcards...
                </Text>
            </View>
        );
    }

    // Error state
    if (cardsQuery.isError) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                    Failed to load flashcards
                </Text>
                <FAB
                    icon={({ size, color }) => <IconX size={size} color={color} />}
                    onPress={onBack}
                    style={{ marginTop: 16 }}
                />
            </View>
        );
    }

    // Empty state
    if (cards.length === 0) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    No flashcards available
                </Text>
                <FAB
                    icon={({ size, color }) => <IconX size={size} color={color} />}
                    onPress={onBack}
                    style={{ marginTop: 16 }}
                />
            </View>
        );
    }

    const currentCard = cards[index];
    const progress = (index + 1) / cards.length;

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
                <View style={{ width: 48 }} />
            </View>

            {/* Progress Section */}
            <Surface style={styles.progressContainer} elevation={0}>
                <View style={styles.progressHeader}>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                        {index + 1}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {' / '}
                        {cards.length}
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
                    label_frontsize={currentCard.question}
                    label_backside={currentCard.answer}
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
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