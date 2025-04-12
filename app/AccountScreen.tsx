import React, { useState, useEffect, Children } from 'react';
import { Image, StyleSheet, View, Button, Switch, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { TextInput } from 'react-native-gesture-handler';

export default function AccountScreen({ navigation }: any)
{
    const [currentTab, setCurrentTab] = useState('Account');
    const [accountInfo, setAccountInfo] = useState<AccountInfo>({} as AccountInfo);
    const [changeEmailModalVisible, setChangeEmailModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const tabs: {[key: string]: () => JSX.Element} = {};

    interface AccountInfo {
        email: string;
        password_hash: string;
    }

    useEffect(() => {
        getAccountInfo();
    }, []);


    const getAccountInfo = async () => {
        // const 
        const authToken = await SecureStore.getItemAsync('authToken');

        try
        {
            const response = await axios.get(`http://99.32.47.49:3000/users/me`, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            })
            setAccountInfo(response.data);
        }
        catch (error)
        {
            console.error("Error getting account info:", error);
        }
    };

    const updateUserEmail = async () => {
        const authToken = await SecureStore.getItemAsync('authToken');

        try
        {
            const response = await axios.put(`http://99.32.47.49:3000/users/me/email`, {email: email}, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
        }
        catch (error)
        {
            console.error("Error updating email:", error);
        }
        finally
        {
            setChangeEmailModalVisible(false);
            setEmail('');
            getAccountInfo();
        }
    };

    const updateUserPassword = async () => {
        const authToken = await SecureStore.getItemAsync('authToken');

        try
        {
            const response = await axios.put(`http://99.32.47.49:3000/users/me/password`, {password: password}, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
        }
        catch (error)
        {
            console.error("Error updating password:", error);
        }
        finally
        {
            setChangePasswordModalVisible(false);
            setPassword('');
            getAccountInfo();
        }
    };



    const navBar = () => {
        return (
            <View style={styles.tabNagivators}>
                <Button title='Account' onPress={() => setCurrentTab('Account')}></Button>
                <Button title='Notifications' onPress={() => setCurrentTab('Notifications')}></Button>
                <Button title='Security' onPress={() => setCurrentTab('Security')}></Button>
            </View>
        );
    };

    tabs['Account'] = () => {
        return (
            <View>
                <View style={styles.centerView}>
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={changeEmailModalVisible}
                        onRequestClose={() => setChangeEmailModalVisible(!changeEmailModalVisible)}
                    >
                        <View style={styles.centerView}>
                            <View style={styles.modal}>
                                <TextInput
                                    placeholder='New Email'
                                    value={email}
                                    onChangeText={(email) => {setEmail(email)}}
                                    autoCapitalize='none'
                                    style={styles.modalInput}
                                />
                                <Button title='Submit' onPress={() => updateUserEmail()} />
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={changePasswordModalVisible}
                        onRequestClose={() => setChangePasswordModalVisible(!changePasswordModalVisible)}
                    >
                        <View style={styles.centerView}>
                            <View style={styles.modal}>
                                <TextInput
                                    placeholder='New Password'
                                    value={password}
                                    onChangeText={(password) => {setPassword(password)}}
                                    autoCapitalize='none'
                                    style={styles.modalInput}
                                />
                                <Button title='Submit' onPress={() => updateUserPassword()} />
                            </View>
                        </View>
                    </Modal>

                </View>
                <View style={styles.rowContainer}>
                    <ThemedText>{accountInfo.email}</ThemedText>
                    <Button title='Change Email' onPress={() => setChangeEmailModalVisible(!changeEmailModalVisible)} />
                </View>

                <View style={styles.rowContainer}>
                    <Button title='Change Password' onPress={() => setChangePasswordModalVisible(!changePasswordModalVisible)} />
                </View>
                
            </View>
        );
    };

    tabs['Notifications'] = () => {
        return (
            <View>
                
            </View>
        );
    };

    tabs['Security'] = () => {
        return (
            <View>
                
            </View>
        );
    };

    return (
        <View>
            {navBar()}

            {tabs[currentTab]()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        height: '100%',
    },
    reactLogo: {
        height: 178,
        width: 290,
        marginBottom: 40,
    },
    height100: {
        height: '100%',
    },
    tabNagivators: {
        position: 'fixed',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
        paddingBottom: 5,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
    centerView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: '15%',
        paddingHorizontal: '35%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: 
        {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalInput: {
        height: 40,
        width: '90%',
        borderColor: 'gray',
        borderWidth: 1,
        color: 'black',
        marginBottom: 10,
    },
});
