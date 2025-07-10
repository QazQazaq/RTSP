from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.db import init_mongo, mongo
import subprocess
import os
import signal
import threading
import time
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Initialize MongoDB
try:
    init_mongo(app)
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    print("Continuing without MongoDB - using fallback data")

# Global state for streaming
stream_state = {
    'is_running': False,
    'rtsp_url': None,
    'ffmpeg_process': None,
    'has_ffmpeg': False
}

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=1)
        return result.returncode == 0
    except Exception as e:
        return False

# Check FFmpeg availability on startup
stream_state['has_ffmpeg'] = check_ffmpeg()
print(f"FFmpeg {'available' if stream_state['has_ffmpeg'] else 'NOT available'}")

# Create HLS directory
hls_dir = Path(__file__).parent / 'hls'
hls_dir.mkdir(exist_ok=True)

def start_rtsp_stream(rtsp_url):
    """Start RTSP to HLS conversion using FFmpeg"""
    if not stream_state['has_ffmpeg']:
        raise Exception("FFmpeg not available")
    
    # Stop any existing stream
    stop_rtsp_stream()
    
    output_path = hls_dir / 'stream.m3u8'
    
    cmd = [
        'ffmpeg',
        '-rtsp_transport', 'tcp',
        '-i', rtsp_url,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'veryfast',
        '-tune', 'zerolatency',
        '-g', '30',
        '-sc_threshold', '0',
        '-f', 'hls',
        '-hls_time', '4',
        '-hls_list_size', '6',
        '-hls_flags', 'delete_segments+independent_segments',
        '-hls_segment_type', 'mpegts',
        '-y',
        str(output_path)
    ]
    
    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE, text=True)
        stream_state['ffmpeg_process'] = process
        stream_state['is_running'] = True
        stream_state['rtsp_url'] = rtsp_url
        return str(output_path)
    except Exception as e:
        raise Exception(f"Failed to start FFmpeg: {e}")

def stop_rtsp_stream():
    """Stop RTSP stream conversion"""
    if stream_state['ffmpeg_process']:
        stream_state['ffmpeg_process'].terminate()
        try:
            stream_state['ffmpeg_process'].wait(timeout=5)
        except subprocess.TimeoutExpired:
            stream_state['ffmpeg_process'].kill()
        stream_state['ffmpeg_process'] = None
    
    stream_state['is_running'] = False
    stream_state['rtsp_url'] = None
    
    # Clean up HLS files
    try:
        for file in hls_dir.glob('*.m3u8'):
            file.unlink()
        for file in hls_dir.glob('*.ts'):
            file.unlink()
    except Exception as e:
        print(f"Error cleaning HLS files: {e}")

# Health check endpoint
@app.route('/api/health')
def health():
    return {'status': 'ok', 'timestamp': time.time()}

# Stream endpoints
@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    try:
        data = request.get_json()
        rtsp_url = data.get('rtspUrl')
        
        if not rtsp_url:
            return jsonify({'error': 'RTSP URL is required'}), 400
        
        if not stream_state['has_ffmpeg']:
            return jsonify({
                'error': 'FFmpeg not available',
                'note': 'FFmpeg is required for RTSP to HLS conversion',
                'mode': 'demo'
            }), 500
        
        start_rtsp_stream(rtsp_url)
        
        return jsonify({
            'message': 'RTSP stream conversion started',
            'hlsUrl': f'http://localhost:5000/hls/stream.m3u8',
            'rtspUrl': rtsp_url,
            'mode': 'production'
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to start RTSP stream',
            'details': str(e)
        }), 500

@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    try:
        stop_rtsp_stream()
        return jsonify({'message': 'Stream stopped'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stream/status')
def stream_status():
    hls_file = hls_dir / 'stream.m3u8'
    return jsonify({
        'isRunning': stream_state['is_running'],
        'hlsAvailable': hls_file.exists(),
        'hlsUrl': f'http://localhost:5000/hls/stream.m3u8' if hls_file.exists() else None,
        'rtspUrl': stream_state['rtsp_url'],
        'hasFFmpeg': stream_state['has_ffmpeg'],
        'mode': 'production' if stream_state['has_ffmpeg'] else 'demo'
    })

# Serve HLS files
@app.route('/hls/<path:filename>')
def serve_hls(filename):
    from flask import send_from_directory, make_response
    response = make_response(send_from_directory(hls_dir, filename))
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    if filename.endswith('.m3u8'):
        response.headers['Content-Type'] = 'application/vnd.apple.mpegurl'
    elif filename.endswith('.ts'):
        response.headers['Content-Type'] = 'video/mp2t'
    return response

# Overlays endpoints
@app.route('/api/overlays')
def get_overlays():
    try:
        overlays = list(mongo.db.overlays.find({}, {'_id': 0}))
        return jsonify(overlays)
    except Exception as e:
        # Fallback to demo data if MongoDB fails
        return jsonify([{
            'id': 'demo-1',
            'name': 'Demo Overlay',
            'type': 'text',
            'content': 'DEMO MODE',
            'position': {'x': 10, 'y': 10},
            'size': {'width': 150, 'height': 40},
            'color': '#ff0000',
            'fontSize': 24,
            'opacity': 1,
            'rotation': 0,
            'visible': True,
            'createdAt': time.time()
        }])

@app.route('/api/overlays/<overlay_id>')
def get_overlay(overlay_id):
    try:
        overlay = mongo.db.overlays.find_one({'id': overlay_id}, {'_id': 0})
        if overlay:
            return jsonify(overlay)
        return jsonify({'error': 'Overlay not found'}), 404
    except Exception:
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    try:
        data = request.get_json()
        overlay_id = str(int(time.time() * 1000))
        data['id'] = overlay_id
        data['createdAt'] = time.time()
        
        mongo.db.overlays.insert_one(data)
        return jsonify(data)
    except Exception as e:
        # Return mock data if MongoDB fails
        return jsonify({
            'id': overlay_id,
            **data,
            'createdAt': time.time()
        })

@app.route('/api/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    try:
        data = request.get_json()
        data['id'] = overlay_id
        
        mongo.db.overlays.update_one(
            {'id': overlay_id},
            {'$set': data},
            upsert=True
        )
        return jsonify(data)
    except Exception:
        return jsonify(data)

@app.route('/api/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    try:
        mongo.db.overlays.delete_one({'id': overlay_id})
        return jsonify({'message': 'Overlay deleted'})
    except Exception:
        return jsonify({'message': 'Overlay deleted (fallback)'})

# Settings endpoints
@app.route('/api/settings')
def get_settings():
    try:
        settings = mongo.db.settings.find_one({}, {'_id': 0})
        if not settings:
            settings = {
                'rtspUrl': 'rtsp://localhost:8554/mystream',
                'volume': 0.5,
                'autoplay': False,
                'quality': 'auto',
                'bufferSize': 5,
                'reconnectAttempts': 3
            }
            mongo.db.settings.insert_one(settings)
        return jsonify(settings)
    except Exception:
        return jsonify({
            'rtspUrl': 'rtsp://localhost:8554/mystream',
            'volume': 0.5,
            'autoplay': False,
            'quality': 'auto',
            'bufferSize': 5,
            'reconnectAttempts': 3
        })

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    try:
        data = request.get_json()
        mongo.db.settings.update_one(
            {},
            {'$set': data},
            upsert=True
        )
        return jsonify(data)
    except Exception:
        return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)