import LogInCard from '@/components/log-in';
import SignInCard from '@/components/sign-in';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

export default async function ProfileScreen() {
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
  async function logOut() {
    await SecureStore.deleteItemAsync('token');
    setIsLoged(false);
  }

  return (
    <ScrollView>
      {
        isLoged ?
          <View>
            <Button onPress={logOut}>Log Out</Button>
          </View>
          :
          <View style={styles.centerContainer}>
            {
              isLogging ?
                <LogInCard onRegisterPress={handleRegisterPress} onLogin={checkLogin} />
                :
                <SignInCard onLoginPress={handleLoginPress} onLogin={checkLogin}/>
            }
          </View>
      }

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 5
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '90%',
  },
});
