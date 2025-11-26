// gowno kod, sory oczy juz bolą i czuje że słabo widze xd, to już  chyba 10-11 godzina przed kompem, nwm
import { IconCardsFilled, IconHelpHexagonFilled } from '@tabler/icons-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import FlashCardMenu from './flash-cards/flash-card-menu';
import QuestionMenu from './quiz/question-menu';


export default function QuestionTab() {
    function GoBack() {
        setSelection(0);
    }
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    function getNode() {
        if (selection == 0) {
            return (
                <View style={styles.centerContainer}>
                    <FAB
                        icon={({ size, color }) => <IconCardsFilled size={size} color={color} />}
                        label="Flash cards"
                        style={styles.fab}
                        onPress={() => setSelection(1)}
                    />
                    <FAB
                        icon={({ size, color }) => (
                            <IconHelpHexagonFilled size={size} color={color} />
                        )}
                        label="Quiz"
                        style={styles.fab}
                        onPress={() => setSelection(2)}
                    />
                </View>
            );
        } else if (selection === 1) {
            return <FlashCardMenu id={id ? id : ""} onBack={GoBack} />;
        } else {
            return <QuestionMenu id={id ? id : ""} onBack={GoBack} />;
        }
    }

    const [selection, setSelection] = useState<number>(0);

    return <View style={{ flex: 1 }}>{getNode()}</View>;
}
const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        gap: 15,
    },
    fab: {
        width: '50%',
    },
});
