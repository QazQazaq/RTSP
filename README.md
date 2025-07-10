# Livestream Overlay Management Application

A professional RTSP livestream application with custom overlay management, built with React and Node.js.

## Features

- **RTSP Video Streaming**: Stream from any RTSP source converted to HLS for web playback
- **Custom Overlays**: Add text, images, and logos with drag-and-drop positioning
- **Real-time Management**: Create, read, update, and delete overlays in real-time
- **Professional Interface**: Modern video player with volume, play/pause, and fullscreen controls
- **API-Driven**: Full REST API for overlay and settings management
- **FFmpeg Integration**: Automatic RTSP to HLS conversion for browser compatibility

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Video**: RTSP → HLS conversion with HTML5 Video
- **Storage**: JSON file-based storage (easily replaceable with MongoDB)

## Prerequisites

- Node.js (v16 or higher)
- **FFmpeg (REQUIRED for RTSP streaming)** - Must be installed and available in system PATH
  - **Windows**: Download from https://ffmpeg.org/download.html
  - **macOS**: `brew install ffmpeg`
  - **Linux**: `sudo apt install ffmpeg` or equivalent
  - **Containerized Environments**: May not support FFmpeg execution due to security restrictions

**IMPORTANT**: This application requires FFmpeg to convert RTSP streams to web-compatible HLS format. Many containerized environments (GitHub Codespaces, some Docker containers, WebContainers) restrict native binary execution, preventing FFmpeg from running even if installed.

### Environment Compatibility

**✅ Fully Supported:**
- Local development machines with FFmpeg installed
- VPS/Dedicated servers with FFmpeg
- Docker containers with proper FFmpeg setup and execution permissions
- Cloud instances (AWS EC2, Google Compute, etc.) with FFmpeg

**⚠️ Limited Support (Demo Mode Only):**
- GitHub Codespaces (security restrictions)
- WebContainer environments
- Sandboxed development environments
- Some Docker configurations with restricted execution

**For production RTSP streaming, deploy to an environment that supports native binary execution.**
## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

This will start both the frontend (port 5173) and backend (port 3001) servers.

**Note**: 
- **With FFmpeg**: Full RTSP streaming functionality with real-time conversion to HLS
- **Without FFmpeg**: Demo mode only - shows sample videos instead of RTSP streams
- **Production**: Always install FFmpeg for proper RTSP streaming support

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Stream Endpoints

#### POST /stream/start
Start RTSP stream conversion
```json
{
  "method": "POST",
  "url": "/api/stream/start",
  "body": {
    "rtspUrl": "rtsp://example.com/stream"
  },
  "response": {
    "message": "Stream started",
    "hlsUrl": "http://localhost:3001/hls/stream.m3u8",
    "mode": "production"
  }
}
```

#### POST /stream/stop
Stop RTSP stream conversion
```json
{
  "method": "POST",
  "url": "/api/stream/stop",
  "response": {
    "message": "Stream stopped"
  }
}
```

#### GET /stream/status
Get stream status
```json
{
  "method": "GET",
  "url": "/api/stream/status",
  "response": {
    "isRunning": true,
    "hlsAvailable": true,
    "hlsUrl": "http://localhost:3001/hls/stream.m3u8",
    "hasFFmpeg": true,
    "mode": "production"
  }
}
```
### Overlay Endpoints

