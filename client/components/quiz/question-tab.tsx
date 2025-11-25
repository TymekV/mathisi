// gowno kod, sory oczy juz bolą i czuje że słabo widze xd, to już  chyba 10-11 godzina przed kompem, nwm
import { IconCardsFilled, IconHelpHexagonFilled } from "@tabler/icons-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { FAB } from "react-native-paper";
import FlashCardMenu from "./flash-cards/flash-card-menu";
import QuestionMenu from "./quiz/question-menu";


const example = [
    {
        front: "1",
        back: "2",
    },
    {
        front: "front",
        back: "back",
    }
]

export default function QuestionTab() {

    function GoBack() {
        setSelection(0)
    }

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
                        icon={({ size, color }) => <IconHelpHexagonFilled size={size} color={color} />}
                        label="Quiz"
                        style={styles.fab}
                        onPress={() => setSelection(2)}
                    />
                </View>
            )
        } else if (selection == 1) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <FlashCardMenu onBack={GoBack} />
                </View>
            )

        }
        else {
            return (

                <QuestionMenu />

            )
        }
    }

    const [selection, setSelection] = useState<number>(0);

    return (
        <View style={{ flex: 1 }}>

            {
                getNode()
            }

        </View>
    );

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
