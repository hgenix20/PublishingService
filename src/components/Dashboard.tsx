import React from 'react';
import { Platform } from '../types';
import { LogOut, CheckCircle, Activity, TrendingUp, Users } from 'lucide-react';

interface DashboardProps {
  authenticatedPlatforms: Platform[];
  onLogout: (platformId: string) => void;
  platforms: Platform[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  authenticatedPlatforms, 
  onLogout, 
  platforms 
}) => {
  const stats = [
    { label: 'Total Posts', value: '247', icon: Activity, color: 'bg-blue-500' },
    { label: 'Engagement', value: '12.4K', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Followers', value: '8.2K', icon: Users, color: 'bg-purple-500' },
    { label: 'Reach', value: '45.1K', icon: CheckCircle, color: 'bg-pink-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-300">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Platforms */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
        <h2 className="text-xl font-bold text-white mb-6">Connected Platforms</h2>
        
        {authenticatedPlatforms.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-600 bg-opacity-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg">No platforms connected yet</p>
            <p className="text-gray-500 text-sm mt-2">Connect your social media accounts to start publishing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authenticatedPlatforms.map((platform) => (
              <div key={platform.id} className="bg-white bg-opacity-10 rounded-xl p-4 border border-white border-opacity-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: platform.color }}
                    >
                      <span className="text-lg">{platform.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{platform.name}</h3>
                      <p className="text-sm text-gray-300">Connected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onLogout(platform.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Post published successfully</p>
                <p className="text-sm text-gray-300">Published to TikTok, Instagram • 2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;