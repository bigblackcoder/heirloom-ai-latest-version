
# Native Device Biometrics Integration

This document outlines how Heirloom Identity Platform integrates with native device biometric systems like Apple's Face ID and Google's biometrics.

## Overview

Heirloom uses a hybrid approach to biometric verification:

1. **Primary Method**: Device-native biometrics (when available)
2. **Secondary Method**: Custom face verification with DeepFace
3. **Fallback**: Basic JavaScript-based face detection

## Native Biometrics Implementation

The platform uses the Web Authentication API (WebAuthn) to integrate with platform authenticators, which typically use the device's biometric system.

### Supported Biometric Types

- **Apple Face ID**: On iOS devices with Face ID hardware
- **Apple Touch ID**: On iOS devices with Touch ID hardware
- **Android Fingerprint**: On Android devices with fingerprint sensors
- **Android Face Authentication**: On Android devices with face recognition

### Implementation Details

The integration primarily uses:

1. `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` to check if native biometrics are available
2. `navigator.credentials.create()` with `authenticatorSelection.authenticatorAttachment = "platform"` to request platform authentication 
3. `userVerification: "required"` to ensure the biometric system is used

## Security Considerations

Native biometrics offer several key advantages:

1. **Hardware-Level Security**: The biometric data never leaves the secure hardware enclave
2. **No Biometric Data Storage**: We never store or transmit actual biometric data
3. **Anti-Spoofing Measures**: Native implementations include sophisticated anti-spoofing techniques
4. **Reduced Liability**: Using the OS-level APIs reduces our liability surface

## Web/Mobile Differences

### Web Implementation
- Uses WebAuthn API to trigger native biometrics
- Limited to what browsers and OS exposepport
- May fall back to camera-based verification more often

### Mobile Implementation (React Native)
- iOS: Uses `LocalAuthentication` framework
- Android: Uses Biometric API
- Higher integration level with native biometric systems
- Can store non-sensitive authentication results securely in keychain/keystore

## Configuration

Settings are available in the user preferences:

1. **Prefer Native Biometrics**: Use device biometrics when available
2. **Require Native Biometrics**: Only allow native biometrics (disables fallbacks)
3. **Verification Strength**: Configure security level of biometric verification

## Testing Considerations

When testing the native biometrics implementation:

1. **Device Testing**: Always test on actual devices with biometric hardware
2. **Simulator Limitations**: iOS/Android simulators have limited biometric simulation
3. **Browser Support**: Different browsers support WebAuthn to varying degrees

## Fallback Strategy

When native biometrics are unavailable, the fallback sequence is:

1. Try native biometrics (Face ID, Touch ID, etc.)
2. If unavailable or fails, use camera-based face verification
3. If camera unavailable, offer alternative authentication methods

## References

- [WebAuthn Standard](https://www.w3.org/TR/webauthn/)
- [Apple Face ID Security](https://support.apple.com/guide/security/face-id-touch-id-passcodes-secad90ca501/web)
- [Android Biometric Security](https://source.android.com/security/biometric)
