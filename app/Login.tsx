import { StyleSheet, TextInput, Pressable, Image } from 'react-native';
import React, { useState } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import SecureStore from 'expo-secure-store';


export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [loginFail, setloginFail] = useState(false)
  const [password, setPassword] = useState("")

  const login = async () => {
    try {
      const response = await fetch('http://99.32.47.49:3000/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      console.log("Request sent")
      if (!response.ok) {
        setloginFail(true);
        setEmail("");
        setPassword("");
        if (response.status === 401)
        {
          console.log("Invalid email or password")
        }
        throw new Error(`Response status: ${response.status}`);
      }
      // const data = await response.json();
      // await SecureStore.setItemAsync("authToken", data.token);


      console.log("Logged In")
      navigation.navigate("PostFeed");

    } catch (error) {
      console.error("Error logging in:", error);
    }
  }

  return (
    <Pressable style={{ width: "100%", height: "100%" }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
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
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
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