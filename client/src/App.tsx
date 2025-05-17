import { Route, Switch } from 'wouter';
import { BiometricAuth } from './components/BiometricAuth';
import './index.css';

// Simple dashboard component
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Welcome to Your Dashboard</h1>
        <p className="text-gray-700 mb-6">
          Your identity has been successfully verified using device biometrics.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Verification Successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your identity was verified using biometric authentication. This session is secured with enhanced protection.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Your biometric data never left your device. Only verification metadata was processed securely.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main app component
export default function App() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" component={BiometricAuth} />
      </Switch>
    </div>
  );
}