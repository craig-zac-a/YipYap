import { StyleSheet, TextInput, Pressable, View, Text, TouchableOpacity, TouchableWithoutFeedback, FlatList, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Octicons, AntDesign } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import * as ImagePicker from "expo-image-picker"


export default function CreatePost({ route }: any) {
    const navigation = useNavigation()
    const [post, setPost] = useState<Post>()
    const [message, setMessage] = useState("")
    const [flair, setFlair] = useState("")
    const [flairs, setFlairs] = useState<string[]>([])
    const [img, setImg] = useState<string|null>(null)
    const [error, setError] = useState(null)
    const {parentid} = route.params
    
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
        // if(!location || (message.length == 0 && img == null)) return; // For when pictures work
        if(!location || message.length == 0) return;
        try
        {
            const authToken = await SecureStore.getItemAsync("authToken");

            console.log("Sending post at location:", location);
            const response = await axios.post(`http://99.32.47.49:3000/posts`, {latitude: location.latitude, longitude: location.longitude, message: message, flairs: flairs}, {
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
        // if (message.length == 0 && img == null) return; // For when pictures work
        if (message.length == 0) return;
        try {
            const authToken = await SecureStore.getItemAsync("authToken");

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

    const pickImg = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            Alert.alert("Permission Denied", 'Sorry, we need camera roll permission to upload images.')
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
            })

            if (!result.canceled) {
                setImg(result.assets[0].uri)
                setError(null)
            }
        }
    }

    const PostBox = ({ item }: { item?: Post }) => {
        if (!item) {
            return null;
        }

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

    const flairelement = parentid != '-1' ? <View/> :
    <View style={styles.flairsContainer}>
        <View style={styles.flairsFormInputWrapper}>
            <Octicons name='feed-tag' size={24} style={{marginLeft: 5, marginTop: 8}} />
            <TextInput
                style={styles.input}
                placeholder='Flair'
                maxLength={15}
                onChangeText={setFlair}
                value={flair}
                onSubmitEditing={() => {if (!flairs.includes(flair)) {setFlairs([...flairs, flair])} setFlair('')}}
            />
        </View>
        <View style={[styles.flairsWrapper, {borderWidth: flairs.length == 0 ? 0 : 1}]}>
            <FlatList
                style={styles.flairsValues}
                data={flairs}
                renderItem={({item}) =>  
                    (<View style={styles.flairsItem}>
                        <Text style={{marginRight: 4}}>{item}</Text>
                        <TouchableWithoutFeedback
                            onPress={() => setFlairs(flairs.filter(f => f !== item))}><Octicons name='x' size={24} />
                        </TouchableWithoutFeedback>
                    </View>)
                }
            />
        </View>
    </View>

    const imgelement = <TouchableWithoutFeedback style={styles.imageInputWrapper} onPress={pickImg}>
    {img ? (
        <View style={styles.imageItem}>
            <Image source={{ uri: img }} style={styles.image} />
            <TouchableWithoutFeedback
                onPress={() => setImg(null)}><Octicons name='x' size={24} style={styles.imageRemove} />
            </TouchableWithoutFeedback>
            {/* <Text>{img}</Text> */}
        </View>
    ) : (
        <Text style={{alignSelf: 'center'}}>Touch to add picture</Text>
    )}
    </TouchableWithoutFeedback>

    return (
        <View style={styles.container}>
            {parentpost}
            {flairelement}
            {imgelement}
            <View style={styles.formInputWrapper}>
                <Octicons name="pencil" size={24} style={{marginLeft: 5, marginTop: 8}} />
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
    flairsContainer: {
        gap: 8
    },
    flairsWrapper: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 0,
        marginHorizontal: 16,
    },
    flairsValues: {
        marginBottom: 0,
        marginHorizontal: 16,
    },
    flairsItem: {
        flexDirection: "row",
        alignContent: "flex-end",
        alignItems: "center",
    },
    flairsFormInputWrapper: {
        height: 40,
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
        width: "100%",
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
    imageInputWrapper: {
        height: 300,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 6,
        flexDirection: "row",
        // alignItems: "baseline",
        marginHorizontal: 16,
        // alignContent: 'center',
        gap: 8
    },
    imageItem: {
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center"
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 8,
        alignSelf: 'center'
    },
    imageRemove: {
        flexDirection: "column",
        alignSelf: 'flex-start'
    }
});