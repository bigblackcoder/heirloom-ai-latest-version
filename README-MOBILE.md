# Heirloom Identity - Mobile Apps

This document provides information about the mobile application setup for Heirloom Identity.

## Overview

The Heirloom Identity mobile apps are designed to provide the same secure identity verification experience as the web application, but with native mobile capabilities and optimizations.

## Technology Stack

- **React Native** - Cross-platform framework for building native apps
- **Expo** - Development platform that makes it easier to build React Native apps
- **AsyncStorage** - For local data persistence
- **React Navigation** - For screen navigation
- **Native Camera Integration** - For face verification

## Setup Instructions

### Prerequisites

- Node.js 14+
- Yarn or npm
- XCode (for iOS development)
- Android Studio (for Android development)
- Expo CLI (`npm install -g expo-cli`)

### Getting Started

1. Install dependencies:
   ```
   yarn install
   ```

2. Start the development server:
   ```
   yarn start
   ```

3. Run on a specific platform:
   ```
   yarn ios     # For iOS
   yarn android # For Android
   ```

## Project Structure

- `/App.tsx` - Main application component and navigation setup
- `/app.json` - Expo configuration
- `/ios/` - iOS-specific configuration
- `/android/` - Android-specific configuration
- `/src/screens/` - Screen components
- `/src/components/` - Reusable UI components
- `/src/hooks/` - Custom React hooks
- `/src/services/` - API and service integrations

## Key Features

1. **Biometric Authentication**
   - Face ID (iOS) and Face Unlock (Android) integration
   - Custom face verification using device camera

2. **Identity Capsule Management**
   - Create and manage secure identity capsules
   - Store verified personal data securely on device

3. **AI Service Connections**
   - Connect to third-party AI services with granular permission control
   - Manage active connections and permissions

4. **Secure Data Storage**
   - Encrypted local storage for sensitive information
   - Selective sharing of verified data

## iOS Specific Notes

- Face ID integration requires proper entitlements
- Camera usage requires NSCameraUsageDescription in Info.plist
- Supports iOS 13.0 and above

## Android Specific Notes

- Camera permissions required in AndroidManifest.xml
- Supports Android 6.0 (API level 23) and above
- Face detection uses Google ML Kit on Android

## Building for Production

### iOS
1. Configure App Store Connect
2. Update version numbers
3. Build using:
   ```
   expo build:ios
   ```

### Android
1. Create a signing key
2. Configure Google Play Console
3. Build using:
   ```
   expo build:android
   ```

## Troubleshooting

- **Camera not working**: Ensure proper permissions are granted
- **Face verification fails**: Check lighting conditions and camera focus
- **App crashes on startup**: Verify dependencies are correctly installed