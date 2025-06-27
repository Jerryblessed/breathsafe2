import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Play, ExternalLink } from 'lucide-react';
import { HEALTH_SYSTEMS } from '../utils/healthSystems';
import { HealthSystem } from '../types/health';

const Dashboard: React.FC = () => {
  const [selectedVideoSystem, setSelectedVideoSystem] = useState<string | null>(null);

  const getStatusColor = (status: HealthSystem['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: HealthSystem['status']) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'fair':
        return <Clock className="w-5 h-5" />;
      case 'poor':
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const allAlerts = HEALTH_SYSTEMS.flatMap(system => system.alerts);
  const criticalSystems = HEALTH_SYSTEMS.filter(s => s.status === 'critical' || s.status === 'poor');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back to Breath-safe AI</h1>
        <p className="text-lg text-gray-600">Here's your comprehensive health overview across all body systems</p>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {HEALTH_SYSTEMS.filter(s => s.status === 'excellent' || s.status === 'good').length}
          </h3>
          <p className="text-sm text-gray-600">Systems Optimal</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {HEALTH_SYSTEMS.filter(s => s.status === 'fair').length}
          </h3>
          <p className="text-sm text-gray-600">Need Attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            {allAlerts.length > 0 && <TrendingDown className="w-5 h-5 text-red-500" />}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{allAlerts.length}</h3>
          <p className="text-sm text-gray-600">Active Alerts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {HEALTH_SYSTEMS.reduce((total, system) => total + system.videos.length, 0)}
          </h3>
          <p className="text-sm text-gray-600">Educational Videos</p>
        </div>
      </div>

      {/* Active Alerts */}
      {allAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            Active Health Alerts
          </h2>
          <div className="space-y-3">
            {allAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {alert.system.charAt(0).toUpperCase() + alert.system.slice(1)} System • 
                      {alert.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <button className="ml-4 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Dismiss</span>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Systems Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Body Systems Status</h2>
          <div className="flex items-center space-x-1 text-sm text-blue-600">
            <Play className="w-4 h-4" />
            <span>Click any system to view educational videos</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTH_SYSTEMS.map((system) => (
            <div
              key={system.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${getStatusColor(system.status)}`}
              onClick={() => setSelectedVideoSystem(selectedVideoSystem === system.id ? null : system.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{system.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                    <p className="text-xs text-gray-600">{system.description}</p>
                  </div>
                </div>
                {getStatusIcon(system.status)}
              </div>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium capitalize">{system.status}</span>
                <span className="text-gray-500">
                  {system.lastChecked.toLocaleDateString()}
                </span>
              </div>

              {/* Video indicator */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Play className="w-3 h-3" />
                  <span>{system.videos.length} videos</span>
                </div>
                {system.metrics.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {system.metrics[0].trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : system.metrics[0].trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                  </div>
                )}
              </div>
              
              {system.metrics.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {system.metrics[0].name}: {system.metrics[0].value}{system.metrics[0].unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Expandable Video Section */}
              {selectedVideoSystem === system.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    Educational Videos
                  </h4>
                  <div className="space-y-2">
                    {system.videos.slice(0, 2).map((video, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideo(video.url);
                        }}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {video.duration}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                    {system.videos.length > 2 && (
                      <div className="text-center">
                        <span className="text-xs text-blue-600">
                          +{system.videos.length - 2} more videos available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Educational Content */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Play className="w-5 h-5 text-blue-600 mr-2" />
          Featured Health Education
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTH_SYSTEMS.slice(0, 3).map((system) => (
            <div key={system.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">{system.icon}</span>
                <h3 className="font-medium text-gray-900">{system.name}</h3>
              </div>
              <div className="space-y-2">
                {system.videos.slice(0, 1).map((video, index) => (
                  <div
                    key={index}
                    onClick={() => openVideo(video.url)}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">{video.title}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{video.duration}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
