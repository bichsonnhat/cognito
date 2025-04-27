"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ShinyText from "@/components/ShinyText/ShinyText";
import GradientText from "@/components/GradientText/GradientText";
import { Loader2 } from "lucide-react";

const AudioPage = () => {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      // Clear previous recording when starting a new one
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
        setRecordedAudio(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      // Stop all tracks on the active stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      // Clear previous recording if exists
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
        setRecordedAudio(null);
      }
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setRecordedAudio(url);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let audioUrl = null;
      if (audioFile) {
        const formAudioData = new FormData();
        formAudioData.append("file", audioFile);
        const audio_response = await fetch(`/api/cloudinary`, {
          method: "POST",
          body: formAudioData,
        });
  
        if (!audio_response.ok) {
          console.error("Failed to upload audio");
          return;
        }
  
        const audio_data = await audio_response.json();
        audioUrl = audio_data.url;
      }
      const response = await fetch("/api/audio", {
        method: "POST",
        body: JSON.stringify({ text, audioUrl }),
      });
      const data = await response.json();
      setAudioUrl(data.path);
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <GradientText
        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
        animationSpeed={3}
        showBorder={false}
        className="text-5xl font-sans"
      >
        Make your voice from text with AI
      </GradientText>
      
      <Card className="p-4 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">1</div>
            <h2 className="text-lg font-semibold">Enter Text</h2>
          </div>
          <div className="space-y-2 pl-8">
            <p className="text-sm text-muted-foreground">Type or paste the text you want to convert to speech</p>
            <Input
              placeholder="Type something to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">2</div>
            <h2 className="text-lg font-semibold">Add Audio (Optional)</h2>
          </div>
          <div className="space-y-4 pl-8">
            <p className="text-sm text-muted-foreground">Choose to record your voice or upload an audio file</p>
            <div className="flex gap-2">
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "secondary"}
                className="flex-1"
              >
                {isRecording ? "Stop Recording" : (recordedAudio ? "Record Again" : "Start Recording")}
              </Button>
              <Button
                onClick={() => audioInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                Upload Audio File
              </Button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
            </div>
            {recordedAudio && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Audio</label>
                <audio controls className="w-full mt-2">
                  <source src={recordedAudio} type={audioFile?.type || "audio/ogg"} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">3</div>
            <h2 className="text-lg font-semibold">Generate Audio</h2>
          </div>
          <div className="space-y-4 pl-8">
            <p className="text-sm text-muted-foreground">Click the button below to convert your text to speech</p>
            <Button 
              onClick={handleSubmit} 
              disabled={!text || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : "Generate Audio"}
            </Button>
          </div>
        </div>

        {audioUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">4</div>
              <h2 className="text-lg font-semibold">Listen to Generated Audio</h2>
            </div>
            <div className="space-y-2 pl-8">
              <p className="text-sm text-muted-foreground">Your generated audio is ready to play</p>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AudioPage;
