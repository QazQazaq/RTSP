
#!/usr/bin/env python3
import subprocess
import sys
import os
import time

def check_mongodb():
    """Check if MongoDB is running"""
    try:
        import pymongo
        client = pymongo.MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print("✅ MongoDB is running")
        return True
    except Exception as e:
        print(f"⚠️  MongoDB not available: {e}")
        print("   Install MongoDB or use fallback data storage")
        return False

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ FFmpeg is available")
            return True
        else:
            print("❌ FFmpeg not working properly")
            return False
    except Exception as e:
        print(f"❌ FFmpeg not found: {e}")
        print("   Install FFmpeg for RTSP streaming support")
        return False

def main():
    print("🚀 Starting Livestream Overlay Application")
    print("=" * 50)
    
    # Check dependencies
    check_mongodb()
    ffmpeg_ok = check_ffmpeg()
    
    if not ffmpeg_ok:
        print("\n⚠️  Warning: Without FFmpeg, only demo mode will be available")
    
    print("\n📋 Starting Flask backend on port 5000...")
    
    # Start Flask app
    os.chdir('server')
    subprocess.run([sys.executable, 'app.py'])

if __name__ == "__main__":
    main()
