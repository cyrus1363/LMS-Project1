import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Save,
  ExternalLink,
  Eye,
  Globe,
  FileText,
  Video,
  Download
} from "lucide-react";
import { type ContentItem } from "@shared/schema";

interface LinkFormProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function LinkForm({ moduleId, editingContent, onSave, onCancel }: LinkFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [settings, setSettings] = useState({
    openInNewTab: true,
    showPreview: true,
    trackClicks: true,
    requireConfirmation: false,
    estimatedReadTime: 0, // minutes
  });
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (editingContent) {
      setTitle(editingContent.title);
      setDescription(editingContent.textContent || "");
      setUrl(editingContent.externalUrl || "");
      setIsRequired(editingContent.isRequired);
      
      if (editingContent.mediaMetadata) {
        setSettings({ ...settings, ...editingContent.mediaMetadata });
      }
    }
  }, [editingContent]);

  const getLinkType = (url: string) => {
    if (!url) return "unknown";
    
    const lower = url.toLowerCase();
    
    if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com")) {
      return "video";
    }
    
    if (lower.includes(".pdf")) {
      return "pdf";
    }
    
    if (lower.match(/\.(doc|docx|ppt|pptx|xls|xlsx)$/)) {
      return "document";
    }
    
    if (lower.match(/\.(zip|rar|tar|gz)$/)) {
      return "archive";
    }
    
    return "website";
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "pdf":
      case "document": return FileText;
      case "archive": return Download;
      default: return Globe;
    }
  };

  const getLinkTypeLabel = (type: string) => {
    switch (type) {
      case "video": return "Video";
      case "pdf": return "PDF Document";
      case "document": return "Document";
      case "archive": return "Archive";
      default: return "Website";
    }
  };

  const fetchLinkPreview = async () => {
    if (!url || !isValidUrl(url)) return;
    
    setIsLoadingPreview(true);
    try {
      // In a real implementation, you'd call a backend service
      // that safely fetches link metadata
      const mockPreview = {
        title: "Link Preview Title",
        description: "This would be the meta description from the linked page...",
        image: null,
        siteName: new URL(url).hostname,
      };
      setLinkPreview(mockPreview);
    } catch (error) {
      console.error("Failed to fetch link preview:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!url.trim()) {
      alert("Please provide a URL");
      return;
    }

    if (!isValidUrl(url)) {
      alert("Please enter a valid URL");
      return;
    }

    const linkType = getLinkType(url);

    const contentData = {
      title,
      contentType: "link",
      moduleId,
      authorId: "current-user", // Should come from auth context
      isRequired,
      textContent: description,
      externalUrl: url,
      mediaMetadata: {
        linkType,
        ...settings,
        preview: linkPreview,
      },
    };

    try {
      const url_endpoint = editingContent 
        ? `/api/content/${editingContent.id}` 
        : "/api/content";
      
      const method = editingContent ? "PUT" : "POST";
      
      await fetch(url_endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      
      onSave();
    } catch (error) {
      console.error("Failed to save link:", error);
      alert("Failed to save link. Please try again.");
    }
  };

  const linkType = getLinkType(url);
  const LinkIcon = getLinkIcon(linkType);

  return (
    <div className="space-y-6 p-4">
      {/* Link Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Link Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter descriptive title..."
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
        <Label htmlFor="url">URL *</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1"
          />
          <Button 
            variant="outline" 
            onClick={fetchLinkPreview}
            disabled={!url || !isValidUrl(url) || isLoadingPreview}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
        {url && !isValidUrl(url) && (
          <p className="text-sm text-red-600 mt-1">Please enter a valid URL</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what students will find at this link..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Link Type & Preview */}
      {url && isValidUrl(url) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Link Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2">
                <LinkIcon className="w-4 h-4" />
                {getLinkTypeLabel(linkType)}
              </Badge>
              <span className="text-sm text-gray-600">{new URL(url).hostname}</span>
            </div>

            {linkPreview && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Link Preview</h4>
                <div className="space-y-2">
                  <p className="font-medium text-sm">{linkPreview.title}</p>
                  <p className="text-sm text-gray-600">{linkPreview.description}</p>
                  <p className="text-xs text-gray-500">{linkPreview.siteName}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Link Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Link Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.openInNewTab}
                  onCheckedChange={(checked) => setSettings({...settings, openInNewTab: checked})}
                />
                <Label>Open in new tab</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.showPreview}
                  onCheckedChange={(checked) => setSettings({...settings, showPreview: checked})}
                />
                <Label>Show link preview</Label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.trackClicks}
                  onCheckedChange={(checked) => setSettings({...settings, trackClicks: checked})}
                />
                <Label>Track clicks</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.requireConfirmation}
                  onCheckedChange={(checked) => setSettings({...settings, requireConfirmation: checked})}
                />
                <Label>Require confirmation before leaving</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>Estimated Reading/Viewing Time (minutes)</Label>
            <Input
              type="number"
              value={settings.estimatedReadTime}
              onChange={(e) => setSettings({...settings, estimatedReadTime: parseInt(e.target.value) || 0})}
              min="0"
              placeholder="0"
              className="mt-1 w-32"
            />
            <p className="text-sm text-gray-600 mt-1">
              Help students plan their time (0 = no estimate shown)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Link Preview for Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Student View Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LinkIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-lg">{title || "Link Title"}</h4>
                {description && (
                  <p className="text-gray-600 mt-1">{description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    {url ? new URL(url).hostname : "example.com"}
                  </span>
                  {settings.estimatedReadTime > 0 && (
                    <span>{settings.estimatedReadTime} min read</span>
                  )}
                  <Badge variant="outline">{getLinkTypeLabel(linkType)}</Badge>
                </div>
              </div>
              <Button className="gap-2" size="sm">
                <ExternalLink className="w-4 h-4" />
                Visit Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save/Cancel Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {editingContent ? "Update Link" : "Save Link"}
        </Button>
      </div>
    </div>
  );
}