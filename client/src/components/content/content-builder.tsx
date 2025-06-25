import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Video, 
  FileText, 
  MessageSquare, 
  Brain,
  Plus,
  Save,
  Eye,
  Settings,
  Upload,
  Link as LinkIcon,
  Palette
} from "lucide-react";

interface ContentBuilderProps {
  classId: string;
  onContentSaved?: () => void;
}

interface ContentPage {
  id?: number;
  title: string;
  content: string;
  type: "lesson" | "assessment" | "resource" | "scorm";
  isPublished: boolean;
  orderIndex: number;
  metadata?: any;
}

const contentTypes = [
  { value: "lesson", label: "Lesson", icon: BookOpen, description: "Text-based learning content" },
  { value: "assessment", label: "Assessment", icon: FileText, description: "Quiz or test" },
  { value: "resource", label: "Resource", icon: LinkIcon, description: "Files, links, or references" },
  { value: "scorm", label: "SCORM Package", icon: Video, description: "Interactive multimedia content" },
];

export default function ContentBuilder({ classId, onContentSaved }: ContentBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [contentData, setContentData] = useState<ContentPage>({
    title: "",
    content: "",
    type: "lesson",
    isPublished: false,
    orderIndex: 1,
  });

  const [activeTab, setActiveTab] = useState("editor");

  const createContentMutation = useMutation({
    mutationFn: async (data: ContentPage) => {
      const response = await apiRequest("POST", "/api/content", {
        ...data,
        classId: parseInt(classId),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Created Successfully",
        description: "Your content has been saved and is now available to students.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "content"] });
      onContentSaved?.();
      // Reset form
      setContentData({
        title: "",
        content: "",
        type: "lesson",
        isPublished: false,
        orderIndex: 1,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Content",
        description: error.message || "There was an error saving your content.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!contentData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your content.",
        variant: "destructive",
      });
      return;
    }

    if (!contentData.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content before saving.",
        variant: "destructive",
      });
      return;
    }

    createContentMutation.mutate(contentData);
  };

  const selectedType = contentTypes.find(type => type.value === contentData.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Builder</h3>
          <p className="text-sm text-gray-600">Create engaging learning materials for your class</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setContentData({ ...contentData, isPublished: !contentData.isPublished })}
          >
            <Eye className="h-4 w-4 mr-2" />
            {contentData.isPublished ? "Published" : "Draft"}
          </Button>
          <Button onClick={handleSave} disabled={createContentMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createContentMutation.isPending ? "Saving..." : "Save Content"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedType && <selectedType.icon className="h-5 w-5" />}
                Content Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={contentData.title}
                    onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                    placeholder="Enter content title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select
                    value={contentData.type}
                    onValueChange={(value: any) => setContentData({ ...contentData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={contentData.content}
                  onChange={(e) => setContentData({ ...contentData, content: e.target.value })}
                  placeholder="Enter your content here..."
                  rows={12}
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Publish Status</Label>
                  <p className="text-sm text-gray-600">
                    Published content is visible to students
                  </p>
                </div>
                <Switch
                  checked={contentData.isPublished}
                  onCheckedChange={(checked) => 
                    setContentData({ ...contentData, isPublished: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order Index</Label>
                <Input
                  id="order"
                  type="number"
                  value={contentData.orderIndex}
                  onChange={(e) => 
                    setContentData({ ...contentData, orderIndex: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                  min="1"
                />
                <p className="text-xs text-gray-500">
                  Content will be displayed in this order to students
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Student Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{contentData.title || "Untitled Content"}</h3>
                  <Badge variant="outline" className="mb-4">
                    {selectedType?.label}
                  </Badge>
                </div>
                <div className="prose max-w-none">
                  {contentData.content ? (
                    <div className="whitespace-pre-wrap">{contentData.content}</div>
                  ) : (
                    <p className="text-gray-500 italic">No content added yet...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}