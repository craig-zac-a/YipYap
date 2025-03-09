import { StyleSheet, TextInput, Pressable, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';


export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [loginFail, setloginFail] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    retrieveCredentials();
  }, []);

  const login = async () => {
    try {
			const response = await axios.post(`http://99.32.47.49:3000/users/login`, {email: email, password: password}, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      const data = response.data;
      await SecureStore.setItemAsync("authToken", data.authToken);
      storeCredentials(email, password);

      navigation.navigate("PostFeed");

    } catch (error) {
      setloginFail(true);
      setEmail("");
      setPassword
      console.error("Error logging in:", error);
    }
  }

  const storeCredentials = async (email: string, password: string) =>
  {
    try
    {
      await SecureStore.setItemAsync("email", email);
      await SecureStore.setItemAsync("password", password);
    }
    catch (error)
    {
      console.error("Error storing credentials:", error);
    }
  }

  const retrieveCredentials = async () =>
  {
    try
    {
      const email = await SecureStore.getItemAsync("email");
      const password = await SecureStore.getItemAsync("password");
      if (email && password)
      {
        setEmail(email);
        setPassword(password);
        return true;
      }
      return false;
    }
    catch (error)
    {
      console.error("Error retrieving credentials:", error);
      return false;
    }
  }

  return (
    <Pressable style={{ width: "100%", height: "100%" }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/fulllogo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Login</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedView style={[styles.formInputWrapper, { backgroundColor: loginFail ? "#D88090" : "#0005" }]}>
            <Octicons name="mail" size={20} color="#FFF7" />
            <TextInput
              style={styles.input}
              cursorColor='#FFFA'
              placeholderTextColor="#FFF7"
              value={email}
              onChangeText={(email) => { setEmail(email); }}
              autoCapitalize="none"
              placeholder='Email' />
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedView style={[styles.formInputWrapper, { backgroundColor: loginFail ? "#D88090" : "#0005" }]}>
            <Octicons name="shield-lock" size={20} color="#FFF7" />
            <TextInput
              style={styles.input}
              cursorColor='#FFFA'
              placeholderTextColor="#FFF7"
              value={password}
              onChangeText={(password) => { setPassword(password); }}
              secureTextEntry={true}
              autoCapitalize="none"
              placeholder='Password' />
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Pressable
            style={({ pressed }) => [
              { backgroundColor: pressed ? "#0166D3" : "#2196F3" },
              styles.button]}
            onPress={login}>
            <ThemedText style={styles.buttonText} type='defaultSemiBold'>Login</ThemedText>
          </Pressable>
        </ThemedView>
      </ParallaxScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 167,
		width: 350,
		bottom: 0,
		left: 0,
		position: 'absolute',
		//alignSelf: 'center',
		//alignContent: 'center',
		marginLeft: 17,
		marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  password: {
    fontSize: 8,
    color: "#FFF7"
  },
  formInputWrapper: {
    width: '90%',
    height: 55,
    backgroundColor: "#0005",
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0
  },
  input: {
    width: "90%",
    height: "100%",
    marginLeft: 10,
    color: "#FFFA"
  },
  button: {
    width: "90%",
    height: 55,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    padding: 12
  },
  buttonText: {
    textAlign: 'center',
    color: 'white'
  },
});