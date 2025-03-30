import { StyleSheet, TextInput, Pressable, View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Octicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation } from 'expo-router';


export default function CreatePost({ route }: any) {
    const navigation = useNavigation()
    const [message, setMessage] = useState("")
    const {parentid, parentmessage, parenttimestamp, parenttitle} = route.params

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
        if (parentid == "-1") {
            sendOriginalPost();
        } else {
            sendCommentPost();
        }
    }

    const sendOriginalPost = async () => {
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
            navigation.goBack();
        }
    }

    const sendCommentPost = async () => {
        const location = await getLocation();
        if (!location || message.length == 0) return;
        try {
            const authToken = await SecureStore.getItemAsync("authToken");

            console.log("Sending comment at location:", location);
            const response = await axios.post('https://99.32.47.49:3000/posts/' + parentid + '/comments', {message: message}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                timeout: 5000, 
            });
            console.log("Comment sent");
        } catch (error) {
            console.log("Hold my beer");
            console.error("Error logging in:", error);
        } finally {
            navigation.goBack();
        }
    }

    const header = parentid == "-1" ? <View/> :
    <View>
        <Text>parentid: {parentid}</Text>
    </View>

    return (
        <Pressable style={[styles.container, { width: "100%", height: "100%" }]}>
            {header}
            <View style={styles.formInputWrapper}>
                <Octicons name="pencil" size={24} style={{marginLeft: 5, marginTop: 5}} />
                <TextInput
                    style={styles.input}
                    placeholder="Message"
                    multiline={true}
                    maxLength={125}
                    onChangeText={setMessage}
                    value={message}
                />
            </View>
            <Pressable style={styles.noRoom} onPress={sendPost}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Create Post</Text>
                </View>
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 2,
        paddingVertical: 8,
        gap: 8,
        alignItems: 'center'
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
    backgroundColor: "#ffffff",
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
  },
});