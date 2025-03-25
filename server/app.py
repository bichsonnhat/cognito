# save this as app.py
from datetime import datetime
from flask import Flask, request, make_response, jsonify
from flask_cors import CORS  # Import Flask-CORS
import subprocess
import requests
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from dotenv import load_dotenv
import os
app = Flask(__name__)

load_dotenv()
# Configure Cloudinary
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
    api_key = os.getenv("CLOUDINARY_API_KEY"), 
    api_secret = os.getenv("CLOUDINARY_API_SECRET"), 
    secure=True
)
# Configure CORS with more specific options
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}}, methods=["GET", "POST", "OPTIONS"])

@app.route("/")
def hello():
    json_response = {
        "message": "Hello, World!"
    }
    return jsonify(json_response)

@app.route("/generate-video", methods=["POST"])
def generate_video():
    media_path = request.json["video"]
    audio_path = request.json["audio"]
    print(media_path, audio_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Modify video path to absolute path
    video_path = os.path.abspath(f"facefusion/output/video_{timestamp}.mp4")

    facefusion_dir = os.path.abspath("facefusion") 
    # I want to download audio  and video with url  to the path server/download
    os.makedirs("download", exist_ok=True)
    # Download video file
    video_filename = f"video_{timestamp}.mp4"
    video_download_path = os.path.join("download", video_filename)
    with open(video_download_path, 'wb') as f:
        video_response = requests.get(media_path, stream=True)
        if video_response.status_code == 200:
            for chunk in video_response.iter_content(chunk_size=1024):
                f.write(chunk)
        else:
            return jsonify({"message": f"Failed to download video: {video_response.status_code}"})
    
    # Download audio file
    audio_filename = f"audio_{timestamp}{os.path.splitext(audio_path)[1]}"
    audio_download_path = os.path.join("download", audio_filename)
    with open(audio_download_path, 'wb') as f:
        audio_response = requests.get(audio_path, stream=True)
        if audio_response.status_code == 200:
            for chunk in audio_response.iter_content(chunk_size=1024):
                f.write(chunk)
        else:
            return jsonify({"message": f"Failed to download audio: {audio_response.status_code}"})
    
    # Update paths to use the downloaded files
    media_path = os.path.abspath(f"download/{video_filename}")
    audio_path = os.path.abspath(f"download/{audio_filename}")
    print(audio_path, media_path)
    command = [
        "python3", "run.py",
        "-t",  media_path,
        "-s", audio_path,
        "-o", video_path,
        "--frame-processors", "lip_syncer",
        "--headless", 
        "--execution-providers", "coreml",
        "--skip-download"
    ]

    result = subprocess.run(command, check=True, capture_output=True, text=True, cwd=facefusion_dir)

    if result.returncode == 0:
        print("Command executed successfully with path: ", video_path)
        # json_response = {
        #     "message": "Video generated successfully",
        #     "video_path": video_path
        # }
        ## Convert video_path to file and call API to upload to cloudinary
        
        # Set up your Cloudinary configuration

        upload_result = cloudinary.uploader.upload(video_path,
                                           public_id=f"video_{timestamp}",
                                           resource_type="video",
                                           folder="image-upload")
        print(upload_result["secure_url"])

        json_response = {
            "message": "Video generated successfully",
            "video_path": upload_result["secure_url"]
        }
        
        return jsonify(json_response)
    else:
        print("Command failed with error:", result.stderr)
        json_response = {
            "message": "Command failed with error: " + result.stderr
        }
        return jsonify(json_response)

if __name__ == "__main__":
    app.run(debug=True)