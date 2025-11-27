import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ListScreen from '../screens/ListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ResultScreen from '../screens/ResultScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.cardBg,
                    },
                    headerTintColor: colors.textPrimary,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: colors.bgColor,
                    }
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="List"
                    component={ListScreen}
                    options={{ title: 'Zoek een Product' }}
                />
                <Stack.Screen
                    name="Favorites"
                    component={FavoritesScreen}
                    options={{ title: 'Mijn Favorieten' }}
                />
                <Stack.Screen
                    name="Result"
                    component={ResultScreen}
                    options={{ title: 'Resultaat', headerBackTitle: 'Terug' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