#### GET /overlays
Get all overlays
```json
{
  "method": "GET",
  "url": "/api/overlays",
  "response": [
    {
      "id": "1234567890",
      "name": "Logo Overlay",
      "type": "logo",
      "content": "LIVE",
      "position": { "x": 10, "y": 10 },
      "size": { "width": 100, "height": 50 },
      "color": "#ffffff",
      "fontSize": 16,
      "opacity": 1,
      "rotation": 0,
      "visible": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /overlays
Create new overlay
```json
{
  "method": "POST",
  "url": "/api/overlays",
  "body": {
    "name": "My Overlay",
    "type": "text",
    "content": "Hello World",
    "position": { "x": 50, "y": 50 },
    "size": { "width": 200, "height": 100 },
    "color": "#ffffff",
    "fontSize": 24,
    "opacity": 1,
    "visible": true
  }
}
```

#### PUT /overlays/:id
Update overlay
```json
{
  "method": "PUT",
  "url": "/api/overlays/1234567890",
  "body": {
    "name": "Updated Overlay",
    "position": { "x": 60, "y": 40 }
  }
}
```

#### DELETE /overlays/:id
Delete overlay
```json
{
  "method": "DELETE",
  "url": "/api/overlays/1234567890"
}
```

### Settings Endpoints

#### GET /settings
Get current settings
```json
{
  "method": "GET",
  "url": "/api/settings",
  "response": {
    "rtspUrl": "rtsp://example.com/stream",
    "volume": 0.5,
    "autoplay": false,
    "quality": "auto",
    "bufferSize": 5,
    "reconnectAttempts": 3
  }
}
```

#### PUT /settings
Update settings
```json
{
  "method": "PUT",
  "url": "/api/settings",
  "body": {
    "rtspUrl": "rtsp://new-stream.com/live",
    "volume": 0.8,
    "autoplay": true
  }
}
```

## Usage Guide

### 1. Setting up RTSP Stream

1. Navigate to the Settings page
2. Enter your RTSP URL in the "RTSP Stream URL" field (e.g., `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4`)
3. Configure other playback settings as needed
4. Click "Save Settings"

**Note**: The application automatically converts RTSP streams to HLS format using FFmpeg for web browser compatibility.

**FFmpeg Requirement**: RTSP streams cannot be played directly in web browsers. This application uses FFmpeg to convert RTSP to HLS (HTTP Live Streaming) format in real-time.

### 2. Managing Overlays

1. Go to the Overlay Manager page
2. Click "Create Overlay" to add a new overlay
3. Choose overlay type (Text, Image, or Logo)
4. Configure position, size, and appearance
5. Save the overlay

### 3. Watching Stream

1. Visit the Stream Player page
2. The RTSP stream will automatically start converting to HLS format (requires FFmpeg)
3. Click play to start watching the livestream
4. Use the video controls for playback management
4. Overlays will appear automatically on the stream

### 4. Stream Conversion Process (Requires FFmpeg)

The application uses FFmpeg to convert RTSP streams to HLS (HTTP Live Streaming) format:

1. **RTSP Input**: Receives video from RTSP source
2. **FFmpeg Processing**: Converts to H.264/AAC with HLS segmentation
3. **HLS Output**: Generates .m3u8 playlist and .ts segments
4. **Web Playback**: Uses HLS.js for browser compatibility

**Without FFmpeg**: The application will display a demo mode warning and show sample videos instead of live RTSP streams.

### 5. Overlay Types

- **Text**: Custom text with font size, color, and positioning
- **Image**: External images loaded from URLs
- **Logo**: Simple text-based logos with background styling

### 6. Overlay Properties

- **Position**: X and Y coordinates as percentages
- **Size**: Width and height in pixels
- **Opacity**: Transparency level (0-1)
- **Rotation**: Rotation angle in degrees
- **Visibility**: Show/hide overlay

## Development

### File Structure
```
src/
├── components/
│   ├── Navigation.tsx
│   ├── OverlayEditor.tsx
│   └── OverlayRenderer.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── OverlayManager.tsx
│   ├── Settings.tsx
│   └── StreamPlayer.tsx
├── services/
│   └── api.js
└── App.tsx

server/
├── index.js
└── data.json
```

### Adding New Overlay Types

1. Update the overlay type options in `OverlayEditor.tsx`
2. Add rendering logic in `OverlayRenderer.tsx`
3. Update the API schema if needed

### Database Integration

To replace the JSON file storage with MongoDB:

1. Install MongoDB driver: `npm install mongodb`
2. Replace file operations in `server/index.js` with MongoDB operations
3. Update connection settings in environment variables

## Testing RTSP Streams

For testing purposes, you can use these public RTSP streams:

- `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4`
- `rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mp4`

**Requirements**: 
- FFmpeg must be installed to test RTSP streams
- Public RTSP streams may not always be available
- For production use, configure your own RTSP source

## Deployment

1. Build the project: `npm run build`
2. Deploy the frontend build files to your web server
3. Deploy the backend server to your Node.js hosting service
4. Update API endpoints in the frontend if needed

## Support

For issues or questions:
1. Check the console for error messages
2. **Verify FFmpeg is installed and accessible** (`ffmpeg -version`)
3. Verify RTSP stream URL is accessible
4. Ensure both frontend and backend servers are running
5. Check network connectivity and CORS settings
6. Monitor FFmpeg process logs for stream conversion issues
7. Check if RTSP source supports the required codecs (H.264/AAC preferred)