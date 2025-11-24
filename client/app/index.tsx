import LogInCard from "@/components/log-in";
import SignInCard from "@/components/sign-in";
import { Redirect } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

export default function IndexScreen() {

    const [isLoged, setIsLoged] = useState<boolean>(false);
    const [isLogging, setIsLogging] = useState<boolean>(true);


    const handleLoginPress = () => {
        setIsLogging(true);
    };

    const handleRegisterPress = () => {
        setIsLogging(false);
    };

    useEffect(() => {
        checkLogin()
    })
    async function checkLogin() {
        const res = await SecureStore.getItemAsync('token')
        if (res) {
            console.log("i am logged");
            setIsLoged(true)
        }

    }

    return (
        <ScrollView
        >
            {
                isLoged
                    ?

                    <Redirect href={"/(tabs)/(home)"}></Redirect>
                    :
                    isLogging ?
                        <LogInCard onRegisterPress={handleRegisterPress} onLogin={checkLogin} />
                        :
                        <SignInCard onLoginPress={handleLoginPress} onLogin={checkLogin} />
            }
        </ScrollView>
    )
}