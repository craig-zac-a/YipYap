import { StyleSheet, TextInput, Pressable, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import axios from 'axios';


export default function CreatePost({ navigation }: any) {
    const [message, setMessage] = useState("")


    // Function to device location
    const getLocation = async () =>
    {
        try
        {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted")
            {
                console.log("Location permission denied");
                return;
            }

            let location = await Location.getLastKnownPositionAsync({
                maxAge: 60000,
            });

            if(!location || (Date.now() - location.timestamp) > 60000)
            {
                location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
            }
            return{latitude: location.coords.latitude, longitude: location.coords.longitude};
        } 
        catch (error)
        {
            console.error("Error requesting location permission:", error);
            return null;
        }
    };

    const sendPost = async () => {
        const location = await getLocation();
        if(!location) return;
        try
        {
            const authToken = await SecureStore.getItemAsync("authToken");

            console.log("Sending post at location:", location);
            const response = await axios.post(`http://99.32.47.49:3000/posts`, {latitude: location.latitude, longitude: location.longitude, message: message}, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
            },
            timeout: 5000,
            });
            console.log("Post sent");
        }
        catch (error)
        {
            console.log("Hold my beer");
            console.error("Error logging in:", error);
        }
        finally
        {
            navigation.navigate("PostFeed");
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
                <ThemedText>Create Post</ThemedText>
            </ThemedView>
            <ThemedView style={styles.formInputWrapper}>
                <Octicons name="pencil" size={24} color="#FFFA" />
                <TextInput
                    style={styles.input}
                    placeholder="Message"
                    onChangeText={setMessage}
                    value={message}
                />
            </ThemedView>
            <Pressable style={styles.noRoom} onPress={sendPost}>
                <ThemedView style={styles.button}>
                    <ThemedText style={styles.buttonText}>Create Post</ThemedText>
                </ThemedView>
            </Pressable>
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
    noRoom: {
        padding: 0,
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