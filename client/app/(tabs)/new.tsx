import NoteAddScreen from "@/components/note_add";
import { apiBaseUrl } from "@/constants/apiBaseUrl";
import { paths } from "@/types/api";
import { OCR } from "@dccarmo/react-native-ocr";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from 'expo-secure-store';
import createClient from "openapi-fetch";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

export default function AddNewScreen() {
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [writing, setWriting] = useState<string>("");


  const $api = createClient<paths>({
    baseUrl: apiBaseUrl,
  });

  const startScratch = () => setIsWriting(true);

  const pickImage = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (pickerResult.canceled) return;

    const uri = pickerResult.assets[0].uri;
    const text = await OCR.recognizeText(uri);

    const token = await SecureStore.getItemAsync("token");
    const files = await askFiles();

    if (files) {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = token;

        const { data, error } = await $api.POST("/api/files", {
          headers: {
            Authorization: token
          },
          body: files as any,

        });


        data?.files.forEach(async (i) => {
          const { data, error } = await $api.PATCH("/api/files/{id}", {
            params:{
              path:{
                id: i.id
              }
            },
            headers: {
              Authorization: token
            },
            body: {
              filename : i.filename,
              ocr: text,

            },

          });

          console.log(data)
        })

      }


    }

  };

  async function askFiles() {
    const files = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!files.assets || files.assets.length === 0) {
      return null;
    }

    const formData = new FormData();
    files.assets.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);
    });

    return formData;
  }

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
    flexGrow: 1,

  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 15
  },
  fab: {
    width: "50%",
  },
});