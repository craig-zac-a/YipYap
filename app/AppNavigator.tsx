import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import CreateAccount from './CreateAccount';
import Login from './Login';
import PostFeed from './PostFeed';
import CreatePost from './CreatePost';
import AccountScreen from './AccountScreen'
import ViewPost from './ViewPost';
import SavedPosts from './SavedPosts';
import { Image } from 'react-native';

const Stack = createStackNavigator();

function LogoTitle() {
  return (
    <Image
      style={{ width: 75, height: 36 }}
      source={require('@/assets/images/fulllogo.png')}
    />
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen
        name="CreateAccount"
        component={CreateAccount}
        options={{
          //headerLeft: () => null
          headerTitle: 'Create an Account'
        }}
      />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          //headerLeft: () => null
          headerTitle: 'Login'
        }}
      />

      <Stack.Screen
        name="PostFeed"
        component={PostFeed}
        options={{
          headerLeft: () => null,
          headerTitle: () => <LogoTitle />
        }}
      />

      <Stack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{
          //headerLeft: () => null,
          headerTitle: () => <LogoTitle />
        }}
      />

      <Stack.Screen
        name="CreatePost"
        component={CreatePost}
        options={{
          //headerLeft: () => null,
          headerTitle: 'Create a Post'
        }}
      />

      <Stack.Screen
        name="ViewPost"
        component={ViewPost}
        options={{
          //headerLeft: () => null,
          headerTitle: 'View Post'
        }}
      />
      
      <Stack.Screen
        name="SavedPosts"
        component={SavedPosts}
        options={{
          //headerLeft: () => null,
          headerTitle: 'Saved Posts'
        }}
      />

    </Stack.Navigator>
  );
}
