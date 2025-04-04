# AI Service Connection API Integration Guide

## Overview

The Heirloom Identity Platform provides a secure way to connect verified user identities with AI services. This guide details how to integrate with the AI connection system to enable authorized data sharing between users and AI services.

## Prerequisites

Before integrating with the AI Connection API:

1. Users must have verified their identity using face verification
2. The client application must authenticate users via the authentication API
3. The AI service must be registered in the Heirloom platform

## Available AI Services

The platform supports connections with several major AI services:

| Service Name | Provider | Logo Path |
|--------------|----------|-----------|
| Claude | Anthropic | `/images/claude-color.png` |
| Gemini | Google | `/images/gemini-color.png` |
| ChatGPT | OpenAI | `/images/openai-logo.svg` |
| Copilot | Microsoft | `/images/copilot-logo.svg` |
| Perplexity | Perplexity AI | `/images/perplexity-logo.svg` |

## API Endpoints

### List User Connections

Retrieves all AI connections for the authenticated user.

- **URL**: `/api/connections`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Response**: 
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "aiServiceName": "Claude",
      "aiServiceId": "claude-connection-1",
      "isActive": true,
      "sharedData": {
        "name": true,
        "age": true
      },
      "createdAt": "2025-03-15T12:00:00Z",
      "lastConnected": "2025-04-01T14:30:00Z"
    }
  ]
  ```

### Create New Connection

Creates a new AI connection for the authenticated user.

- **URL**: `/api/connections`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "aiServiceName": "Claude",
    "aiServiceId": "claude-connection-1",
    "sharedData": {
      "name": true,
      "age": true,
      "gender": false
    }
  }
  ```
- **Response**: 
  ```json
  {
    "id": 1,
    "userId": 1,
    "aiServiceName": "Claude",
    "aiServiceId": "claude-connection-1",
    "isActive": true,
    "sharedData": {
      "name": true,
      "age": true,
      "gender": false
    },
    "createdAt": "2025-04-04T10:15:00Z",
    "lastConnected": null
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User not verified
  - `400 Bad Request`: Invalid input data

### Revoke Connection

Revokes an existing AI connection.

- **URL**: `/api/connections/:id/revoke`
- **Method**: `PATCH`
- **Authentication Required**: Yes
- **URL Parameters**:
  - `id`: Connection ID
- **Response**: 
  ```json
  {
    "id": 1,
    "userId": 1,
    "aiServiceName": "Claude",
    "aiServiceId": "claude-connection-1",
    "isActive": false,
    "sharedData": {
      "name": true,
      "age": true
    },
    "createdAt": "2025-03-15T12:00:00Z",
    "lastConnected": "2025-04-01T14:30:00Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: Access denied (connection belongs to another user)
  - `500 Internal Server Error`: Error revoking connection

## Data Sharing Model

The `sharedData` object specifies which user data attributes are shared with the AI service:

```json
{
  "name": true,             // Share user's name
  "age": true,              // Share user's age
  "gender": false,          // Don't share gender
  "verification_status": true,  // Share that user is verified
  "verification_method": false,  // Don't share how they were verified
  "location": false,        // Don't share location
  "custom_preferences": {   // Custom data
    "language": "English",
    "theme": "Dark"
  }
}
```

## Integration Examples

### Frontend Integration

```javascript
import { useState, useEffect } from 'react';

// Hook for managing AI connections
function useAiConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user connections
  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/connections', {
        credentials: 'include' // Important for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new connection
  const createConnection = async (connectionData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(connectionData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create connection');
      }
      
      const newConnection = await response.json();
      setConnections([...connections, newConnection]);
      return newConnection;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Revoke a connection
  const revokeConnection = async (connectionId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/connections/${connectionId}/revoke`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke connection');
      }
      
      const updatedConnection = await response.json();
      setConnections(connections.map(conn => 
        conn.id === connectionId ? updatedConnection : conn
      ));
      return updatedConnection;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load connections on mount
  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    loading,
    error,
    fetchConnections,
    createConnection,
    revokeConnection
  };
}

