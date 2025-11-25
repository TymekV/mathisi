import { IconArrowRight, IconCheck, IconQuestionMark, IconTrophy, IconX } from "@tabler/icons-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { FAB, ProgressBar, Surface, Text, useTheme } from "react-native-paper";

const example = [
    {
        question: "What is the capital of France?",
        correct_answer: 1,
        answers: ["London", "Paris", "Berlin", "Madrid"]
    },
    {
        question: "Which planet is closest to the Sun?",
        correct_answer: 0,
        answers: ["Mercury", "Venus", "Earth", "Mars"]
    },
    {
        question: "What is 2 + 2?",
        correct_answer: 2,
        answers: ["3", "5", "4", "6"]
    }
];

type AnswerState = 'default' | 'correct' | 'incorrect' | 'revealed';

export default function QuestionMenu() {
    const theme = useTheme();
    
    const [question, setQuestion] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerStates, setAnswerStates] = useState<AnswerState[]>(
        example[0].answers.map(() => 'default')
    );
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [quizComplete, setQuizComplete] = useState<boolean>(false);
    const [streak, setStreak] = useState<number>(0);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const buttonAnims = useRef(example[0].answers.map(() => new Animated.Value(0))).current;
    const scoreAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animate buttons appearing
        animateButtonsIn();
        // Animate progress bar
        Animated.timing(progressAnim, {
            toValue: question / example.length,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [question]);

    const animateButtonsIn = () => {
        buttonAnims.forEach((anim, index) => {
            anim.setValue(0);
            Animated.spring(anim, {
                toValue: 1,
                delay: index * 100,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        });
    };

    const shakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const bounceAnimation = () => {
        Animated.sequence([
            Animated.timing(bounceAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
            Animated.spring(bounceAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        ]).start();
    };

    const pulseScoreAnimation = () => {
        Animated.sequence([
            Animated.timing(scoreAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.spring(scoreAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        ]).start();
    };

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        
        setSelectedAnswer(index);
        setIsAnswered(true);
        
        const isCorrect = index === example[question].correct_answer;
        
        // Update answer states
        const newStates: AnswerState[] = example[question].answers.map((_, i) => {
            if (i === example[question].correct_answer) return 'correct';
            if (i === index && !isCorrect) return 'incorrect';
            return 'revealed';
        });
        setAnswerStates(newStates);
        
        if (isCorrect) {
            bounceAnimation();
            pulseScoreAnimation();
            setScore(score + 1);
            setStreak(streak + 1);
        } else {
            shakeAnimation();
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (question + 1 >= example.length) {
            setQuizComplete(true);
            return;
        }

        // Fade out animation
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setQuestion(question + 1);
            setSelectedAnswer(null);
            setAnswerStates(example[question + 1].answers.map(() => 'default'));
            setIsAnswered(false);
            
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
    };

    const restartQuiz = () => {
        setQuestion(0);
        setScore(0);
        setStreak(0);
        setSelectedAnswer(null);
        setAnswerStates(example[0].answers.map(() => 'default'));
        setIsAnswered(false);
        setQuizComplete(false);
        progressAnim.setValue(0);
    };

    const getButtonStyle = (state: AnswerState, index: number) => {
        const baseStyle = {
            width: "85%" as const,
            borderRadius: 16,
        };

        switch (state) {
            case 'correct':
                return {
                    ...baseStyle,
                    backgroundColor: '#4CAF50',
                };
            case 'incorrect':
                return {
                    ...baseStyle,
                    backgroundColor: '#F44336',
                };
            case 'revealed':
                return {
                    ...baseStyle,
                    backgroundColor: '#9E9E9E',
                    opacity: 0.6,
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: theme.colors.primaryContainer,
                };
        }
    };

    const getButtonIcon = (state: AnswerState) => {
        switch (state) {
            case 'correct':
                return ({ size, color }: { size: number; color: string }) => 
                    <IconCheck size={size} color="#fff" />;
            case 'incorrect':
                return ({ size, color }: { size: number; color: string }) => 
                    <IconX size={size} color="#fff" />;
            default:
                return ({ size, color }: { size: number; color: string }) => 
                    <IconQuestionMark size={size} color={color} />;
        }
    };

    if (quizComplete) {
        return (
            <View style={styles.container}>
                <Surface style={styles.completionCard} elevation={4}>
                    <IconTrophy size={80} color="#FFD700" />
                    <Text variant="headlineLarge" style={styles.completionTitle}>
                        Quiz Complete!
                    </Text>
                    <Text variant="headlineMedium" style={styles.scoreText}>
                        {score} / {example.length}
                    </Text>
                    <Text variant="bodyLarge" style={styles.percentageText}>
                        {Math.round((score / example.length) * 100)}% Correct
                    </Text>
                    <FAB
                        style={styles.restartButton}
                        icon="restart"
                        label="Play Again"
                        onPress={restartQuiz}
                    />
                </Surface>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Score and Progress */}
            <View style={styles.header}>
                <Animated.View style={{ transform: [{ scale: scoreAnim }] }}>
                    <Surface style={styles.scoreBadge} elevation={2}>
                        <Text variant="titleMedium">Score: {score}</Text>
                    </Surface>
                </Animated.View>
                
                {streak > 1 && (
                    <Surface style={styles.streakBadge} elevation={2}>
                        <Text variant="titleMedium">🔥 {streak} Streak!</Text>
                    </Surface>
                )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Text variant="bodySmall" style={styles.progressText}>
                    Question {question + 1} of {example.length}
                </Text>
                <ProgressBar
                    progress={(question + (isAnswered ? 1 : 0)) / example.length}
                    style={styles.progressBar}
                    color={theme.colors.primary}
                />
            </View>

            {/* Question Card */}
            <Animated.View
                style={[
                    styles.questionContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateX: shakeAnim }
                        ]
                    }
                ]}
            >
                <Surface style={styles.questionCard} elevation={3}>
                    <IconQuestionMark size={32} color={theme.colors.primary} />
                    <Text variant="headlineSmall" style={styles.questionText}>
                        {example[question].question}
                    </Text>
                </Surface>
            </Animated.View>

            {/* Answer Options */}
            <Animated.View 
                style={[
                    styles.answersContainer,
                    { 
                        opacity: fadeAnim,
                        transform: [{ translateX: shakeAnim }]
                    }
                ]}
            >
                {example[question].answers.map((item, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.answerWrapper,
                            {
                                opacity: buttonAnims[index],
                                transform: [
                                    {
                                        translateY: buttonAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0],
                                        }),
                                    },
                                    {
                                        scale: selectedAnswer === index && answerStates[index] === 'correct'
                                            ? bounceAnim
                                            : 1,
                                    },
                                ],
                            },
                        ]}
                    >
                        <FAB
                            style={getButtonStyle(answerStates[index], index)}
                            icon={getButtonIcon(answerStates[index])}
                            label={item}
                            onPress={() => handleAnswer(index)}
                            disabled={isAnswered}
                            color={answerStates[index] !== 'default' ? '#fff' : undefined}
                        />
                    </Animated.View>
                ))}
            </Animated.View>

            {/* Next Button */}
            {isAnswered && (
                <Animated.View
                    style={[
                        styles.nextButtonContainer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <FAB
                        style={styles.nextButton}
                        icon={({ size, color }) => <IconArrowRight size={size} color={color} />}
                        label={question + 1 >= example.length ? "See Results" : "Next Question"}
                        onPress={nextQuestion}
                    />
                </Animated.View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        padding: 16,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
    },
    scoreBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    streakBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    progressContainer: {
        width: '100%',
        paddingHorizontal: 8,
    },
    progressText: {
        marginBottom: 4,
        textAlign: 'center',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    questionContainer: {
        width: '100%',
        alignItems: 'center',
    },
    questionCard: {
        width: '90%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        gap: 12,
    },
    questionText: {
        textAlign: 'center',
    },
    answersContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 12,
    },
    answerWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    nextButtonContainer: {
        marginTop: 16,
    },
    nextButton: {
        borderRadius: 28,
    },
    feedbackCard: {
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    completionCard: {
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        gap: 16,
    },
    completionTitle: {
        marginTop: 16,
    },
    scoreText: {
        fontWeight: 'bold',
    },
    percentageText: {
        opacity: 0.7,
    },
    restartButton: {
        marginTop: 16,
    },
});