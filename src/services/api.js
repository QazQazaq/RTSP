
import axios from 'axios';

// Use Flask backend on port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for stream operations
});

// Add response interceptor to handle network errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Backend server not available, using demo mode');
      return Promise.reject({
        ...error,
        isDemoMode: true,
        message: 'Backend server not available'
      });
    }
    return Promise.reject(error);
  }
);

// Overlay API
export const getOverlays = async () => {
  try {
    const response = await api.get('/overlays');
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return [
        {
          id: 'demo-1',
          name: 'Demo Text Overlay',
          type: 'text',
          content: 'LIVE DEMO',
          position: { x: 10, y: 10 },
          size: { width: 150, height: 40 },
          color: '#ff0000',
          fontSize: 24,
          opacity: 1,
          rotation: 0,
          visible: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
    throw error;
  }
};

export const getOverlay = async (id) => {
  try {
    const response = await api.get(`/overlays/${id}`);
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return null;
    }
    throw error;
  }
};

export const createOverlay = async (overlay) => {
  try {
    const response = await api.post('/overlays', overlay);
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return {
        id: Date.now().toString(),
        ...overlay,
        createdAt: new Date().toISOString()
      };
    }
    throw error;
  }
};

export const updateOverlay = async (id, overlay) => {
  try {
    const response = await api.put(`/overlays/${id}`, overlay);
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return { id, ...overlay };
    }
    throw error;
  }
};

export const deleteOverlay = async (id) => {
  try {
    const response = await api.delete(`/overlays/${id}`);
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return { message: 'Overlay deleted successfully (demo mode)' };
    }
    throw error;
  }
};

// Settings API
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return {
        rtspUrl: 'rtsp://localhost:8554/mystream',
        volume: 0.5,
        autoplay: false,
        quality: 'auto',
        bufferSize: 5,
        reconnectAttempts: 3
      };
    }
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/settings', settings);
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return settings;
    }
    throw error;
  }
};

// Stream API
export const startStream = async (rtspUrl) => {
  try {
    const response = await api.post('/stream/start', { rtspUrl });
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return {
        message: 'Demo mode - no backend server available',
        mode: 'demo',
        note: 'Backend server not available. Running in demo mode.'
      };
    }
    throw error;
  }
};

export const stopStream = async () => {
  try {
    const response = await api.post('/stream/stop');
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return { message: 'Stream stopped (demo mode)' };
    }
    throw error;
  }
};

export const getStreamStatus = async () => {
  try {
    const response = await api.get('/stream/status');
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return {
        isRunning: false,
        hlsAvailable: false,
        hlsUrl: null,
        rtspUrl: null,
        startTime: null,
        mode: 'demo',
        hasFFmpeg: false
      };
    }
    throw error;
  }
};

// Health Check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    if (error.isDemoMode) {
      return { 
        status: 'demo', 
        timestamp: new Date().toISOString(),
        message: 'Backend server not available'
      };
    }
    throw error;
  }
};

export default api;
