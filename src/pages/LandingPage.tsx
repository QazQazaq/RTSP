import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Layers, Settings, Monitor } from 'lucide-react';
import { getSettings } from '../services/api';
import RTSPPlayer from '../components/RTSPPlayer';

const LandingPage = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        setIsDemoMode(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        if (error.isDemoMode) {
          setIsDemoMode(true);
          // Load demo settings
          setSettings({
            rtspUrl: 'rtsp://localhost:8554/mystream',
            volume: 0.5,
            autoplay: false
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {isDemoMode && (
        <div className="bg-yellow-600 text-white px-4 py-3 text-center">
          <p className="text-sm">
            <strong>Demo Mode:</strong> Backend server not available. Some features may be limited.
          </p>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Professional
              <span className="text-blue-400"> Livestream</span>
              <br />
              Overlay Management
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Stream with custom overlays, manage your content in real-time, and deliver professional broadcasts with our powerful overlay system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/player"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Livestream
              </Link>
              <Link
                to="/overlays"
                className="inline-flex items-center px-8 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Layers className="w-5 h-5 mr-2" />
                Manage Overlays
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Monitor className="w-8 h-8 mr-3 text-blue-400" />
            RTSP Live Stream Preview
          </h2>
          <div className="rounded-lg overflow-hidden relative">
            {settings?.rtspUrl ? (
              <RTSPPlayer
                rtspUrl={settings.rtspUrl}
                volume={volume}
                onVolumeChange={setVolume}
                autoplay={false}
              />
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Monitor className="w-16 h-16 mx-auto mb-4" />
                  <p>Configure RTSP URL in Settings to preview stream</p>
                  <Link
                    to="/settings"
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Go to Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
          {settings && (
            <div className="mt-4 text-sm text-gray-400">
              <p>RTSP Source: {settings.rtspUrl}</p>
              <p className="text-xs mt-1">
                {isDemoMode 
                  ? 'Demo mode - showing sample video instead of RTSP stream' 
                  : 'Stream is converted to HLS format for web playback'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Play className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">RTSP Streaming</h3>
            <p className="text-gray-400">
              Stream from any RTSP source with professional-grade playback controls and quality settings.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Layers className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Custom Overlays</h3>
            <p className="text-gray-400">
              Add logos, text, and graphics with drag-and-drop positioning and real-time resizing.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Settings className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Full Control</h3>
            <p className="text-gray-400">
              Complete CRUD API for managing overlays, settings, and stream configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;