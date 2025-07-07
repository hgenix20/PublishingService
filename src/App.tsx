import React, { useState, useEffect } from 'react';
import { Upload, Video, Image, Users, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import MediaUpload from './components/MediaUpload';
import PublishModal from './components/PublishModal';
import { Platform, MediaFile, PublishStatus } from './types';

function App() {
  const [authenticatedPlatforms, setAuthenticatedPlatforms] = useState<Platform[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const platforms: Platform[] = [
    { id: 'tiktok', name: 'TikTok', color: '#ff0050', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', icon: '📺' },
    { id: 'instagram', name: 'Instagram', color: '#e4405f', icon: '📸' },
    { id: 'x', name: 'X (Twitter)', color: '#000000', icon: '🐦' }
  ];

  const handleAuth = (platform: Platform) => {
    setIsLoading(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setAuthenticatedPlatforms(prev => [...prev, platform]);
      setIsLoading(false);
      setShowAuthModal(false);
    }, 2000);
  };

  const handleLogout = (platformId: string) => {
    setAuthenticatedPlatforms(prev => prev.filter(p => p.id !== platformId));
  };

  const handleFileSelect = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const handlePublish = async (caption: string, selectedPlatforms: string[]) => {
    if (!selectedFile) return;

    setIsLoading(true);
    setPublishStatus({ status: 'publishing', message: 'Publishing to selected platforms...' });

    try {
      const formData = new FormData();
      formData.append('video', selectedFile.file);
      formData.append('caption', caption);
      formData.append('platforms', JSON.stringify(selectedPlatforms));

      const response = await fetch('http://localhost:5005/publish', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setPublishStatus({ 
          status: 'success', 
          message: `Successfully published! Video ID: ${result.videoId}` 
        });
      } else {
        throw new Error('Publishing failed');
      }
    } catch (error) {
      setPublishStatus({ 
        status: 'error', 
        message: 'Failed to publish content. Please try again.' 
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setPublishStatus(null);
        setShowPublishModal(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Social Publisher</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {authenticatedPlatforms.length} platform{authenticatedPlatforms.length !== 1 ? 's' : ''} connected
                </span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Connect Platforms</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard */}
            <div className="lg:col-span-2">
              <Dashboard 
                authenticatedPlatforms={authenticatedPlatforms}
                onLogout={handleLogout}
                platforms={platforms}
              />
            </div>

            {/* Upload Section */}
            <div className="space-y-6">
              <MediaUpload onFileSelect={handleFileSelect} />
              
              {selectedFile && (
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
                  <h3 className="text-lg font-semibold text-white mb-4">Selected Media</h3>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      {selectedFile.type.startsWith('video/') ? (
                        <video 
                          src={selectedFile.preview} 
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img 
                          src={selectedFile.preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      <p><strong>File:</strong> {selectedFile.name}</p>
                      <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {selectedFile.type}</p>
                    </div>
                    <button
                      onClick={() => setShowPublishModal(true)}
                      disabled={authenticatedPlatforms.length === 0}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Publish Content</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Status Messages */}
        {publishStatus && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-lg border-l-4 max-w-md ${
              publishStatus.status === 'success' ? 'border-green-500' : 
              publishStatus.status === 'error' ? 'border-red-500' : 'border-blue-500'
            }`}>
              <div className="flex items-center space-x-3">
                {publishStatus.status === 'publishing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                {publishStatus.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {publishStatus.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                <p className="text-sm text-gray-800">{publishStatus.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          platforms={platforms}
          authenticatedPlatforms={authenticatedPlatforms}
          onAuth={handleAuth}
          onClose={() => setShowAuthModal(false)}
          isLoading={isLoading}
        />
      )}

      {showPublishModal && selectedFile && (
        <PublishModal
          authenticatedPlatforms={authenticatedPlatforms}
          onPublish={handlePublish}
          onClose={() => setShowPublishModal(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default App;