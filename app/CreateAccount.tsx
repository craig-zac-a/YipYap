import { Image, StyleSheet, TextInput, Text, View, Platform, TouchableHighlight, Pressable } from 'react-native';
import React, { useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { Link, useNavigation } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import axios from 'axios';

export default function HomeScreen() {
	const navigation = useNavigation();
	const [email, setEmail] = useState("")
	const [usedemail, setUsedemail] = useState(false)
	const [password, setPassword] = useState("")
	const [restriced, setRestricted] = useState(true)
	const [confirmpassword, setConfirmpassword] = useState("")
	const [verified, setVerified] = useState(true)
	const [toscheck, setToscheck] = useState(false)
	const [invalid, setInvalid] = useState(true)
	const checkFilled = () => {
		restrictPassword();
		verifyPassword();
		setInvalid(false);
		if (email.length == 0) {setInvalid(true)}
		if (!restriced) {setInvalid(true)}
		if (!verified) {setInvalid(true)}
		if (!toscheck) {setInvalid(true)}
	}
	const verifyPassword = () => {
		setVerified(confirmpassword === password);
	}
	const restrictPassword = () => {
		var val = password.length >= 8 && /[a-z]/i.test(password) && /[0-9]/.test(password)
		setRestricted(val);
	}

	const createAccount = async () => {
		try {
			const response = await axios.post(`http://99.32.47.49:3000/users/register`, {email: email, password: password}, {
                headers: {
					'Content-Type': 'application/json',
                },
                timeout: 5000,
            });

			navigation.goBack();
			
		} catch (error) {
			console.error("Error creating account:", error);
			setUsedemail(true);
			setEmail("");
			return [];
		}
	}

	return (
		<Pressable onPress={checkFilled} style={{width: "100%", height: "100%"}}>
			<ParallaxScrollView
				headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
				headerImage={
					<Image
						source={require('@/assets/images/fulllogo.png')}
						style={styles.reactLogo}
					/>
				}>
			

				<ThemedView style={styles.titleContainer}>
					<ThemedText type="title">Create an Account</ThemedText>
				</ThemedView>

				<ThemedView style={styles.stepContainer}>
					<ThemedView style={[styles.formInputWrapper, {backgroundColor: usedemail ? "#D88090" : "#0005"}]}>
						<Octicons name="mail" size={20} color="#FFF7" />
						<TextInput
							style={styles.input}
							cursorColor='#FFFA'
							placeholderTextColor="#FFF7"
							value={email}
							onChangeText={(email) => {setEmail(email); setUsedemail(false); checkFilled();}}
							autoCapitalize="none"
							placeholder={usedemail ? 'Email in use' : 'Email'} />
					</ThemedView>
				</ThemedView>
				<ThemedView style={styles.stepContainer}>
					<ThemedView style={[styles.formInputWrapper, {backgroundColor: restriced ? "#0005" : "#D88090"}]}>
						<Octicons name="shield-lock" size={20} color="#FFF7" />
						<TextInput
							style={styles.input}
							cursorColor='#FFFA'
							placeholderTextColor="#FFF7"
							value={password}
							onChangeText={(password) => {setPassword(password); checkFilled()}}
							secureTextEntry={true}
							autoCapitalize="none"
							placeholder='Password' />
					</ThemedView>
					<ThemedText style={styles.password}>Password must be at least 8 characters long and contain at least 1 letter and 1 number</ThemedText>
				</ThemedView>
				<ThemedView style={styles.stepContainer}>
					<ThemedView style={[styles.formInputWrapper, {backgroundColor: verified ? "#0005" : "#D88090"}]}>
							<Octicons name="shield-lock" size={20} color="#FFF7" />
							<TextInput
								style={styles.input}
								cursorColor='#FFFA'
								placeholderTextColor="#FFF7"
								value={confirmpassword}
								onChangeText={(confirmpassword) => {setConfirmpassword(confirmpassword); checkFilled()}}
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
							onValueChange={(toscheck) => {setToscheck(toscheck); checkFilled()}} />
						<Pressable onPress={() => {setToscheck(!toscheck); checkFilled()}}>
							<ThemedText>Accept the Terms of Service</ThemedText>
						</Pressable>
					</ThemedView>
				</ThemedView>

				<ThemedView style={styles.stepContainer}>
					<Pressable 
					style={({pressed}) => [
						{backgroundColor: pressed ? "#0166D3" : "#2196F3"}, 
						styles.button]} 
						onPress={createAccount}
						disabled={invalid}>
							<ThemedText style={styles.buttonText} type='defaultSemiBold'>Create Account</ThemedText>
					</Pressable>
				</ThemedView>

			</ParallaxScrollView>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	reactLogo: {
		height: 167,
		width: 350,
		bottom: 0,
		left: 0,
		position: 'absolute',
		//alignSelf: 'center',
		//alignContent: 'center',
		marginLeft: 17,
		marginBottom: 20,
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
