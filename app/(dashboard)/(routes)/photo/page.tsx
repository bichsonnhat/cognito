"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import GradientText from "@/components/GradientText/GradientText";
import ShinyText from "@/components/ShinyText/ShinyText";
import Loading from "@/components/loading";
import { useToast } from "@/components/ui/use-toast";
import { useProStore } from "@/stores/pro-store";

const PhotoPage = () => {
  const { handleOpenOrCloseProModal } = useProStore();
  const { toast } = useToast();
  
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string>("");
  const [targetPreview, setTargetPreview] = useState<string>("");
  const [resultPreview, setResultPreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImage(file);
      const url = URL.createObjectURL(file);
      setSourcePreview(url);
    }
  };

  const handleTargetImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setTargetImage(file);
      const url = URL.createObjectURL(file);
      setTargetPreview(url);
    }
  };

  const handleSourceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImage(file);
      const url = URL.createObjectURL(file);
      setSourcePreview(url);
    }
  };

  const handleTargetDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setTargetImage(file);
      const url = URL.createObjectURL(file);
      setTargetPreview(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleGenerateFaceSwap = async () => {
    if (!sourceImage || !targetImage) {
      toast({
        variant: "destructive",
        description: "Please upload both source and target images."
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Upload source image
      const sourceFormData = new FormData();
      sourceFormData.append("file", sourceImage);
      const sourceResponse = await fetch(`/api/cloudinary`, {
        method: "POST",
        body: sourceFormData,
      });

      if (!sourceResponse.ok) {
        throw new Error("Failed to upload source image");
      }

      const sourceData = await sourceResponse.json();
      console.log("sourceData", sourceData);

      // Upload target image
      const targetFormData = new FormData();
      targetFormData.append("file", targetImage);
      const targetResponse = await fetch(`/api/cloudinary`, {
        method: "POST",
        body: targetFormData,
      });

      if (!targetResponse.ok) {
        throw new Error("Failed to upload target image");
      }

      const targetData = await targetResponse.json();
      console.log("targetData", targetData);

      // Generate face swap
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/faceswap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceImage: sourceData.url, targetImage: targetData.url }),
      });

      if (response.ok) {
        const data = await response.json();
        setResultPreview(data.image_path);
      } else {
        console.error("Failed to generate image");
      }

    } catch (error: any) {
      if (error?.response?.status === 403) {
        handleOpenOrCloseProModal();
      } else {
        toast({
          variant: "destructive",
          description: "Failed to generate face swap. Please try again."
        });
        console.error("Error generating face swap:", error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full relative">
      <div className="p-4 space-y-8 pb-20 overflow-y-auto h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between">
          <GradientText
            colors={["#ff40aa", "#4079ff", "#ff40aa", "#4079ff", "#ff40aa"]}
            animationSpeed={3}
            showBorder={false}
            className="text-5xl font-sans"
          >
            AI Face Swap
          </GradientText>
        </div>

        <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
          {/* Step 1: Source Image Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">1</span>
                Upload Source Face
              </h2>
              <p className="text-gray-500 text-sm ml-10">
                Upload an image with the face you want to use as the source.
                We support JPG, PNG, and WebP formats.
              </p>
            </div>

            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer"
              onClick={() => sourceInputRef.current?.click()}
              onDrop={handleSourceDrop}
              onDragOver={handleDragOver}
            >
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleSourceImageUpload}
                ref={sourceInputRef}
              />
              
              <div className="space-y-4">
                <div className="text-gray-500">
                  Drag and drop your source image here, or click to select
                </div>
                <div className="text-sm text-gray-400">
                  Supported formats: JPG, PNG, WebP
                </div>
              </div>
            </div>

            {sourcePreview && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Source Image Preview</h3>
                <div className="relative w-full h-[300px]">
                  <Image 
                    src={sourcePreview}
                    fill
                    className="object-contain rounded-lg"
                    alt="Source face"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Target Image Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">2</span>
                Upload Target Image
              </h2>
              <p className="text-gray-500 text-sm ml-10">
                Upload the image where you want to place the source face.
              </p>
            </div>

            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer"
              onClick={() => targetInputRef.current?.click()}
              onDrop={handleTargetDrop}
              onDragOver={handleDragOver}
            >
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleTargetImageUpload}
                ref={targetInputRef}
              />
              
              <div className="space-y-4">
                <div className="text-gray-500">
                  Drag and drop your target image here, or click to select
                </div>
                <div className="text-sm text-gray-400">
                  Supported formats: JPG, PNG, WebP
                </div>
              </div>
            </div>

            {targetPreview && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Target Image Preview</h3>
                <div className="relative w-full h-[300px]">
                  <Image 
                    src={targetPreview}
                    fill
                    className="object-contain rounded-lg"
                    alt="Target image"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Generate Face Swap */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">3</span>
                Generate Face Swap
              </h2>
              <p className="text-gray-500 text-sm ml-10">
                Click the button below to swap the face from the source image onto the target image.
              </p>
            </div>

            <Button
              onClick={handleGenerateFaceSwap}
              variant="default"
              className="w-full h-10 text-base"
              disabled={!sourceImage || !targetImage || isGenerating}
            >
              <ShinyText className="bg-black" text={isGenerating ? "Generating..." : "Swap Faces"} />
            </Button>

            {isGenerating && (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            )}

            {resultPreview && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Face Swap Result</h3>
                <div className="relative w-full h-[300px]">
                  <Image 
                    src={resultPreview}
                    fill
                    className="object-contain rounded-lg"
                    alt="Face swap result"
                  />
                </div>
                <a href={resultPreview} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-4">
                    Download Result
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPage;