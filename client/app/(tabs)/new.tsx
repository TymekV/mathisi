import NoteAddScreen from "@/components/note_add";
import { OCR } from "@dccarmo/react-native-ocr";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';


export default function AddNewScreen() {

  const [result, setResult] = React.useState("");
  const [isLogged, setIsLogged] = useState<boolean>(false);


  const pickImage = async () => {
    if (!isLogged) {
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
  useFocusEffect(() => {
    checkLogin();
  })
  function remove() {
    setResult("")
  }
  async function checkLogin() {
    const res = await SecureStore.getItemAsync('token')
    if (res) {
      setIsLogged(true)
    } else {
      setIsLogged(false)
    }
  }

  return (

    <ScrollView
    >

      {
        result.trim() === "" ?
          <View style={styles.centerContainer}>
            <FAB
              icon="plus"
              variant="primary"
              size="large"
              onPress={pickImage}
            />
          </View>
          :
          <NoteAddScreen text={result} updateText={setResult} remove={remove}>

          </NoteAddScreen>


      }


    </ScrollView>

  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 15,
    flexDirection: 'row',
  },
  fill1: {
    flexGrow: 1,
  }
});
