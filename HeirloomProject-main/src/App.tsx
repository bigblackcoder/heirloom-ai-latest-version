import { useState } from 'react';
import FaceVerification from './components/FaceVerification/FaceVerification';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = ""; // TODO: Get this from your auth flow

  const handleVerificationComplete = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
    } else {
      setError('Face verification failed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      {!isLoggedIn && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Face Verification</h2>
          <FaceVerification 
            userId={userId}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      )}
      
      {isLoggedIn && (
        <div>
          {/* Add your logged-in content here */}
          <h2>Welcome! You're logged in.</h2>
        </div>
      )}
    </div>
  );
}

export default App;  