# Heirloom Identity Platform Mobile Integration Guide

## Overview

This guide provides instructions for integrating the Heirloom Identity Platform with a React Native mobile application. The integration enables face verification, identity management, and AI service connections in cross-platform mobile apps.

## Prerequisites

- React Native 0.71.0 or later
- Expo SDK 48 or later (if using Expo)
- iOS 14+ and Android 9+ target platforms
- Access to the Heirloom Identity Platform API

## Installation

### 1. Install Required Dependencies

Add the following packages to your React Native project:

- `@react-native-camera/camera` - For camera access
- `react-native-vision-camera` - Advanced camera controls
- `react-native-reanimated` - For fluid animations
- `@react-native-async-storage/async-storage` - For local storage
- `axios` - For API communication

### 2. iOS Configuration

Update your `Info.plist` to include camera permissions:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to verify your identity</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for video authentication</string>
```

### 3. Android Configuration

Update your `AndroidManifest.xml` to include camera permissions:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Implementation Guide

### 1. Face Verification Component

Create a `FaceVerification` component to handle camera capture and API integration:

```jsx
import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';
import axios from 'axios';

const API_URL = 'https://your-api-domain.com/api';

export const FaceVerification = ({ onVerificationComplete }) => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.front;
  
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  // Animated values for the face detection overlay
  const facePositionX = useSharedValue(0);
  const facePositionY = useSharedValue(0);
  const faceWidth = useSharedValue(0);
  const faceHeight = useSharedValue(0);

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    const permission = await Camera.requestCameraPermission();
    setHasPermission(permission === 'authorized');
  }, []);

  // Take picture and verify
  const takePicture = useCallback(async () => {
    if (camera.current) {
      try {
        setIsCapturing(true);
        setVerificationStatus('Capturing image...');
        
        // Take a photo with the camera
        const photo = await camera.current.takePhoto({
          qualityPrioritization: 'speed',
          flash: 'off',
          enableShutterSound: false
        });
        
        setVerificationStatus('Processing image...');
        
        // Convert image to base64
        const imageBase64 = await convertImageToBase64(photo.path);
        
        // Send to verification API
        const result = await verifyFace(imageBase64);
        
        if (result.success && result.verified) {
          setVerificationStatus(`Verified with ${result.confidence.toFixed(1)}% confidence`);
          onVerificationComplete(true, result);
        } else {
          setVerificationStatus(result.message || 'Verification failed');
          onVerificationComplete(false, result);
        }
      } catch (error) {
        setVerificationStatus(`Error: ${error.message}`);
        onVerificationComplete(false, { success: false, message: error.message });
      } finally {
        setIsCapturing(false);
      }
    }
  }, [onVerificationComplete]);

  // Convert image to base64
  const convertImageToBase64 = async (imagePath) => {
    // Implementation will vary based on your React Native setup
    // This is a placeholder for the conversion process
    return 'base64-encoded-image-data';
  };

  // Call verification API
  const verifyFace = async (imageBase64) => {
    try {
      const response = await axios.post(`${API_URL}/verification/face`, {
        image: imageBase64,
        saveToDb: true
      });
      
      return response.data;
    } catch (error) {
      console.error('Error during face verification:', error);
      return {
        success: false,
        message: 'Connection error during verification',
        confidence: 0
      };
    }
  };
  
  // Request permissions on component mount
  React.useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />
      
      <View style={styles.overlay}>
        <View style={styles.guideFrame} />
        
        <Text style={styles.instruction}>
          Position your face in the frame
        </Text>
        
        <Text style={styles.status}>
          {verificationStatus}
        </Text>
        
        {!isCapturing ? (
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        ) : (
          <ActivityIndicator size="large" color="#FFFFFF" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  guideFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 125,
    marginTop: 100,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  status: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
```

### 2. AI Connection Component

Create a component to manage AI service connections:

```jsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Switch,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://your-api-domain.com/api';

// AI service definitions with logos
const availableServices = [
  { 
    id: 'claude', 
    name: 'Claude', 
    provider: 'Anthropic',
    logo: require('../assets/claude-color.png') 
  },
  { 
    id: 'gemini', 
    name: 'Gemini', 
    provider: 'Google',
    logo: require('../assets/gemini-color.png') 
  },
  { 
    id: 'gpt', 
    name: 'ChatGPT', 
    provider: 'OpenAI',
    logo: require('../assets/openai-logo.png') 
  },
  { 
    id: 'copilot', 
    name: 'Copilot', 
    provider: 'Microsoft',
    logo: require('../assets/copilot-logo.png') 
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    provider: 'Perplexity AI',
    logo: require('../assets/perplexity-logo.png') 
  }
];

export const AIConnectionsScreen = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data sharing preferences
  const [sharePreferences, setSharePreferences] = useState({
    name: true,
    age: true,
    gender: false,
    verification_status: true
  });
  
  // Selected service for connection
  const [selectedService, setSelectedService] = useState(null);
  
  // Fetch user connections
  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/connections`, {
        withCredentials: true
      });
      
      setConnections(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new connection
  const createConnection = async () => {
    if (!selectedService) return;
    
    try {
      setLoading(true);
      
      const connectionData = {
        aiServiceName: selectedService.name,
        aiServiceId: `${selectedService.id}-${Date.now()}`,
        sharedData: sharePreferences
      };
      
      const response = await axios.post(
        `${API_URL}/connections`,
        connectionData,
        { withCredentials: true }
      );
      
      // Add new connection to the list
      setConnections([...connections, response.data]);
      
      // Reset selected service
      setSelectedService(null);
    } catch (err) {
      setError(err.message || 'Failed to create connection');
    } finally {
      setLoading(false);
    }
  };
  
  // Revoke a connection
  const revokeConnection = async (connectionId) => {
    try {
      setLoading(true);
      
      await axios.patch(
        `${API_URL}/connections/${connectionId}/revoke`,
        {},
        { withCredentials: true }
      );
      
      // Update connection status in the list
      setConnections(connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, isActive: false } 
          : conn
      ));
    } catch (err) {
      setError(err.message || 'Failed to revoke connection');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle data sharing preference
  const toggleDataPreference = (key) => {
    setSharePreferences({
      ...sharePreferences,
      [key]: !sharePreferences[key]
    });
  };
  
  // Load connections when component mounts
  useEffect(() => {
    fetchConnections();
  }, []);
  
  // Render each connection item
  const renderConnection = ({ item }) => (
    <View style={styles.connectionItem}>
      <Image 
        source={availableServices.find(s => s.name === item.aiServiceName)?.logo} 
        style={styles.serviceLogo} 
      />
      
      <View style={styles.connectionInfo}>
        <Text style={styles.serviceName}>{item.aiServiceName}</Text>
        <Text style={styles.serviceDetail}>
          {item.isActive ? 'Active' : 'Revoked'} · Last used: {
            item.lastConnected 
              ? new Date(item.lastConnected).toLocaleDateString() 
              : 'Never'
          }
        </Text>
      </View>
      
      {item.isActive && (
        <TouchableOpacity 
          style={styles.revokeButton}
          onPress={() => revokeConnection(item.id)}
        >
          <Text style={styles.revokeText}>Revoke</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Render each available service
  const renderAvailableService = ({ item }) => {
    const isConnected = connections.some(
      conn => conn.aiServiceName === item.name && conn.isActive
    );
    
    return (
      <TouchableOpacity 
        style={[
          styles.serviceCard,
          selectedService?.id === item.id && styles.selectedServiceCard
        ]}
        onPress={() => setSelectedService(item)}
        disabled={isConnected}
      >
        <Image source={item.logo} style={styles.serviceCardLogo} />
        <Text style={styles.serviceCardName}>{item.name}</Text>
        <Text style={styles.serviceCardProvider}>{item.provider}</Text>
        
        {isConnected && (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Connections</Text>
      
      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchConnections}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!loading && !error && (
        <>
          {connections.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Your Connections</Text>
              <FlatList
                data={connections}
                renderItem={renderConnection}
                keyExtractor={(item) => item.id.toString()}
                style={styles.connectionsList}
              />
            </>
          ) : (
            <Text style={styles.emptyText}>No active connections</Text>
          )}
          
          <Text style={styles.sectionTitle}>Available Services</Text>
          <FlatList
            data={availableServices}
            renderItem={renderAvailableService}
            keyExtractor={(item) => item.id}
            horizontal
            style={styles.servicesList}
            showsHorizontalScrollIndicator={false}
          />
          
          {selectedService && (
            <View style={styles.connectionForm}>
              <Text style={styles.formTitle}>
                Connect to {selectedService.name}
              </Text>
              
              <Text style={styles.formSubtitle}>
                Choose what information to share:
              </Text>
              
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Full Name</Text>
                <Switch
                  value={sharePreferences.name}
                  onValueChange={() => toggleDataPreference('name')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={sharePreferences.name ? '#007AFF' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Age</Text>
                <Switch
                  value={sharePreferences.age}
                  onValueChange={() => toggleDataPreference('age')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={sharePreferences.age ? '#007AFF' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Gender</Text>
                <Switch
                  value={sharePreferences.gender}
                  onValueChange={() => toggleDataPreference('gender')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={sharePreferences.gender ? '#007AFF' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Verification Status</Text>
                <Switch
                  value={sharePreferences.verification_status}
                  onValueChange={() => toggleDataPreference('verification_status')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={sharePreferences.verification_status ? '#007AFF' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setSelectedService(null)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={createConnection}
                >
                  <Text style={styles.connectText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  connectionsList: {
    marginBottom: 16,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  connectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serviceDetail: {
    fontSize: 14,
    color: '#666',
  },
  revokeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  revokeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesList: {
    marginBottom: 16,
  },
  serviceCard: {
    width: 120,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedServiceCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  serviceCardLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  serviceCardName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  serviceCardProvider: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  connectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34C759',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  connectedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  connectionForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#333',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

### 3. API Service Integration

Create a service for API communication:

```jsx
// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://your-api-domain.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth service
export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  },
  
  // Log in existing user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  },
  
  // Log out
  logout: async () => {
    await api.post('/auth/logout');
    await AsyncStorage.removeItem('authToken');
  },
  
  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Face verification service
export const faceService = {
  // Verify a face
  verifyFace: async (imageBase64, saveToDb = false) => {
    const response = await api.post('/verification/face', {
      image: imageBase64,
      saveToDb
    });
    return response.data;
  },
};

// AI connection service
export const connectionService = {
  // Get user connections
  getConnections: async () => {
    const response = await api.get('/connections');
    return response.data;
  },
  
  // Create a new connection
  createConnection: async (connectionData) => {
    const response = await api.post('/connections', connectionData);
    return response.data;
  },
  
  // Revoke a connection
  revokeConnection: async (connectionId) => {
    const response = await api.patch(`/connections/${connectionId}/revoke`);
    return response.data;
  },
};

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

## Native Module Integration

For better performance and deeper device integration, consider implementing native modules:

### iOS Swift Native Module (FaceVerificationModule.swift)

```swift
import Foundation
import AVFoundation
import Vision

@objc(FaceVerificationModule)
class FaceVerificationModule: NSObject {
  
  @objc func detectFace(_ imageBase64: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Convert base64 to UIImage
    guard let imageData = Data(base64Encoded: imageBase64, options: .ignoreUnknownCharacters),
          let image = UIImage(data: imageData),
          let cgImage = image.cgImage else {
      rejecter("ERROR", "Invalid image data", nil)
      return
    }
    
    // Create request
    let request = VNDetectFaceRectanglesRequest { (request, error) in
      if let error = error {
        rejecter("ERROR", "Face detection failed: \(error.localizedDescription)", error)
        return
      }
      
      guard let observations = request.results as? [VNFaceObservation] else {
        resolver(["found": false, "faces": 0])
        return
      }
      
      // Return results
      resolver([
        "found": !observations.isEmpty,
        "faces": observations.count,
        "results": observations.map { face in
          return [
            "boundingBox": [
              "x": face.boundingBox.origin.x,
              "y": face.boundingBox.origin.y,
              "width": face.boundingBox.size.width,
              "height": face.boundingBox.size.height
            ],
            "roll": face.roll?.doubleValue ?? 0,
            "yaw": face.yaw?.doubleValue ?? 0
          ]
        }
      ])
    }
    
    // Execute request
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    do {
      try handler.perform([request])
    } catch {
      rejecter("ERROR", "Vision request failed: \(error.localizedDescription)", error)
    }
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
```

### Android Java Native Module (FaceVerificationModule.java)

```java
package com.yourapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;

import java.util.List;

public class FaceVerificationModule extends ReactContextBaseJavaModule {
    
    public FaceVerificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    
    @Override
    public String getName() {
        return "FaceVerificationModule";
    }
    
    @ReactMethod
    public void detectFace(String imageBase64, final Promise promise) {
        try {
            // Convert base64 to bitmap
            byte[] decodedString = Base64.decode(imageBase64, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            
            // Configure face detector
            FaceDetectorOptions options = new FaceDetectorOptions.Builder()
                    .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
                    .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
                    .build();
            
            // Create detector
            FaceDetector detector = FaceDetection.getClient(options);
            
            // Process image
            InputImage image = InputImage.fromBitmap(bitmap, 0);
            
            detector.process(image)
                    .addOnSuccessListener(new OnSuccessListener<List<Face>>() {
                        @Override
                        public void onSuccess(List<Face> faces) {
                            WritableMap result = Arguments.createMap();
                            result.putBoolean("found", !faces.isEmpty());
                            result.putInt("faces", faces.size());
                            
                            WritableArray facesArray = Arguments.createArray();
                            for (Face face : faces) {
                                WritableMap faceMap = Arguments.createMap();
                                
                                // Bounding box
                                WritableMap boundingBox = Arguments.createMap();
                                boundingBox.putDouble("x", face.getBoundingBox().left);
                                boundingBox.putDouble("y", face.getBoundingBox().top);
                                boundingBox.putDouble("width", face.getBoundingBox().width());
                                boundingBox.putDouble("height", face.getBoundingBox().height());
                                faceMap.putMap("boundingBox", boundingBox);
                                
                                // Face properties
                                if (face.getHeadEulerAngleY() != null) {
                                    faceMap.putDouble("yaw", face.getHeadEulerAngleY());
                                }
                                if (face.getHeadEulerAngleZ() != null) {
                                    faceMap.putDouble("roll", face.getHeadEulerAngleZ());
                                }
                                
                                // Smile probability
                                if (face.getSmilingProbability() != null) {
                                    faceMap.putDouble("smileProbability", face.getSmilingProbability());
                                }
                                
                                facesArray.pushMap(faceMap);
                            }
                            
                            result.putArray("results", facesArray);
                            promise.resolve(result);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            promise.reject("FACE_DETECTION_ERROR", e.getMessage(), e);
                        }
                    });
        } catch (Exception e) {
            promise.reject("UNEXPECTED_ERROR", e.getMessage(), e);
        }
    }
}
```

## Best Practices

1. **Security**:
   - Always use HTTPS for API communication
   - Implement token-based authentication
   - Store sensitive data in the keychain/keystore
   - Never store raw face images, only processed templates

2. **Performance**:
   - Optimize image size before sending to the API
   - Use hardware acceleration for camera processing
   - Implement proper error handling and retry mechanisms
   - Use native modules for compute-intensive tasks

3. **User Experience**:
   - Provide clear instructions during face capturing
   - Show real-time feedback for face positioning
   - Implement progress indicators for network operations
   - Design for accessibility

4. **Error Handling**:
   - Implement graceful degradation
   - Provide clear error messages
   - Offer retry options for network failures
   - Fallback methods when face verification isn't available

## Advanced Integration

For production apps, consider these advanced integration options:

1. **Biometric Authentication**:
   Integrate with the device's biometric system for additional security:
   
   ```jsx
   import * as LocalAuthentication from 'expo-local-authentication';
   
   // Check if biometrics is available
   const checkBiometrics = async () => {
     const compatible = await LocalAuthentication.hasHardwareAsync();
     if (!compatible) {
       return false;
     }
     
     const enrolled = await LocalAuthentication.isEnrolledAsync();
     return enrolled;
   };
   
   // Authenticate with biometrics
   const authenticateWithBiometrics = async () => {
     const result = await LocalAuthentication.authenticateAsync({
       promptMessage: 'Authenticate to verify your identity',
       fallbackLabel: 'Use password'
     });
     
     return result.success;
   };
   ```

2. **Offline Mode**:
   Implement secure offline verification when the server is unavailable:
   
   ```jsx
   import { FaceDetector } from 'expo-face-detector';
   
   // Basic offline verification
   const performOfflineVerification = async (image) => {
     const options = { mode: FaceDetector.Constants.Mode.fast };
     const result = await FaceDetector.detectFacesAsync(image, options);
     
     // Ensure exactly one face is detected
     if (result.faces.length !== 1) {
       return { 
         success: false, 
         message: `Expected 1 face, found ${result.faces.length}` 
       };
     }
     
     // Check face is properly positioned and sized
     const face = result.faces[0];
     const { bounds } = face;
     
     const imageWidth = image.width;
     const imageHeight = image.height;
     
     // Face should take up at least 20% of image
     const faceArea = bounds.size.width * bounds.size.height;
     const imageArea = imageWidth * imageHeight;
     const faceRatio = faceArea / imageArea;
     
     if (faceRatio < 0.2) {
       return { 
         success: false, 
         message: 'Face too small or too far away' 
       };
     }
     
     return { 
       success: true, 
       message: 'Face detected',
       confidence: 70, // Conservative estimate
       results: {
         boundingBox: bounds,
         faceAngle: face.rollAngle
       }
     };
   };
   ```

## Example App Integration

Complete app integration example:

```jsx
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AIConnectionsScreen from './src/screens/AIConnectionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Authentication context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

// Main app navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is signed in
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="AIConnections" component={AIConnectionsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          // User is not signed in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Root component wrapping the app with providers
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

## Troubleshooting

Common issues and solutions:

1. **Camera Permission Issues**:
   - Ensure proper permissions in Info.plist and AndroidManifest.xml
   - Check runtime permission requests are handled correctly
   - Verify camera hardware access works in other apps

2. **Face Detection Problems**:
   - Try different lighting conditions
   - Ensure adequate face size in the frame
   - Test with different devices
   - Verify the API connection is working

3. **Performance Issues**:
   - Reduce image resolution before sending
   - Implement debouncing for continuous detection
   - Profile and optimize render cycles

4. **API Connection Failures**:
   - Verify network connectivity
   - Check authentication tokens
   - Implement proper error handling
   - Log detailed error information
