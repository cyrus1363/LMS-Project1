import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  FileVideo,
  FileDown,
  Save,
  Trash2,
  Eye
} from "lucide-react";
import { type ContentItem } from "@shared/schema";

interface DocumentUploadProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function DocumentUpload({ moduleId, editingContent, onSave, onCancel }: DocumentUploadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState("");
  const [settings, setSettings] = useState({
    allowDownload: true,
    showInBrowser: true,
    requireCompletion: false,
    trackViews: true,
    allowAnnotations: false,
  });

  useEffect(() => {
    if (editingContent) {
      setTitle(editingContent.title);
      setDescription(editingContent.textContent || "");
      setIsRequired(editingContent.isRequired);
      setExistingFileUrl(editingContent.mediaUrl || "");
      
      if (editingContent.mediaMetadata) {
        setSettings({ ...settings, ...editingContent.mediaMetadata });
      }
    }
  }, [editingContent]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return FileText;
      case 'doc':
      case 'docx':
        return FileText;
      case 'ppt':
      case 'pptx':
        return FileText;
      case 'xls':
      case 'xlsx':
        return FileText;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return FileImage;
      case 'mp4':
      case 'avi':
      case 'mov':
        return FileVideo;
      default:
        return File;
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'Video';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!uploadedFile && !existingFileUrl) {
      alert("Please upload a file or provide a file URL");
      return;
    }

    // In a real implementation, you would upload the file first
    let fileUrl = existingFileUrl;
    
    if (uploadedFile) {
      // Mock file upload - in reality you'd upload to your file storage service
      fileUrl = `/uploads/${uploadedFile.name}`;
    }

    const contentData = {
      title,
      contentType: "document",
      moduleId,
      authorId: "current-user", // Should come from auth context
      isRequired,
      textContent: description,
      mediaUrl: fileUrl,
      mediaMetadata: {
        fileName: uploadedFile?.name || existingFileUrl.split('/').pop(),
        fileSize: uploadedFile?.size || 0,
        fileType: uploadedFile ? getFileType(uploadedFile.name) : 'Document',
        uploadedAt: new Date().toISOString(),
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
      console.error("Failed to save document:", error);
      alert("Failed to save document. Please try again.");
    }
  };

  const currentFile = uploadedFile || (existingFileUrl ? { name: existingFileUrl.split('/').pop() || 'Document' } : null);
  const FileIcon = currentFile ? getFileIcon(currentFile.name) : File;

  return (
    <div className="space-y-6 p-4">
      {/* Document Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Document Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title..."
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
          placeholder="Describe what's in this document..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Document File
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="fileInput"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
              />
              <label htmlFor="fileInput">
                <Button variant="outline" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Supported: PDF, Word, PowerPoint, Excel, Images, Videos (max 50MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentFile.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>{getFileType(currentFile.name)}</span>
                    {uploadedFile && <span>{formatFileSize(uploadedFile.size)}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setExistingFileUrl("");
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {existingFileUrl && (
            <div className="mt-4">
              <Label>Or File URL</Label>
              <Input
                value={existingFileUrl}
                onChange={(e) => setExistingFileUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowDownload}
                  onCheckedChange={(checked) => setSettings({...settings, allowDownload: checked})}
                />
                <Label>Allow download</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.showInBrowser}
                  onCheckedChange={(checked) => setSettings({...settings, showInBrowser: checked})}
                />
                <Label>Show in browser viewer</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.trackViews}
                  onCheckedChange={(checked) => setSettings({...settings, trackViews: checked})}
                />
                <Label>Track document views</Label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.requireCompletion}
                  onCheckedChange={(checked) => setSettings({...settings, requireCompletion: checked})}
                />
                <Label>Mark as complete when viewed</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowAnnotations}
                  onCheckedChange={(checked) => setSettings({...settings, allowAnnotations: checked})}
                />
                <Label>Allow student annotations</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview */}
      {currentFile && (
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
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-lg">{title || "Document Title"}</h4>
                  {description && (
                    <p className="text-gray-600 mt-1">{description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <Badge variant="outline">{getFileType(currentFile.name)}</Badge>
                    {uploadedFile && <span>{formatFileSize(uploadedFile.size)}</span>}
                    {settings.allowDownload && <span>📥 Downloadable</span>}
                    {settings.showInBrowser && <span>👁️ Browser viewable</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {settings.showInBrowser && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  )}
                  {settings.allowDownload && (
                    <Button size="sm" className="gap-2">
                      <FileDown className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save/Cancel Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {editingContent ? "Update Document" : "Save Document"}
        </Button>
      </div>
    </div>
  );
}