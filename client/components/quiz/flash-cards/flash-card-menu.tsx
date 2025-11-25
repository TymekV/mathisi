// gowno kod, sory oczy juz bolą i czuje że słabo widze xd, to już  chyba 10-11 godzina przed kompem, nwm
import { IconX } from "@tabler/icons-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Button, FAB, Surface, Text } from "react-native-paper";
import FlashCard from "./flash-card";


const example = [
    {
        front: "1",
        back: "2",
    },
    {
        front: "front",
        back: "back",
    },
    {
        front: "1",
        back: "2",
    },
    {
        front: "front",
        back: "back",
    }
]

interface Props {
    onBack: () => void
}

export default function FlashCardMenu({ onBack }: Props) {


    const [index, setIndex] = useState<number>(0);

    function prev() {
        if (index - 1 < 0) {
            setIndex(example.length - 1)
        }
        else {
            setIndex(index - 1)
        }

    }
    function next() {
        if (index + 1 > example.length - 1) {
            setIndex(0)
        }
        else {
            setIndex(index + 1)
        }
    }

    function getRandomInt(max:number) {
        return Math.floor(Math.random() * max);
    }
    function random() {
        setIndex(getRandomInt(example.length))
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <FAB
                onPress={() => onBack()}
                icon={({ size, color }) => <IconX size={size} color={color} />} />

            <FlashCard label_frontsize={example[index].front} label_backside={example[index].back} />
            <View style={{ gap: 35 }}>
                <Surface style={{ padding: 25 }}>
                    <Text style={{ textAlign: 'center' }}>{(index + 1) + "/" + example.length}</Text>
                </Surface>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <Button mode="outlined" onPress={prev}>
                        <Text>Prev</Text>
                    </Button>
                    <Button mode="outlined" onPress={random}>
                        <Text>Random</Text>
                    </Button>
                    <Button mode="outlined" onPress={next}>
                        <Text>Next</Text>
                    </Button>
                </View>
            </View>

        </View>
    );

}