// profile.tsx
import UserProfile from '@/components/user-profile';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

export default function ProfileScreen() {


  async function logOut() {
    await SecureStore.deleteItemAsync('token');
    router.replace("/")
  }


  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <UserProfile />
      <Button mode="outlined" onPress={logOut} style={{ marginTop: 20 }}>
        Log Out
      </Button>
    </ScrollView>
  );
}