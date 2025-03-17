import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, SafeAreaView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
// These would be converted from our web components
const Home = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.title}>Heirloom Identity</Text>
    <Text style={styles.subtitle}>Secure Identity Verification</Text>
  </SafeAreaView>
);

const Verification = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.title}>Face Verification</Text>
  </SafeAreaView>
);

const Dashboard = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.title}>Dashboard</Text>
  </SafeAreaView>
);

const Capsule = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.title}>Identity Capsule</Text>
  </SafeAreaView>
);

const Notifications = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.title}>Notifications</Text>
  </SafeAreaView>
);

const Profile = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.title}>Profile</Text>
  </SafeAreaView>
);

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: '#767676',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={[styles.tabIcon, { backgroundColor: color + '20' }]}>
              <Text style={{ color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Capsule" 
        component={Capsule}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={[styles.tabIcon, { backgroundColor: color + '20' }]}>
              <Text style={{ color }}>🔐</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={Notifications}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={[styles.tabIcon, { backgroundColor: color + '20' }]}>
              <Text style={{ color }}>🔔</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={[styles.tabIcon, { backgroundColor: color + '20' }]}>
              <Text style={{ color }}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.log('Failed to fetch auth token');
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#f9f9f9',
          },
        }}
      >
        {isAuthenticated ? (
          // Authenticated user flows
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          // Authentication flows
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen 
              name="Verification" 
              component={Verification}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#143404',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d4d4d4',
    marginBottom: 24,
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});