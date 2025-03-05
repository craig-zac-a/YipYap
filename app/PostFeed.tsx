import { Image, StyleSheet, TextInput, Text, View, Platform, Touchable, TouchableHighlight, Pressable, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

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
import axios from 'axios';

export default function PostFeed() {
    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    let longitude: Double;
    let latitude: Double;

    interface Post {
        postid: string;
        title: string;
        message: string;
        timestamp: string;
    }

    // Function that executes on page load
    useEffect(() => {
        fetchPosts();
    }, []);

    // Function to device location
    const getLocation = async () => {
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

    // Function to fetch all posts in radius
    const fetchPosts = async () => {
        setRefreshing(true);
        const location = await getLocation();
        if (!location)
        {
            setRefreshing(false);
            return;
        }

        const source = axios.CancelToken.source();

        try
        {
            console.log("Fetching Posts at: ", location);
            const authToken = await SecureStore.getItemAsync("authToken");
            if (!authToken)
            {
                console.log("No auth token found");
                setRefreshing(false);
                return;
            }

            const response = await axios.get(`http://99.32.47.49:3000/posts/fetch`, {
                params: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: 5000,
                },
                headers: {
                    'Authorization': authToken,
                },
                timeout: 5000,
            });
            
            const data = response.data;
            console.log("Fetched Posts: ", data);
            setPosts(data);
        }
        catch (error)
        {
            if (axios.isAxiosError(error)) {
                console.error("Axios error fetching posts:", error.response?.status, error.response?.data);
            } else {
                console.error("Unexpected error:", error);
            }
        }
        finally
        {
            setRefreshing(false);
        }
    };

    // Refresh function
    const onRefresh = useCallback(async () => {
        await fetchPosts();
    }, []);

    // Render Post function
    const renderPost = ({ item }: { item: Post }) => (
        <TouchableOpacity onPress={() => postClickHandler(item)}>
            <View style={styles.postContainer}>
                <Text style={styles.postMessage}>{item.message}</Text>
                <Text style={styles.postTimestamp}>Posted {timeSincePost(item.timestamp)} ago</Text>
            </View>
        </TouchableOpacity>
    );

    // Time since post was created
    const timeSincePost = (timestamp: string) => {
        const postTime = new Date(timestamp);
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - postTime.getTime();
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) return `${years} year${years > 1 ? "s" : ""}`;
        else if (months > 0) return `${months} month${months > 1 ? "s" : ""}`;
        else if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
        else if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
        else if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
        else if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
        else return `${seconds} second${seconds > 1 ? "s" : ""}`;
    };


    // Click handler for the post
    const postClickHandler = (post: Post) => {
        console.log(`Post Clicked: ${post.postid}`);
    };

    return (
        <View style={styles.container}>
            <FlatList<Post>
                data = {posts}
                keyExtractor = {(item) => item.postid.toString()}
                renderItem = {renderPost}
                style = {styles.postList}
                refreshControl = {
                    <RefreshControl
                        refreshing = {refreshing}
                        onRefresh = {onRefresh}
                    />
                }
            />
        </View>
    );

}

const styles = StyleSheet.create({
	container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    postList: {
        flex: 1,
    },
    postContainer: {
        backgroundColor: "#ffffff",
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postMessage: {
        fontSize: 16,
        color: "#333",
        marginBottom: 6,
    },
    postTimestamp: {
        fontSize: 12,
        color: "#888",
        textAlign: "right",
    },
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
