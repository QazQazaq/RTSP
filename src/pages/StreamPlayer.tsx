import React, { useState, useEffect, useRef } from 'react';
import { getSettings, getOverlays } from '../services/api';
import OverlayRenderer from '../components/OverlayRenderer';
import RTSPPlayer from '../components/RTSPPlayer';

const StreamPlayer = () => {
  const [volume, setVolume] = useState(0.5);
  const [settings, setSettings] = useState(null);
  const [overlays, setOverlays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, overlaysData] = await Promise.all([
          getSettings(),
          getOverlays()
        ]);
        setSettings(settingsData);
        setOverlays(overlaysData);
        setVolume(settingsData.volume || 0.5);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="relative">
          <RTSPPlayer
            rtspUrl={settings?.rtspUrl || ''}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            autoplay={settings?.autoplay}
          />
          
          {/* Overlay Renderer */}
          <OverlayRenderer overlays={overlays} />
        </div>

        {/* Stream Info */}
        <div className="p-6 bg-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">Live Stream</h2>
          {settings && (
            <div className="space-y-2 text-sm text-gray-400">
              <p>Source: {settings.rtspUrl}</p>
              <p>Active Overlays: {overlays.length}</p>
              <p>Stream Type: RTSP → HLS</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;