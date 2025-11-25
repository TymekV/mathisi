import { Button } from "react-native-paper";

interface Props{
    label : string,
    onPress : () => {}
}

export default function QuestionAnswer({label,onPress} : Props){

    return(
        <Button
        >
        {label}
        </Button>
    );

}