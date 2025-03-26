import { StyleSheet, TextInput, Pressable, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation } from 'expo-router';


export default function CreatePost() {
    const navigation = useNavigation()
    const [message, setMessage] = useState("")
    const {parentid, parentmessage, parenttimestamp, parenttitle} = {parentid: '-1', parentmessage: '', parenttimestamp: '', parenttitle: ''}

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
        if(!location || message.length == 0) return;
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
            navigation.goback();
        }
    }

    return (
        <Pressable style={{ width: "100%", height: "100%" }}>
        <ThemedView style={[styles.stepContainer, { width: "100%", height: "100%" }]}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText>Create Post</ThemedText>
            </ThemedView>
            <ThemedView style={styles.formInputWrapper}>
                <Octicons name="pencil" size={24} color="#FFFA" style={{marginLeft: 5, marginTop: 5}} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#FFF7"
                    placeholder="Message"
                    multiline={true}
                    maxLength={125}
                    onChangeText={setMessage}
                    value={message}
                />
            </ThemedView>
            <Pressable style={styles.noRoom} onPress={sendPost}>
                <ThemedView style={styles.button}>
                    <ThemedText style={styles.buttonText}>Create Post</ThemedText>
                </ThemedView>
            </Pressable>
            <ThemedText>parentid: {parentid}</ThemedText>
        </ThemedView>
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
    marginTop: 8,
    gap: 8,
  },
  stepContainer: {
    marginBottom: 8,
    alignItems: 'center',
    gap: 16,
  },
  password: {
    fontSize: 8,
    color: "#FFF7"
  },
  formInputWrapper: {
    width: '90%',
    height: 300,
    backgroundColor: "#0005",
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 0
  },
  input: {
    width: "90%",
    height: "100%",
    marginLeft: 10,
    color: "#FFFA",
    textAlignVertical: "top"
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