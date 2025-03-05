import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';

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
      const response = await fetch('http://99.32.47.49:3000/account/verifyToken', {
        method: 'GET',
        headers: {
          Authorization: authToken,
        },
      });
      if (!response.ok) {
        console.log('Token verification failed');
        await SecureStore.deleteItemAsync('authToken');
        return;
      }

      navigation.navigate('PostFeed');
    }
    catch (error)
    {
      console.error('Error verifying token:', error);
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
