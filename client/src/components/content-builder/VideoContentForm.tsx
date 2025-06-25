import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Link,
  Save,
  Play,
  Settings,
  Clock,
  Volume2
} from "lucide-react";
import { type ContentItem } from "@shared/schema";

interface VideoContentFormProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function VideoContentForm({ moduleId, editingContent, onSave, onCancel }: VideoContentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [videoType, setVideoType] = useState<"upload" | "embed">("embed");
  const [videoUrl, setVideoUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [settings, setSettings] = useState({
    autoplay: false,
    controls: true,
    loop: false,
    showTranscript: false,
    allowDownload: false,
    startTime: 0,
    endTime: 0,
  });

  useEffect(() => {
    if (editingContent) {
      setTitle(editingContent.title);
      setDescription(editingContent.textContent || "");
      setIsRequired(editingContent.isRequired);
      
      if (editingContent.mediaUrl) {
        setVideoUrl(editingContent.mediaUrl);
        setVideoType("embed");
      }
      
      if (editingContent.embedCode) {
        setEmbedCode(editingContent.embedCode);
        setVideoType("embed");
      }
      
      if (editingContent.mediaMetadata) {
        setSettings({ ...settings, ...editingContent.mediaMetadata });
      }
    }
  }, [editingContent]);

  const getVideoPreview = () => {
    if (videoType === "embed" && videoUrl) {
      // Handle YouTube URLs
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Handle Vimeo URLs
      if (videoUrl.includes("vimeo.com")) {
        const videoId = extractVimeoId(videoUrl);
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }
      
      // Direct video URL
      return videoUrl;
    }
    
    return null;
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (videoType === "embed" && !videoUrl && !embedCode) {
      alert("Please provide a video URL or embed code");
      return;
    }

    const contentData = {
      title,
      contentType: "video",
      moduleId,
      authorId: "current-user", // Should come from auth context
      isRequired,
      textContent: description,
      mediaUrl: videoType === "embed" ? videoUrl : undefined,
      embedCode: embedCode || undefined,
      mediaMetadata: {
        videoType,
        duration: 0, // Would be extracted from video metadata
        ...settings,
      },
    };

    try {
      const url = editingContent 
        ? `/api/content/${editingContent.id}` 
        : "/api/content";
      
      const method = editingContent ? "PUT" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      
      onSave();
    } catch (error) {
      console.error("Failed to save video content:", error);
      alert("Failed to save video content. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Video Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title..."
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="required"
            checked={isRequired}
            onCheckedChange={setIsRequired}
          />
          <Label htmlFor="required">Required for completion</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what students will learn from this video..."
          className="mt-1"
          rows={3}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={videoType} onValueChange={(value) => setVideoType(value as "upload" | "embed")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="embed" className="gap-2">
                <Link className="w-4 h-4" />
                Video URL / Embed
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Video
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="embed" className="space-y-4">
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Supports YouTube, Vimeo, and direct video file URLs
                </p>
              </div>

              <div>
                <Label htmlFor="embedCode">Or Custom Embed Code</Label>
                <Textarea
                  id="embedCode"
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  placeholder="<iframe src=... ></iframe>"
                  className="mt-1"
                  rows={4}
                />
              </div>

              {getVideoPreview() && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {embedCode ? (
                      <div dangerouslySetInnerHTML={{ __html: embedCode }} />
                    ) : (
                      <iframe
                        src={getVideoPreview()!}
                        className="w-full h-full"
                        allowFullScreen
                        title="Video preview"
                      />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Video File</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your video file here, or click to browse
                </p>
                <Button variant="outline">
                  Choose File
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: MP4, WebM, MOV (max 500MB)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Video Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.autoplay}
                  onCheckedChange={(checked) => setSettings({...settings, autoplay: checked})}
                />
                <Label>Autoplay video</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.controls}
                  onCheckedChange={(checked) => setSettings({...settings, controls: checked})}
                />
                <Label>Show video controls</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.loop}
                  onCheckedChange={(checked) => setSettings({...settings, loop: checked})}
                />
                <Label>Loop video</Label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.showTranscript}
                  onCheckedChange={(checked) => setSettings({...settings, showTranscript: checked})}
                />
                <Label>Show transcript</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowDownload}
                  onCheckedChange={(checked) => setSettings({...settings, allowDownload: checked})}
                />
                <Label>Allow download</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time (seconds)</Label>
              <Input
                type="number"
                value={settings.startTime}
                onChange={(e) => setSettings({...settings, startTime: parseInt(e.target.value) || 0})}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label>End Time (seconds, 0 = full video)</Label>
              <Input
                type="number"
                value={settings.endTime}
                onChange={(e) => setSettings({...settings, endTime: parseInt(e.target.value) || 0})}
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {editingContent ? "Update Video" : "Save Video"}
        </Button>
      </div>
    </div>
  );
}