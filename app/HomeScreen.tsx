import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function HomeScreen({ navigation }: any) {

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    const authToken = await SecureStore.getItemAsync('authToken');
    if(!authToken) return;
    console.log("Auth token found:");
    // Verify the token is valid
    try
    {
      const response = await axios.get(`http://99.32.47.49:3000/users/verify`, {
        headers: {
            'Authorization': authToken,
        },
        timeout: 5000,
      });

      navigation.navigate('PostFeed');
    }
    catch (error)
    {
      console.log('Token verification failed');
      await SecureStore.deleteItemAsync('authToken');
      return;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Login" 
          onPress={() => navigation.navigate('Login')} 
        />
        
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('CreateAccount')}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
});
