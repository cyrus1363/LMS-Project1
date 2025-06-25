import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save,
  MessageSquare,
  Users,
  Shield,
  Eye
} from "lucide-react";
import { type ContentItem } from "@shared/schema";

interface DiscussionFormProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function DiscussionForm({ moduleId, editingContent, onSave, onCancel }: DiscussionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [settings, setSettings] = useState({
    isPublic: true,
    allowAnonymous: false,
    moderationRequired: false,
    autoLockAfterDays: 0, // 0 = never lock
    minimumPosts: 1,
    allowFileAttachments: true,
    allowLikes: true,
    allowReplies: true,
    maxPostLength: 1000,
  });

  useEffect(() => {
    if (editingContent && editingContent.discussionData) {
      const discussionData = editingContent.discussionData as any;
      setTitle(editingContent.title);
      setDescription(editingContent.textContent || "");
      setPrompt(discussionData.prompt || "");
      setIsRequired(editingContent.isRequired);
      setSettings(discussionData.settings || settings);
    }
  }, [editingContent]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a discussion title");
      return;
    }

    if (!prompt.trim()) {
      alert("Please provide a discussion prompt");
      return;
    }

    const discussionData = {
      type: "discussion",
      prompt,
      settings,
    };

    const contentData = {
      title,
      contentType: "discussion",
      moduleId,
      authorId: "current-user", // Should come from auth context
      isRequired,
      textContent: description,
      discussionData,
      mediaMetadata: {
        minimumPosts: settings.minimumPosts,
        allowAnonymous: settings.allowAnonymous,
        moderationRequired: settings.moderationRequired,
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
      console.error("Failed to save discussion:", error);
      alert("Failed to save discussion. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Discussion Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Discussion Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter discussion title..."
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
          placeholder="Describe the purpose of this discussion..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="prompt">Discussion Prompt *</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What question or topic do you want students to discuss? Be specific and engaging..."
          className="mt-1"
          rows={4}
        />
      </div>

      {/* Discussion Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discussion Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participation
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.isPublic}
                    onCheckedChange={(checked) => setSettings({...settings, isPublic: checked})}
                  />
                  <Label>Public to all enrolled students</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.allowAnonymous}
                    onCheckedChange={(checked) => setSettings({...settings, allowAnonymous: checked})}
                  />
                  <Label>Allow anonymous posts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.allowReplies}
                    onCheckedChange={(checked) => setSettings({...settings, allowReplies: checked})}
                  />
                  <Label>Allow replies to posts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.allowLikes}
                    onCheckedChange={(checked) => setSettings({...settings, allowLikes: checked})}
                  />
                  <Label>Allow likes/upvotes</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Moderation
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.moderationRequired}
                    onCheckedChange={(checked) => setSettings({...settings, moderationRequired: checked})}
                  />
                  <Label>Require post approval</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.allowFileAttachments}
                    onCheckedChange={(checked) => setSettings({...settings, allowFileAttachments: checked})}
                  />
                  <Label>Allow file attachments</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label>Minimum Posts Required</Label>
              <Input
                type="number"
                value={settings.minimumPosts}
                onChange={(e) => setSettings({...settings, minimumPosts: parseInt(e.target.value) || 1})}
                min="1"
                max="10"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Max Characters per Post</Label>
              <Input
                type="number"
                value={settings.maxPostLength}
                onChange={(e) => setSettings({...settings, maxPostLength: parseInt(e.target.value) || 1000})}
                min="100"
                max="5000"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Auto-lock after (days, 0 = never)</Label>
              <Input
                type="number"
                value={settings.autoLockAfterDays}
                onChange={(e) => setSettings({...settings, autoLockAfterDays: parseInt(e.target.value) || 0})}
                min="0"
                max="365"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Discussion Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">{title || "Discussion Title"}</h3>
            {description && (
              <p className="text-gray-600 mb-4">{description}</p>
            )}
            <div className="bg-white p-4 rounded border">
              <p className="font-medium text-sm text-gray-700 mb-2">Discussion Prompt:</p>
              <p>{prompt || "Your discussion prompt will appear here..."}</p>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>💬 {settings.allowReplies ? "Replies allowed" : "No replies"}</span>
              <span>👤 {settings.allowAnonymous ? "Anonymous allowed" : "Names required"}</span>
              <span>📎 {settings.allowFileAttachments ? "Attachments allowed" : "Text only"}</span>
              {settings.moderationRequired && <span>🛡️ Moderated</span>}
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
          {editingContent ? "Update Discussion" : "Save Discussion"}
        </Button>
      </div>
    </div>
  );
}