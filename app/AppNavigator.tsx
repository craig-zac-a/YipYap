import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import CreateAccount from './CreateAccount';
import Login from './Login';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen 
        name="CreateAccount" 
        component={CreateAccount} 
        options={{
          //headerLeft: () => null
        }} 
      />

      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{
          //headerLeft: () => null
        }} 
      />

    </Stack.Navigator>
  );
}
