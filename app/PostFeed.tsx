import { Image, StyleSheet, TextInput, Text, View, Platform, TouchableWithoutFeedback, TouchableHighlight, Pressable, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons, AntDesign } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { Link, useNavigation } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import axios from 'axios';

export default function PostFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [postIds, setPostIds] = useState<string[]>([]);
    const [reactions, setReactions] = useState([]);
    const [interactionCounts, setInteractionCounts] = useState<Record<string, InteractionCount>>({});
    const [refreshing, setRefreshing] = useState(false);

    let longitude: Double;
    let latitude: Double;

    interface Post 
    {
        postid: string;
        title: string;
        message: string;
        timestamp: string;
    }

    interface Reaction
    {
        postid: string;
        reaction: number;
    }

    interface InteractionCount
    {
        postid: string;
        likes: number;
        dislikes: number;
        comments: number;
    }

    // Function that executes on page load
    useEffect(() => 
    {
        fetchUserReactions();
        fetchPosts();
    }, []);

    useEffect(() => {
        const fetchInteractions = async () => {
            for (const postid of postIds) {
                await getCountOfInteractions(postid);
            }
        };
    
        if (postIds.length > 0) {
            fetchInteractions();
        }
    }, [postIds]);

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

    // Function to fetch all posts in radius
    const fetchPosts = async () =>
    {
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
            
            const data: Post[] = response.data;
            console.log("Fetched Posts: ", data);
            setPosts(data);
            setPostIds(data.map(post => post.postid));
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

    // Function to fetch user's reactions
    const fetchUserReactions = async () =>
    {
        const authToken = await SecureStore.getItemAsync("authToken");
        if (!authToken)
        {
            console.log("No auth token found");
            return;
        }

        try
        {
            // Get the users reactions
            const response = await axios.get(`http://99.32.47.49:3000/account/posts/get-reactions`, {
                headers: {
                    'Authorization': authToken,
                },
                timeout: 5000,
            });

            const data = response.data;
            console.log("Fetched User Reactions: ", data);
            setReactions(data);
        }
        catch (error)
        {
            console.error("Error fetching user reactions:", error);
        }
    };

    // Get the number of likes, dislikes, and comments
    const getCountOfInteractions = async (postid: string) =>
    {
        const authToken = await SecureStore.getItemAsync("authToken");
        if (!authToken)
        {
            console.log("No auth token found");
            return;
        }

        try
        {
            // Result of this should be a json of the following: { likes: likeResults[0].count, dislikes: dislikeResults[0].count, comments: commentResults[0].count }
            const response = await axios.get(`http://99.32.47.49:3000/posts/get-reactions/${postid}`, {
                headers: {
                    'Authorization': authToken,
                },
                timeout: 5000,
            });
            
            setInteractionCounts(prevCounts => ({
                ...prevCounts,
                [postid]: response.data
            }));
        }
        catch (error)
        {
            console.error("Error getting count of interactions:", error);
        }
    };

    const is_liked = (postid: string) =>
    {
        return reactions.some((reaction: Reaction) => reaction.postid === postid && reaction.reaction === 1);
    };

    const is_disliked = (postid: string) =>
    {
        return reactions.some((reaction: Reaction) => reaction.postid === postid && reaction.reaction === -1);
    };

    const reactToPost = async (postid: string, react: number) =>
    {
        if(reactions.some((reaction: Reaction) => reaction.postid === postid && reaction.reaction === react)) react = 0;
        
        const authToken = await SecureStore.getItemAsync("authToken");
        if (!authToken)
        {
            console.log("No auth token found");
            return;
        }

        try
        {
            const response = await axios.post(`http://99.32.47.49:3000/posts/react/${postid}`, { reaction: react }, {
                headers: {
                    'Authorization': authToken,
                },
                timeout: 5000,
            });
        }
        catch (error)
        {
            console.error("Error liking post:", error);
        }
        finally
        {
            fetchUserReactions();
            getCountOfInteractions(postid);
        }
    };

    // Refresh function
    const onRefresh = useCallback(async () =>
    {
        await fetchUserReactions();
        await fetchPosts();
    }, []);

    // Render Post function
    const renderPost = ({ item }: { item: Post }) =>
    {
        const interaction = interactionCounts[item.postid] || { likes: 0, dislikes: 0, comments: 0 };

        return(
        <TouchableOpacity style={styles.postWrapper} onPress={() => postClickHandler(item)}>
            <View style={styles.postContainer}>
                <Text style={styles.postMessage}>{item.message}</Text>
                <TouchableWithoutFeedback>
                    <View style={styles.bottomBar}>
                        <Text style={styles.postTimestamp}>Posted {timeSincePost(item.timestamp)} ago</Text>
                        <View style={styles.reactionsContainer}>
                            <TouchableOpacity style={styles.reactionButton } onPress={() => reactToPost(item.postid, 1)}>
                                <View style={styles.buttonContainer}>
                                    <Text style={styles.postInteractionCount}>{interaction.likes}</Text>
                                    <AntDesign name={is_liked(item.postid)? "like1" : "like2"} size={24} color={is_liked(item.postid)? "red" : "black"} />
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.reactionButton} onPress={() => reactToPost(item.postid, -1)}>
                                <View style={styles.buttonContainer}>
                                    <Text style={styles.postInteractionCount}>{interaction.dislikes}</Text>
                                    <AntDesign name={is_disliked(item.postid)? "dislike1" : "dislike2"} size={24} color={is_disliked(item.postid)? "red" : "black"} />
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.reactionButton}>
                                <View style={styles.buttonContainer}>
                                    <Text style={styles.postInteractionCount}>{interaction.comments}</Text>
                                    <AntDesign name="message1" size={24} color="black" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableOpacity>
        )
    };

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
        paddingHorizontal: 2,
        paddingVertical: 8,
    },
    postList: {
        flex: 1,
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
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 0,
        zIndex: 50,
    },
    reactionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        flex: 1,
    },
    reactionButton:{
        paddingVertical: 8,
        alignItems: "center",
        flex: 1,
    },
    postMessage: {
        fontSize: 16,
        color: "#333",
        marginBottom: 6,
    },
    postTimestamp: {
        fontSize: 12,
        color: "#888",
        textAlign: "left",
        flex: 1,
    },
    postReactions: {
        fontSize: 12,
        textAlign: "right",
        backgroundColor: "#888",
    },
    postInteractionCount: {
        fontSize: 12,
        color: "#333",
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "column",
        alignItems: "center",
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
