import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, TextInput } from "react-native-paper";

type Props = {
  onLoginPress: () => void;
};

export default function SignInCard({onLoginPress} : Props) {
    
    const [password,setPassword] = useState<string>("")
    const [repeatPassword,setRepeatPassword] = useState<string>("")
    const [email,setEmail] = useState<string>("")

    const hasErrors = () => {
        return !email.includes('@');
    };

    const samePassword = () => {
        return password == repeatPassword;
    };

    return(
    <Card style={styles.card}>
        <Card.Title title="Register" />
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
            <HelperText type="error" visible={samePassword()}>
                Passwords are different 
            </HelperText>
            <TextInput
                label="Repeat password"
                value={repeatPassword}
                onChangeText={text => setRepeatPassword}
                secureTextEntry
            />
            <HelperText type="error" visible={samePassword()}>
                Passwords are different 
            </HelperText>
        </Card.Content>

        <Card.Actions>
            <View style={styles.bottom}>
                 <Button onPress={onLoginPress}>Login</Button>
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