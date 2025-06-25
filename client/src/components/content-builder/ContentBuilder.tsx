import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Video, 
  AudioLines, 
  FileDown, 
  ClipboardList, 
  MessageSquare, 
  ExternalLink,
  Move,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { type ContentItem } from "@shared/schema";
import { type ContentData } from "@shared/content-types";
import RichTextEditor from "./RichTextEditor";
import VideoContentForm from "./VideoContentForm";
import QuizBuilder from "./QuizBuilder";
import AssignmentForm from "./AssignmentForm";
import DiscussionForm from "./DiscussionForm";
import LinkForm from "./LinkForm";
import DocumentUpload from "./DocumentUpload";

interface ContentBuilderProps {
  moduleId: number;
  contentItems: ContentItem[];
  onContentUpdate: () => void;
}

const contentTypeConfig = {
  text: { 
    icon: FileText, 
    label: "Rich Text", 
    color: "bg-blue-500",
    description: "Add formatted text, images, and media"
  },
  video: { 
    icon: Video, 
    label: "Video", 
    color: "bg-red-500",
    description: "Upload or embed video content"
  },
  audio: { 
    icon: AudioLines, 
    label: "Audio", 
    color: "bg-purple-500",
    description: "Add audio recordings or podcasts"
  },
  document: { 
    icon: FileDown, 
    label: "Document", 
    color: "bg-green-500",
    description: "Upload PDFs, presentations, or files"
  },
  quiz: { 
    icon: ClipboardList, 
    label: "Quiz/Assessment", 
    color: "bg-orange-500",
    description: "Create interactive quizzes and tests"
  },
  assignment: { 
    icon: Edit, 
    label: "Assignment", 
    color: "bg-indigo-500",
    description: "Create assignments with rubrics"
  },
  discussion: { 
    icon: MessageSquare, 
    label: "Discussion", 
    color: "bg-pink-500",
    description: "Start discussion forums"
  },
  link: { 
    icon: ExternalLink, 
    label: "External Link", 
    color: "bg-cyan-500",
    description: "Link to external resources"
  },
};

export default function ContentBuilder({ moduleId, contentItems, onContentUpdate }: ContentBuilderProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<keyof typeof contentTypeConfig | null>(null);

  const handleCreateContent = async (contentType: keyof typeof contentTypeConfig) => {
    setSelectedContentType(contentType);
    setEditingContent(null);
    setShowAddDialog(true);
  };

  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content);
    setSelectedContentType(content.contentType as keyof typeof contentTypeConfig);
    setShowAddDialog(true);
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    
    try {
      await fetch(`/api/content/${contentId}`, { method: "DELETE" });
      onContentUpdate();
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const togglePublished = async (contentId: number, isPublished: boolean) => {
    try {
      await fetch(`/api/content/${contentId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });
      onContentUpdate();
    } catch (error) {
      console.error("Failed to update publish status:", error);
    }
  };

  const renderContentForm = () => {
    if (!selectedContentType) return null;

    const baseProps = {
      moduleId,
      editingContent,
      onSave: () => {
        setShowAddDialog(false);
        onContentUpdate();
      },
      onCancel: () => setShowAddDialog(false),
    };

    switch (selectedContentType) {
      case "text":
        return <RichTextEditor {...baseProps} />;
      case "video":
        return <VideoContentForm {...baseProps} />;
      case "quiz":
        return <QuizBuilder {...baseProps} />;
      case "assignment":
        return <AssignmentForm {...baseProps} />;
      case "discussion":
        return <DiscussionForm {...baseProps} />;
      case "link":
        return <LinkForm {...baseProps} />;
      case "document":
        return <DocumentUpload {...baseProps} />;
      default:
        return <div>Content type not implemented yet</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Course Content</span>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Content
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No content yet</h3>
              <p className="mb-4">Start building your course by adding your first content item.</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Content
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contentItems.map((item, index) => {
                const config = contentTypeConfig[item.contentType as keyof typeof contentTypeConfig];
                const Icon = config?.icon || FileText;
                
                return (
                  <Card key={item.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config?.color || 'bg-gray-500'} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {config?.label || item.contentType}
                              </Badge>
                              {item.isRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {item.isPublished ? (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePublished(item.id, !item.isPublished)}
                          >
                            {item.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContent(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="cursor-move">
                            <Move className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Content Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? "Edit Content" : selectedContentType ? `Add ${contentTypeConfig[selectedContentType]?.label}` : "Choose Content Type"}
            </DialogTitle>
          </DialogHeader>
          
          {!selectedContentType ? (
            <div className="grid grid-cols-2 gap-4 p-4">
              {Object.entries(contentTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <Card 
                    key={type}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCreateContent(type as keyof typeof contentTypeConfig)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-lg ${config.color} text-white flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-medium mb-2">{config.label}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            renderContentForm()
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}