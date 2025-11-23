import LogInCard from '@/components/log-in';
import SignInCard from '@/components/sign-in';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function ProfileScreen() {
  const [isLoged, setIsLoged] = useState<boolean>(false);
  const [isLogging,setIsLogging] = useState<boolean>(true);
 
  const handleLoginPress = () => {
    setIsLogging(true); // Switch to login view
  };

const handleRegisterPress = () => {
    setIsLogging(false); // Switch to login view
  };


  return (
    <PaperProvider>
      <View style={styles.centerContainer}>
        {
          isLogging ?
          <LogInCard onRegisterPress={handleRegisterPress}  />
          :
          <SignInCard onLoginPress={handleLoginPress} />
        }
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  bottom:{
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
