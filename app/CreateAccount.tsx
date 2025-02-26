import { Image, StyleSheet, TextInput, Text, View, Platform, TouchableHighlight } from 'react-native';
import React, { useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { Link } from 'expo-router';

export default function HomeScreen() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [confirmpassword, setConfirmpassword] = useState("")
	const [toscheck, setToscheck] = useState(false)
	const [isloading, setIsloading] = useState(false)

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
			headerImage={
				<Image
					source={require('@/assets/images/partial-react-logo.png')}
					style={styles.reactLogo}
				/>
			}>
		<ThemedView style={styles.titleContainer}>
			<ThemedText type="title">Create an Account</ThemedText>
		</ThemedView>

		<ThemedView style={styles.stepContainer}>
			<ThemedView style={styles.formInputWrapper}>
				<Octicons name="person" size={20} color="#FFF7" />
				<TextInput
					style={styles.input}
					cursorColor='#FFFA'
					placeholderTextColor="#FFF7"
					value={username}
					onChangeText={username => setUsername(username)}
					placeholder='User Name' />
			</ThemedView>
		</ThemedView>
		<ThemedView style={styles.stepContainer}>
			<ThemedView style={styles.formInputWrapper}>
				<Octicons name="shield-lock" size={20} color="#FFF7" />
				<TextInput
					style={styles.input}
					cursorColor='#FFFA'
					placeholderTextColor="#FFF7"
					value={password}
					onChangeText={password => setPassword(password)}
					secureTextEntry={true}
					autoCapitalize="none"
					placeholder='Password' />
			</ThemedView>
		</ThemedView>
		<ThemedView style={styles.stepContainer}>
			<ThemedView style={styles.formInputWrapper}>
				<Octicons name="shield-lock" size={20} color="#FFF7" />
				<TextInput
					style={styles.input}
					cursorColor='#FFFA'
					placeholderTextColor="#FFF7"
					value={confirmpassword}
					onChangeText={confirmpassword => setConfirmpassword(confirmpassword)}
					secureTextEntry={true}
					autoCapitalize="none"
					placeholder='Confirm Password' />
			</ThemedView>
		</ThemedView>

		<ThemedView style={styles.stepContainer}>
			<ThemedView style={styles.checkboxcontainer}>
				<Checkbox 
					style={styles.checkbox} 
					value={toscheck} 
					onValueChange={setToscheck} />
				<ThemedText>Accept the Terms of Service</ThemedText>
			</ThemedView>
		</ThemedView>

		<ThemedView style={styles.stepContainer}>
			<TouchableHighlight style={styles.button}>
				<ThemedText style={styles.buttonText} type='defaultSemiBold'>Create Account</ThemedText>
			</TouchableHighlight>
		</ThemedView>

		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
		alignItems: 'center'
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
	formInputWrapper: {
		width: '90%',
		height: 55,
		backgroundColor: "#0005",
		borderWidth: 1,
		borderRadius: 6,
		flexDirection: "row",
		alignItems: "center",
		gap: 8
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
		backgroundColor: "#2196F3"
	},
	buttonText: {
		textAlign: 'center',
		padding: 15,
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
