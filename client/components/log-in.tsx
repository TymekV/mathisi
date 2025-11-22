import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, TextInput } from "react-native-paper";

type Props = {
  onRegisterPress: () => void;
};


export default function LogInCard({onRegisterPress} : Props) {
    
    const [password,setPassword] = useState<string>("")
    const [email,setEmail] = useState<string>("")

    const hasErrors = () => {
        return !email.includes('@');
    };

    return(
    <Card style={styles.card}>
        <Card.Title title="Log In" />
        <Card.Content>
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
            />
            <HelperText type="error" visible={hasErrors()}>
                Email address is invalid!
            </HelperText>

            <TextInput
                label="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry
            />
        </Card.Content>

        <Card.Actions>
            <View style={styles.bottom}>
                <Button onPress={onRegisterPress}>Register</Button>
                <Button>Submit</Button>
            </View>
        </Card.Actions>
    </Card>
    );
}

const styles = StyleSheet.create({
  bottom:{
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 5
  },
  card: {
    width: '90%',             // Optional: limit width to 90% of screen
  },
});