// Using the hook in a component
function AiConnectionsManager() {
  const {
    connections,
    loading,
    error,
    createConnection,
    revokeConnection
  } = useAiConnections();

  const handleConnect = async (service) => {
    try {
      // Example connection data
      const connectionData = {
        aiServiceName: service.name,
        aiServiceId: `${service.id}-${Date.now()}`,
        sharedData: {
          name: true,
          age: true,
          verification_status: true
        }
      };
      
      await createConnection(connectionData);
      alert('Connected successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRevoke = async (connectionId) => {
    try {
      await revokeConnection(connectionId);
      alert('Connection revoked successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading connections...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your AI Connections</h2>
      {connections.length === 0 ? (
        <p>No active connections</p>
      ) : (
        <ul>
          {connections.map(connection => (
            <li key={connection.id}>
              {connection.aiServiceName}
              {connection.isActive ? (
                <button onClick={() => handleRevoke(connection.id)}>
                  Revoke
                </button>
              ) : (
                <span>(Revoked)</span>
              )}
            </li>
          ))}
        </ul>
      )}
      
      <h3>Available Services</h3>
      <div className="service-list">
        {availableServices.map(service => (
          <div key={service.id} className="service-card">
            <img src={service.logoPath} alt={service.name} />
            <h4>{service.name}</h4>
            <button onClick={() => handleConnect(service)}>
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example available services
const availableServices = [
  { id: 'claude', name: 'Claude', logoPath: '/images/claude-color.png' },
  { id: 'gemini', name: 'Gemini', logoPath: '/images/gemini-color.png' },
  { id: 'gpt', name: 'ChatGPT', logoPath: '/images/openai-logo.svg' },
  { id: 'copilot', name: 'Copilot', logoPath: '/images/copilot-logo.svg' },
  { id: 'perplexity', name: 'Perplexity', logoPath: '/images/perplexity-logo.svg' }
];
```

## Connection Flow

The recommended flow for AI service connections:

1. **Verify User Identity**:
   - First, ensure the user has completed face verification
   - Check `user.isVerified` status via `/api/auth/me` endpoint

2. **Present Available Services**:
   - Show the list of available AI services with logos
   - Clearly indicate which ones the user is already connected to

3. **Data Consent UI**:
   - When a user selects a service, show a clear consent UI
   - List exactly which data will be shared
   - Allow users to customize data sharing preferences

4. **Create Connection**:
   - Call the connection API with selected preferences
   - Store the returned connection information

5. **Connection Management**:
   - Allow users to view and manage their connections
   - Provide clear options to revoke connections

## Security Considerations

1. **Always authenticate**: All connection operations must be performed with an authenticated user
2. **Verify before connect**: Only verified users should be allowed to create connections
3. **Explicit consent**: Always get explicit user consent for data sharing
4. **Principle of least privilege**: Only share the minimum data necessary
5. **Regular auditing**: Provide users with activity logs of how their data is being used

## Service-Specific Integration Notes

### Claude (Anthropic)

Anthropic's Claude requires a unique connection ID format. Use:
```
claude-user-{userId}-{timestamp}
```

### ChatGPT (OpenAI)

OpenAI's ChatGPT uses OAuth for authentication. You'll need to:
1. Register your application with OpenAI
2. Implement the OAuth redirect flow
3. Store the resulting tokens securely

## Troubleshooting

Common issues and solutions:

1. **Connection Forbidden (403)**
   - Ensure the user has completed identity verification
   - Check `user.isVerified` status

2. **Invalid Input Error (400)**
   - Ensure `aiServiceName` matches one of the supported services
   - Verify `sharedData` contains valid fields

3. **Connection Already Exists**
   - Check for existing connections with the same service
   - Consider updating an existing connection instead of creating a new one

## Future API Enhancements

Planned enhancements to the AI connection API:

1. OAuth-based direct connections with leading AI providers
2. Enhanced data permission controls with granular permissions
3. Time-limited or purpose-limited connections
4. Connection usage analytics and reporting
