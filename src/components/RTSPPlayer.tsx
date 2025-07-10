import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, Wifi } from 'lucide-react';

interface RTSPPlayerProps {
  rtspUrl: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  autoplay?: boolean;
}

const RTSPPlayer: React.FC<RTSPPlayerProps> = ({ 
  rtspUrl, 
  volume, 
  onVolumeChange, 
  autoplay = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<any>(null);
  const [streamMode, setStreamMode] = useState<'rtsp' | 'hls' | 'demo' | 'error'>('rtsp');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);
useEffect(() => {
  if (rtspUrl) {
    initializeStream();
  }
  return () => cleanup();
}, [rtspUrl]);




  const cleanup = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const checkStreamStatus = async () => {
    try {
      const { getStreamStatus } = await import('../services/api');
      const status = await getStreamStatus();
      setStreamStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check stream status:', error);
      if (error.isDemoMode) {
        return {
          isRunning: false,
          hlsAvailable: false,
          mode: 'demo',
          hasFFmpeg: false
        };
      }
      return null;
    }
  };

  const startRTSPStream = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to start stream via API
      const { startStream } = await import('../services/api');
      try {
        const data = await startStream(rtspUrl);
      
        // Check if FFmpeg is available
        if (data.mode === 'demo' || (data.note && data.note.includes('not available'))) {
          setStreamMode('demo');
          setError(`RTSP streaming not supported: ${data.note}`);
          setTimeout(() => {
            loadDemoStream();
          }, 2000);
          return;
        }
        
        setStreamMode('hls');
        
        // Wait for stream conversion to initialize
        setTimeout(() => {
          const hlsUrl = data.hlsUrl || `http://localhost:5000/hls/stream.m3u8`;
          loadHLSStream(hlsUrl);
        }, 3000);
        
      } catch (apiError) {
        console.error('Stream API error:', apiError);
        setStreamMode('demo');
        
        if (apiError.response?.data?.suggestions) {
          setError(`RTSP streaming failed: ${apiError.response.data.error}. ${apiError.response.data.note}`);
        } else {
          setError(`RTSP streaming failed: ${apiError.message || 'Unknown error'}`);
        }
        
        setTimeout(() => {
          loadDemoStream();
        }, 2000);
        return;
      }
      
    } catch (error) {
      console.error('RTSP stream error:', error);
      if (error.isDemoMode) {
        setStreamMode('demo');
        setError('Backend server not available. RTSP streaming requires a backend server with FFmpeg support.');
        setTimeout(() => {
          loadDemoStream();
        }, 2000);
      } else {
        setError(`RTSP stream failed: ${error.message || 'Unknown error occurred'}`);
        setStreamMode('error');
        setIsLoading(false);
      }
    }
  };

  const loadDemoStream = () => {
    if (!videoRef.current) return;
    
    setIsLoading(false);
    setStreamMode('demo');
    
    // Use a demo video as fallback when RTSP/FFmpeg is not available
    const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    videoRef.current.src = demoVideoUrl;
    videoRef.current.loop = true;
    
    if (autoplay) {
      videoRef.current.play().catch(() => {
        console.log('Autoplay blocked, user interaction required');
      });
    }
  };

  const loadHLSStream = (hlsUrl: string) => {
    if (!videoRef.current) return;

    cleanup();
    setStreamMode('hls');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        startLevel: -1,
        capLevelToPlayerSize: true
      });
      
      hlsRef.current = hls;
      
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed successfully');
        setIsLoading(false);
        setError(null);
        setRetryCount(0);
        if (autoplay) {
          videoRef.current?.play();
        }
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error loading RTSP stream. Check if the RTSP URL is accessible.');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error in RTSP stream. The stream format may not be supported.');
              break;
            default:
              setError('Fatal error loading RTSP stream.');
              break;
          }
          setStreamMode('error');
          setIsLoading(false);
        }
      });
      
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      videoRef.current.src = hlsUrl;
      
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video error:', e);
        setError('Error loading RTSP stream in Safari');
        setStreamMode('error');
        setIsLoading(false);
      });
      
      videoRef.current.addEventListener('loadeddata', () => {
        setIsLoading(false);
        setError(null);
        if (autoplay) {
          videoRef.current?.play();
        }
      });
    } else {
      setError('HLS not supported in this browser. RTSP streaming requires HLS support.');
      setStreamMode('error');
      setIsLoading(false);
    }
  };

  const initializeStream = async () => {
    setIsLoading(true);
    setError(null);
    
    const status = await checkStreamStatus();
    
    if (status?.hlsAvailable && status?.isRunning) {
      // Stream is already running, load it directly
      console.log('Loading existing HLS stream');
      loadHLSStream(status.hlsUrl);
    } else {
      // Start new RTSP stream conversion
      console.log('Starting new RTSP stream conversion');
      await startRTSPStream();
    }
  };

  const retryStream = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      initializeStream();
    } else {
      setError('Maximum retry attempts reached. Please check your RTSP URL and network connection.');
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play error:', err);
          setError('Failed to play stream. User interaction may be required.');
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const getStatusColor = () => {
    switch (streamMode) {
      case 'hls': return 'text-green-400';
      case 'demo': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (streamMode) {
      case 'hls': return 'RTSP → HLS Live';
      case 'demo': return 'Demo Mode';
      case 'error': return 'Stream Error';
      default: return 'Connecting...';
    }
  };

  return (
    <div className="relative">
      {/* Stream Mode Banner */}
      {streamMode === 'demo' && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <strong>Demo Mode:</strong> FFmpeg not available. Install FFmpeg to enable RTSP streaming.
        </div>
      )}
      
      {streamMode === 'hls' && (
        <div className="bg-green-600 text-white px-4 py-2 text-sm flex items-center">
          <Wifi className="w-4 h-4 mr-2" />
          <strong>Live RTSP Stream:</strong> {rtspUrl}
        </div>
      )}
      
      <div className="aspect-video bg-black relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          crossOrigin="anonymous"
          playsInline
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">
                {streamMode === 'demo' ? 'Loading demo video...' : 'Converting RTSP stream...'}
              </p>
              {streamMode !== 'demo' && (
                <div className="text-sm text-gray-400 mt-2 space-y-1">
                  <p>Processing: {rtspUrl}</p>
                  <p>Converting to web-compatible HLS format</p>
                  <p>This may take a few moments...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && streamMode === 'error' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white max-w-md px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">RTSP Stream Error</h3>
              <div className="mb-4 text-sm space-y-2">
                <p>{error}</p>
                <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
                  <p><strong>Common causes:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Environment doesn't support FFmpeg execution</li>
                    <li>RTSP URL is not accessible</li>
                    <li>Network connectivity issues</li>
                    <li>Containerized environment restrictions</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400">RTSP URL: {rtspUrl}</p>
                <p className="text-xs text-gray-400">Retry attempts: {retryCount}/3</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={retryStream}
                  disabled={retryCount >= 3}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                >
                  Retry RTSP
                </button>
                <button
                  onClick={loadDemoStream}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Use Demo Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              disabled={isLoading || (error && streamMode === 'error')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`text-xs ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTSPPlayer;