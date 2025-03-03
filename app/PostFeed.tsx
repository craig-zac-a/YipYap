import { Image, StyleSheet, TextInput, Text, View, Platform, TouchableHighlight, Pressable } from 'react-native';
import React, { useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { Link, useNavigation } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

export default function PostFeed() {
    let longitude: Double;
    let latitude: Double;

    const getLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
            console.log("Location permission denied");
            return;
            }

            let location = await Location.getCurrentPositionAsync({});
            latitude = location.coords.latitude;
            longitude = location.coords.longitude;
        } 
        catch (error) {
            console.error("Error requesting location permission:", error);
        }
    };

    const fetchPosts = async () => {
        try
        {
            await getLocation();
        }
        catch (error)
        {
            console.error("Error fetching location:", error);
            return;
        }
        try
        {
            console.log("Latitude: ", latitude);
            console.log("Longitude: ", longitude);
            const response = await fetch(`http://99.32.47.49:3000/posts/fetch?latitude=${latitude}&longitude=${longitude}&radius=5000`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
                // body: JSON.stringify({ latitude: latitude, longitude: longitude, radius: 5000 }),
            });
            
            if (!response.ok)
            {
                throw new Error(`Response status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched Posts: ", data);
        }
        catch (error)
        {
            console.error("Error fetching posts:", error);
        }
    };


    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>
            <Pressable 
            style={({pressed}) => [
                {backgroundColor: pressed ? "#0166D3" : "#2196F3"}, 
                styles.button]} 
                onPress={fetchPosts}>
                    <ThemedText style={styles.buttonText} type='defaultSemiBold'>Create Account</ThemedText>
            </Pressable>
        </ParallaxScrollView>

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
	checkboxcontainer: {
		width: "90%",
		height: 55,
		flexDirection: 'row',
		alignItems: 'center'
	},
	checkbox: {
		alignSelf: 'center',
		margin: 10,
		color: "#0005"
	},
});
