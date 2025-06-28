"use client";

import { useState, useRef, useEffect } from "react";
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
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioKey, setAudioKey] = useState(Date.now()); // Add a key to force re-render
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [predictionStatus, setPredictionStatus] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Cleanup function for audio URLs
  useEffect(() => {
    return () => {
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Effect for polling prediction status
  useEffect(() => {
    if (predictionId && !audioUrl) {
      // Start polling
      pollingIntervalRef.current = setInterval(checkPredictionStatus, 5000);
      
      // Initial check
      checkPredictionStatus();
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [predictionId]);

  const checkPredictionStatus = async () => {
    if (!predictionId) return;
    
    try {
      const response = await fetch(`/api/audio/prediction-status?id=${predictionId}`);
      const data = await response.json();
      
      setPredictionStatus(data.status);
      
      if (data.status === "succeeded" && data.audio_url) {
        setAudioUrl(data.audio_url);
        setPredictionId(null);
        setIsLoading(false);
        
        // Clear the polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else if (data.status === "failed") {
        console.error("Prediction failed:", data.error);
        setIsLoading(false);
        setPredictionId(null);
        
        // Clear the polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error checking prediction status:", error);
    }
  };

  const resetAudio = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    setRecordedAudio(null);
    setAudioFile(null);
    setAudioKey(Date.now());
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      // Reset everything
      resetAudio();
      
      // Create new URL for the new file
      const url = URL.createObjectURL(file);
      
      // Update state with new file and URL
      setAudioFile(file);
      setRecordedAudio(url);
      setAudioKey(Date.now()); // Update key to force re-render
      
      // Reset input to ensure we can select the same file again
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setAudioUrl(null);
      setPredictionId(null);
      setPredictionStatus(null);
      
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
      const response = await fetch(`/api/audio`, {
        method: "POST",
        body: JSON.stringify({ text, audioFile: audioUrl }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      
      if (data.prediction_id) {
        setPredictionId(data.prediction_id);
        setPredictionStatus("processing");
      } else if (data.audio_url) {
        // For backward compatibility
        setAudioUrl(data.audio_url);
        setIsLoading(false);
      } else {
        console.error("Unexpected response format:", data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
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
            <p className="text-sm text-muted-foreground">Upload an audio file to use as a voice reference</p>
            <div className="flex gap-2">
              <Button
                onClick={() => audioInputRef.current?.click()}
                variant="outline"
                className="w-full"
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
                <audio key={audioKey} controls className="w-full mt-2">
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
                  {predictionStatus === "processing" ? "Processing..." : "Generating..."}
                </>
              ) : "Generate Audio"}
            </Button>
            {predictionStatus && !audioUrl && (
              <p className="text-sm text-muted-foreground mt-2">
                Status: {predictionStatus === "processing" ? "Processing your audio..." : predictionStatus}
              </p>
            )}
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