import { IconQuestionMark } from "@tabler/icons-react-native";
import { useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper";

const example = [
    {
        question: "Select 1",
        correct_answer: 1,
        answer: "1",
        answer1: "2",
        answer2: "3",
        answer3: "4",
    },
    {
        question: "Select 2",
        correct_answer: 2,
        answer: "1",
        answer1: "2",
        answer2: "3",
        answer3: "4",
    }
]

export default function QuestionMenu() {



    const [question, setQuestion] = useState<number>(0);



    return (
        <View>
            <FAB
                icon={({ size, color }) => <IconQuestionMark size={size} color={color} />}
                label={example[question].question}
            />
        </View>
    )
}