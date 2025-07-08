import { useState, useEffect } from 'react';
import { Platform } from '../types';

export const useAuth = () => {
  const [authenticatedPlatforms, setAuthenticatedPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const platforms: Platform[] = [
    { id: 'tiktok', name: 'TikTok', color: '#ff0050', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', icon: '📺' },
    { id: 'instagram', name: 'Instagram', color: '#e4405f', icon: '📸' },
    { id: 'x', name: 'X (Twitter)', color: '#000000', icon: '🐦' }
  ];

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth success from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const platform = urlParams.get('platform');
    
    if (authSuccess === 'success' && platform) {
      const platformData = platforms.find(p => p.id === platform);
      if (platformData) {
        setAuthenticatedPlatforms(prev => {
          if (!prev.find(p => p.id === platform)) {
            return [...prev, platformData];
          }
          return prev;
        });
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/status`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const connectedPlatforms = data.connected.map((platformId: string) => 
          platforms.find(p => p.id === platformId)
        ).filter(Boolean);
        
        setAuthenticatedPlatforms(connectedPlatforms);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const handleAuth = (platform: Platform) => {
    setIsLoading(true);
    // Redirect to OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${platform.id}`;
  };

  const handleLogout = async (platformId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout/${platformId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setAuthenticatedPlatforms(prev => prev.filter(p => p.id !== platformId));
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return {
    authenticatedPlatforms,
    platforms,
    isLoading,
    handleAuth,
    handleLogout,
    checkAuthStatus
  };
};