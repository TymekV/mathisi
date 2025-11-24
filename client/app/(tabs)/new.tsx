import NoteAddScreen from "@/components/note_add";
import { OCR } from "@dccarmo/react-native-ocr";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

export default function AddNewScreen() {
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [writing, setWriting] = useState<string>("");

  const pickImage = async () => {

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      const text = await OCR.recognizeText(uri);
      setWriting(text);
      setIsWriting(true);
    }
  };
  const startScratch = () => setIsWriting(true);

  const remove = () => {
    setWriting("");
    setIsWriting(false);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {isWriting ? (
        <NoteAddScreen text={writing} updateText={setWriting} remove={remove} />
      ) : (
        <View style={styles.centerContainer}>
          <FAB
            icon="plus"
            label="Add from photo"
            style={styles.fab}           // ← optional extra styling
            onPress={pickImage}
          />
          <FAB
            icon="plus"
            label="Start from scratch"
            style={styles.fab}           // ← optional extra styling
            onPress={startScratch}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,                    // allows content to fill the screen

  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,           // optional breathing room
    gap: 15
  },
  fab: {
    width: "50%",
  },
});