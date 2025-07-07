import React from 'react';
import { Platform } from '../types';
import { X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  platforms: Platform[];
  authenticatedPlatforms: Platform[];
  onAuth: (platform: Platform) => void;
  onClose: () => void;
  isLoading: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  platforms,
  authenticatedPlatforms,
  onAuth,
  onClose,
  isLoading
}) => {
  const isAuthenticated = (platformId: string) => {
    return authenticatedPlatforms.some(p => p.id === platformId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Connect Platforms</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                isAuthenticated(platform.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: platform.color }}
                  >
                    <span className="text-lg">{platform.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{platform.name}</h3>
                    <p className="text-sm text-gray-500">
                      {isAuthenticated(platform.id) ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {isAuthenticated(platform.id) ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <button
                    onClick={() => onAuth(platform)}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Connect</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            We use secure OAuth 2.0 to connect your accounts. 
            Your credentials are never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;