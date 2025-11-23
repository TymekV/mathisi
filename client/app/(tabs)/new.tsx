import { OCR } from "@dccarmo/react-native-ocr";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import { StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
export default function AddNewScreen() {

  const [result, setResult] = React.useState("No Result");
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const pickImage = async () => {
    if(!isLogged){
      alert("You need to log in in order to add note")
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    
    if (!result.canceled) {
      OCR.recognizeText(result.assets[0].uri).then(setResult);
      console.log(result);
    }
  };

  async function checkLogin() {
    const res = await SecureStore.getItemAsync('token')
    if (res) {
      console.log("i am logged");
      setIsLogged(true)
    }
  }

  return (

    <View
      style={styles.centerContainer}
    >


      <FAB
        icon="plus"
        variant="primary"
        size="large"
        onPress={pickImage}
      />
      <Text style={{ color: "white" }}>
        {
          "Debug text:" + result
        }
      </Text>
    </View>

  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
