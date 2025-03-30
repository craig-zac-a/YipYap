import { StyleSheet, TextInput, Pressable, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Octicons, AntDesign } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation } from 'expo-router';


export default function CreatePost({ route }: any) {
    const navigation = useNavigation()
    const [post, setPost] = useState<Post>();
    const [message, setMessage] = useState("")
    const {parentid, parentmessage, parenttimestamp, parenttitle} = route.params
    
    interface Post {
        postid: string;
        title: string;
        message: string;
        timestamp: string;
    }

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
            const response = await axios.post(`http://99.32.47.49:3000/posts/${parentid}/comments`, {message: message}, {
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

    const fetchParent = async () => {
        const source = axios.CancelToken.source();

        try {
            console.log("Fetching Post");
            const authToken = await SecureStore.getItemAsync("authToken");
            if (!authToken) {
                console.log("No auth token found");
                return;
            }

            const response = await axios.get(`http://99.32.47.49:3000/posts/${parentid}`, {
                headers: {
                    'Authorization': authToken,
                },
                timeout: 5000,
            });

            const data: Post = response.data;
            console.log("Fetched Post: ", data);
            setPost(data);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error fetching post:", error.response?.status, error.response?.data);
            } else {
                console.error("Unexpected error:", error);
            }
        }
    }
    
    const timeSinceCreated = (timestamp: string) => {
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

    const PostBox = ({ item }: { item?: Post }) => {
        if (!item) {
            return null;
        }
        // const interaction = interactionCounts[item.postid] || { likes: 0, dislikes: 0, comments: 0 };

        return (
            <TouchableOpacity style={styles.postWrapper}>
                <View style={styles.postContainer}>
                    <Text style={styles.postMessage}>{item.message}</Text>
                    <TouchableWithoutFeedback>
                        <View style={styles.bottomBar}>
                            <Text style={styles.postTimestamp}>Posted {timeSinceCreated(item.timestamp)} ago</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableOpacity>
        )
    };

    if (parentid != '-1') {
        fetchParent()
    }

    const parentpost = parentid == '-1' ? <View/> :
    <PostBox item={post} />

    return (
        <View style={styles.container}>
            {parentpost}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 2,
        paddingVertical: 8,
        gap: 8,
    },
    noRoom: {
        padding: 0,
    },
    formInputWrapper: {
        height: 300,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 0,
        marginHorizontal: 16,
    },
    input: {
        height: "100%",
        marginLeft: 10,
        textAlignVertical: "top"
    },
    button: {
        height: 55,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: "center",
        padding: 12,
        marginHorizontal: 16,
    },
    buttonText: {
        textAlign: 'center',
    },
    postContainer: {
        backgroundColor: "#ffffff",
        padding: 12,
        paddingBottom: 0,
        marginVertical: 0,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postWrapper: {
        padding: 0,
        marginVertical: 12,
    },
    postMessage: {
        fontSize: 16,
        color: "#333",
        marginBottom: 6,
    },
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 0,
        zIndex: 50,
    },
    postTimestamp: {
        fontSize: 12,
        color: "#888",
        textAlign: "left",
        flex: 1,
        marginBottom: 6,
    },
    reactionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        flex: 1,
    },
    postInteractionCount: {
        fontSize: 12,
        color: "#333",
        textAlign: "center",
    },
    reactionButton: {
        paddingVertical: 8,
        alignItems: "center",
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "column",
        alignItems: "center",
    },
});