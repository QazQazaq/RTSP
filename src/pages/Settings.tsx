import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    rtspUrl: '',
    volume: 0.5,
    autoplay: false,
    quality: 'auto',
    bufferSize: 5,
    reconnectAttempts: 3,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
          autoplay: false,
          quality: 'auto',
          bufferSize: 5,
          reconnectAttempts: 3,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isDemoMode) {
      alert('Demo Mode: Settings cannot be saved without backend server. This is a frontend-only deployment.');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isDemoMode && (
        <div className="mb-6 bg-yellow-600 text-white p-4 rounded-lg flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Demo Mode Active</h3>
            <p className="text-sm mt-1">
              Backend server not available. Settings cannot be saved in this deployment. 
              For full functionality, deploy both frontend and backend servers.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RTSP Stream URL
              </label>
              <input
                type="url"
                name="rtspUrl"
                value={settings.rtspUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rtsp://example.com/stream"
                required
              />
              <p className="mt-1 text-sm text-gray-400">
                Enter the RTSP URL for your livestream source
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Volume
              </label>
              <input
                type="range"
                name="volume"
                value={settings.volume}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.1"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400">Volume: {Math.round(settings.volume * 100)}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quality
              </label>
              <select
                name="quality"
                value={settings.quality}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buffer Size (seconds)
              </label>
              <input
                type="number"
                name="bufferSize"
                value={settings.bufferSize}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reconnect Attempts
              </label>
              <input
                type="number"
                name="reconnectAttempts"
                value={settings.reconnectAttempts}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="autoplay"
              checked={settings.autoplay}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-300">
              Auto-play stream on page load
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={loadSettings}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving || isDemoMode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isDemoMode ? 'Demo Mode' : isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">API Information</h2>
        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded">
            <p className="text-yellow-200 text-sm">
              <strong>Demo Mode:</strong> Backend API not available. Deploy backend server for full functionality.
            </p>
          </div>
        )}
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>Base URL:</strong> {isDemoMode ? 'Not Available (Demo Mode)' : 'http://localhost:3001/api'}</p>
          <p><strong>Overlays Endpoint:</strong> /overlays</p>
          <p><strong>Settings Endpoint:</strong> /settings</p>
          <p><strong>Health Check:</strong> /health</p>
          {isDemoMode && (
            <p className="text-yellow-400 text-xs mt-2">
              * API endpoints are not functional in demo mode
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;