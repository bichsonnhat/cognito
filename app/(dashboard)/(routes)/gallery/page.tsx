"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GradientText from "@/components/GradientText/GradientText";
import { Trash2, Download, Music, Image, Video, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface GeneratedContent {
  id: string;
  contentType: "audio" | "photo" | "video";
  contentUrl: string;
  title: string | null;
  prompt: string | null;
  createdAt: string;
}

interface ApiResponse {
  data: GeneratedContent[];
  total: number;
  hasMore: boolean;
}

const GalleryPage = () => {
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [selectedType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const typeParam = selectedType !== "all" ? `?type=${selectedType}` : "";
      const response = await fetch(`/api/generated-content${typeParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }
      
      const data: ApiResponse = await response.json();
      setContent(data.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load generated content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      setDeleting(id);
      const response = await fetch(`/api/generated-content/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      setContent(content.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const downloadContent = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading content:", error);
      toast({
        title: "Error",
        description: "Failed to download content",
        variant: "destructive",
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "audio":
        return <Music className="w-4 h-4" />;
      case "photo":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getContentBadgeColor = (type: string) => {
    switch (type) {
      case "audio":
        return "bg-blue-100 text-blue-800";
      case "photo":
        return "bg-green-100 text-green-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContentPreview = (item: GeneratedContent) => {
    switch (item.contentType) {
      case "audio":
        return (
          <audio controls className="w-full">
            <source src={item.contentUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      case "photo":
        return (
          <img
            src={item.contentUrl}
            alt={item.title || "Generated image"}
            className="w-full h-48 object-cover rounded-lg"
          />
        );
      case "video":
        return (
          <video controls className="w-full h-48 rounded-lg">
            <source src={item.contentUrl} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <GradientText
        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
        animationSpeed={3}
        showBorder={false}
        className="text-5xl font-sans"
      >
        Generated Content Gallery
      </GradientText>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {["all", "audio", "photo", "video"].map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => setSelectedType(type)}
            className="capitalize"
          >
            {type === "all" ? "All" : getContentIcon(type)}
            <span className="ml-2">{type === "all" ? "All" : type}</span>
          </Button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No generated content found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start generating audio, photos, or videos to see them here!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Card key={item.id} className="p-4 space-y-4">
              {/* Content Preview */}
              <div className="space-y-2">
                {renderContentPreview(item)}
              </div>

              {/* Content Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getContentBadgeColor(item.contentType)}>
                    {getContentIcon(item.contentType)}
                    <span className="ml-1 capitalize">{item.contentType}</span>
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>

                {item.title && (
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                )}

                {item.prompt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.prompt}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadContent(
                    item.contentUrl,
                    `${item.contentType}_${item.id}.${item.contentType === 'photo' ? 'png' : item.contentType === 'video' ? 'mp4' : 'mp3'}`
                  )}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteContent(item.id)}
                  disabled={deleting === item.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage; 