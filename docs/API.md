# Heirloom Identity Platform API Documentation

## Overview

This document provides comprehensive documentation for all available API endpoints in the Heirloom Identity Platform. These endpoints can be used to integrate the platform with other systems or to implement custom clients.

## Base URL

All API endpoints are relative to your base server URL:

```
https://your-domain.example.com/api
```

## Authentication

Most endpoints require authentication. The platform uses session-based authentication.

- After successful login, your session is maintained via cookies
- Include cookies in all subsequent requests
- Unauthorized requests will return 401 status code

## Response Format

All API responses are in JSON format with a standard structure:

For successful responses:
```json
{
  "message": "Optional success message",
  "data": { ... } // Response data varies by endpoint
}
```

For error responses:
```json
{
  "message": "Error description",
  "errors": [ ... ] // Optional detailed validation errors 
}
```

## API Endpoints

### Authentication

#### Register User

Creates a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "username": "string",
      "firstName": "string",
      "lastName": "string",
      "isVerified": false,
      "memberSince": "timestamp",
      "avatar": "string | null"
    }
  }
  ```
- **Status Codes**:
  - `201 Created`: User successfully registered
  - `400 Bad Request`: Invalid input
  - `500 Internal Server Error`: Server error

#### Login

Authenticates a user and creates a session.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "username": "string",
      "firstName": "string",
      "lastName": "string",
      "isVerified": false,
      "memberSince": "timestamp",
      "avatar": "string | null"
    }
  }
  ```
- **Status Codes**:
  - `200 OK`: Login successful
  - `400 Bad Request`: Missing username or password
  - `401 Unauthorized`: Invalid credentials
  - `500 Internal Server Error`: Server error

#### Logout

Ends the current user session.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Response**: 
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Status Codes**:
  - `200 OK`: Logout successful

#### Get Current User

Retrieves the currently authenticated user's information.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Response**: 
  ```json
  {
    "id": 1,
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "isVerified": false,
    "memberSince": "timestamp",
    "avatar": "string | null"
  }
  ```
- **Status Codes**:
  - `200 OK`: User details retrieved
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: User not found
  - `500 Internal Server Error`: Server error

### Face Verification

#### Verify Face

Performs face verification and optionally saves the face to the database.

- **URL**: `/verification/face`
- **Method**: `POST`
- **Authentication Required**: Yes (for production; testing may allow unauthenticated requests)
- **Request Body**:
  ```json
  {
    "image": "base64-encoded image data",
    "saveToDb": false,
    "useBasicDetection": false,
    "checkDbOnly": false
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Face verification successful",
    "verified": true,
    "confidence": 95.5,
    "matched": false,
    "face_id": "unique-face-id",
    "results": {
      "age": 30,
      "gender": "Woman",
      "dominant_race": "asian",
      "dominant_emotion": "neutral"
    }
  }
  ```
- **Status Codes**:
  - `200 OK`: Request processed (check `success` field for verification result)
  - `500 Internal Server Error`: Server error

### Identity Capsules

#### Get User Capsules

Retrieves all identity capsules for the authenticated user.

- **URL**: `/capsules`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Response**: 
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "name": "Primary",
      "description": "Your primary identity capsule",
      "isActive": true,
      "createdAt": "timestamp"
    }
  ]
  ```
- **Status Codes**:
  - `200 OK`: Capsules retrieved
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Server error

#### Create Capsule

Creates a new identity capsule for the authenticated user.

- **URL**: `/capsules`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "id": 1,
    "userId": 1,
    "name": "string",
    "description": "string",
    "isActive": true,
    "createdAt": "timestamp"
  }
  ```
- **Status Codes**:
  - `201 Created`: Capsule created
  - `400 Bad Request`: Invalid input
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Server error

#### Get Capsule Data

Retrieves all verified data for a specific identity capsule.

- **URL**: `/capsules/:id/data`
- **Method**: `GET`
- **Authentication Required**: Yes
- **URL Parameters**:
  - `id`: Capsule ID
- **Response**: 
  ```json
  [
    {
      "id": 1,
      "capsuleId": 1,
      "dataType": "string",
      "value": "string",
      "isVerified": true,
      "verificationMethod": "string",
      "issuanceDate": "timestamp",
      "verifiedAt": "timestamp",
      "createdAt": "timestamp"
    }
  ]
  ```
- **Status Codes**:
  - `200 OK`: Data retrieved
  - `401 Unauthorized`: Not authenticated
  - `403 Forbidden`: Access denied
  - `500 Internal Server Error`: Server error

#### Add Capsule Data

Adds new verified data to a specific identity capsule.

- **URL**: `/capsules/:id/data`
- **Method**: `POST`
- **Authentication Required**: Yes
- **URL Parameters**:
  - `id`: Capsule ID
- **Request Body**:
  ```json
  {
    "dataType": "string",
    "value": "string",
    "verificationMethod": "string",
    "issuanceDate": "timestamp"
  }
  ```
- **Response**: 
  ```json
  {
    "id": 1,
    "capsuleId": 1,
    "dataType": "string",
    "value": "string",
    "isVerified": true,
    "verificationMethod": "string",
    "issuanceDate": "timestamp",
    "verifiedAt": "timestamp",
    "createdAt": "timestamp"
  }
  ```
- **Status Codes**:
  - `201 Created`: Data added
  - `400 Bad Request`: Invalid input
  - `401 Unauthorized`: Not authenticated
  - `403 Forbidden`: Access denied
  - `500 Internal Server Error`: Server error

### AI Connections

#### Get User Connections

Retrieves all AI connections for the authenticated user.

- **URL**: `/connections`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Response**: 
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "aiServiceName": "string",
      "aiServiceId": "string",
      "isActive": true,
      "sharedData": { ... },
      "createdAt": "timestamp",
      "lastConnected": "timestamp"
    }
  ]
  ```
- **Status Codes**:
  - `200 OK`: Connections retrieved
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Server error

#### Create Connection

Creates a new AI connection for the authenticated user.

- **URL**: `/connections`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "aiServiceName": "string",
    "aiServiceId": "string",
    "sharedData": { ... }
  }
  ```
- **Response**: 
  ```json
  {
    "id": 1,
    "userId": 1,
    "aiServiceName": "string",
    "aiServiceId": "string",
    "isActive": true,
    "sharedData": { ... },
    "createdAt": "timestamp",
    "lastConnected": "timestamp"
  }
  ```
- **Status Codes**:
  - `201 Created`: Connection created
  - `400 Bad Request`: Invalid input
  - `401 Unauthorized`: Not authenticated
  - `403 Forbidden`: User not verified
  - `500 Internal Server Error`: Server error

#### Revoke Connection

Revokes an existing AI connection.

- **URL**: `/connections/:id/revoke`
- **Method**: `PATCH`
- **Authentication Required**: Yes
- **URL Parameters**:
  - `id`: Connection ID
- **Response**: 
  ```json
  {
    "id": 1,
    "userId": 1,
    "aiServiceName": "string",
    "aiServiceId": "string",
    "isActive": false,
    "sharedData": { ... },
    "createdAt": "timestamp",
    "lastConnected": "timestamp"
  }
  ```
- **Status Codes**:
  - `200 OK`: Connection revoked
  - `401 Unauthorized`: Not authenticated
  - `403 Forbidden`: Access denied
  - `500 Internal Server Error`: Server error

### Activities

#### Get User Activities

Retrieves all activities for the authenticated user.

- **URL**: `/activities`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Response**: 
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "type": "string",
      "description": "string",
      "metadata": { ... },
      "createdAt": "timestamp"
    }
  ]
  ```
- **Status Codes**:
  - `200 OK`: Activities retrieved
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Server error

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - The resource was successfully created |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - User lacks permission |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server-side error |

## Data Models

### User

```typescript
{
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  memberSince: Date;
  avatar: string | null;
}
```

### Identity Capsule

```typescript
{
  id: number;
  userId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}
```

### Verified Data

```typescript
{
  id: number;
  capsuleId: number;
  dataType: string;
  value: string;
  isVerified: boolean;
  verificationMethod: string | null;
  issuanceDate: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
}
```

### AI Connection

```typescript
{
  id: number;
  userId: number;
  aiServiceName: string;
  aiServiceId: string;
  isActive: boolean;
  sharedData: Record<string, any> | null;
  createdAt: Date;
  lastConnected: Date | null;
}
```

### Activity

```typescript
{
  id: number;
  userId: number;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
}
```

## API Examples

### Example 1: Register a new user

```bash
curl -X POST https://your-domain.example.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Example 2: Verify a face

```bash
curl -X POST https://your-domain.example.com/api/verification/face \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64-encoded-image-data",
    "saveToDb": true
  }'
```

### Example 3: Create an AI connection

```bash
curl -X POST https://your-domain.example.com/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "aiServiceName": "Claude",
    "aiServiceId": "claude-connection-1",
    "sharedData": {
      "name": true,
      "age": true
    }
  }'
```
