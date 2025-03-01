"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GradientText from "@/components/GradientText/GradientText";
import ShinyText from "@/components/ShinyText/ShinyText";
const VideoPage = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [finalVideoPreview, setFinalVideoPreview] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      // Clear previous recording if exists
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const startRecording = async () => {
    try {
      // Clear previous recording when starting a new one
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
        setAudioPreview("");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        setAudioPreview(url);
        setAudioFile(new File([blob], 'recorded-audio.ogg', { type: 'audio/ogg' }));
      };

      recorder.start();
      setAudioStream(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (audioStream) {
      audioStream.stop();
      setIsRecording(false);
      audioStream.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Here you'll implement the text-to-speech API call
      // For now, we'll just simulate with a placeholder
      setAudioPreview("/path-to-generated-audio.mp3");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    try {
      // Simulating video generation with a placeholder URL
      // Replace this with your actual video URL
      setFinalVideoPreview("/path-to-final-video.mp4");
    } catch (error) {
      console.error("Error generating video:", error);
    }
  };

  return (
    <div className="h-full relative">
      <div className="p-4 space-y-8 pb-20 overflow-y-auto h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
            className="text-5xl font-sans"
          >
            Make a video with AI
          </GradientText>
        </div>

        <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
          {/* Step 1: Video Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">1</span>
                Upload Your Video
              </h2>
              <p className="text-gray-500 text-sm ml-10">
                Start by uploading your video file. This will be the base for your AI-enhanced video.
                We support MP4, WebM, and Ogg formats.
              </p>
            </div>

            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer"
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input 
                type="file" 
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
                ref={inputRef}
              />
              
              <div className="space-y-4">
                <div className="text-gray-500">
                  Drag and drop your video here, or click to select
                </div>
                <div className="text-sm text-gray-400">
                  Supported formats: MP4, WebM, Ogg
                </div>
              </div>
            </div>

            {preview && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Original Video Preview</h3>
                <video 
                  src={preview} 
                  controls
                  className="w-full h-[300px] object-contain rounded-lg bg-black/5"
                />
              </div>
            )}
          </div>

          {/* Step 2: Voice Script */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">2</span>
                Add Your Voice
              </h2>
              <p className="text-gray-500 text-sm ml-10">
                Choose how you want to add voice to your video: write a script for AI voice generation,
                upload an audio file, or record your voice directly.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Choose one of the following options:</p>
                
                <div className="flex gap-4 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => audioInputRef.current?.click()}
                    className="flex-1"
                  >
                    Upload Audio File
                  </Button>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "secondary"}
                    className="flex-1"
                  >
                    {isRecording ? "Stop Recording" : (audioPreview ? "Record new voice" : "Start Recording")}
                  </Button>
                </div>

                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioUpload}
                  ref={audioInputRef}
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Or write a script for AI voice:</p>
                  <Textarea
                    placeholder="Enter your script here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-32 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Generate Audio */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">3</span>
                Generate Audio
              </h2>
              <p className="text-gray-500 text-sm ml-10">
                Convert your text to natural-sounding speech. You can preview the audio before finalizing.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGenerate}
                disabled={!text || isGenerating}
                className="w-full h-10 text-base"
              >
                <ShinyText className="bg-black" text={isGenerating ? "Generating..." : "Generate Audio"} />
              </Button>

              {audioPreview && (
                <div className="border rounded-lg p-4 space-y-2">
                  <label className="text-sm font-medium">Audio Preview</label>
                  <audio controls className="w-full">
                    <source src={audioPreview} type={audioFile?.type || "audio/ogg"} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Final Video Generation */}
          {video && audioPreview && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">4</span>
                  Create Final Video
                </h2>
                <p className="text-gray-500 text-sm ml-10">
                  Combine your video with the generated audio to create your final AI-enhanced video.
                </p>
              </div>

              <Button
                onClick={handleGenerateVideo}
                variant="default"
                className="w-full h-10 text-base"
              >
                Generate Final Video
              </Button>

              {finalVideoPreview && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Final Video Preview</h3>
                  <video 
                    src={finalVideoPreview} 
                    controls
                    className="w-full h-[300px] object-contain rounded-lg bg-black/5"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
