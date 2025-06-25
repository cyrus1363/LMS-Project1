import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  Image,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save
} from "lucide-react";
import { type ContentItem } from "@shared/schema";
import { type RichTextContent } from "@shared/content-types";

interface RichTextEditorProps {
  moduleId: number;
  editingContent?: ContentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function RichTextEditor({ moduleId, editingContent, onSave, onCancel }: RichTextEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  useEffect(() => {
    if (editingContent) {
      setTitle(editingContent.title);
      setIsRequired(editingContent.isRequired);
      
      // Parse existing rich text content
      if (editingContent.textContent) {
        setContent(editingContent.textContent);
      }
    }
  }, [editingContent]);

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById('rich-editor');
    if (editor) {
      setContent(editor.innerHTML);
      editor.focus();
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      applyFormatting('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter link URL:");
    if (url) {
      applyFormatting('createLink', url);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const editor = document.getElementById('rich-editor');
    const htmlContent = editor?.innerHTML || content;
    
    // Create rich text content data
    const richTextData: RichTextContent = {
      type: "rich_text",
      html: htmlContent,
      plainText: editor?.textContent || "",
      wordCount: (editor?.textContent || "").split(/\s+/).length,
      readingTime: Math.ceil((editor?.textContent || "").split(/\s+/).length / 200), // ~200 WPM
    };

    const contentData = {
      title,
      contentType: "text",
      moduleId,
      authorId: "current-user", // This should come from auth context
      isRequired,
      textContent: htmlContent,
      mediaMetadata: {
        wordCount: richTextData.wordCount,
        readingTime: richTextData.readingTime,
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
      console.error("Failed to save content:", error);
      alert("Failed to save content. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Content Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title..."
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

      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList>
              <TabsTrigger value="editor">Visual Editor</TabsTrigger>
              <TabsTrigger value="html">HTML Source</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4">
              {/* Toolbar */}
              <div className="border rounded-lg p-2 flex flex-wrap gap-1 bg-gray-50">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('bold')}
                    className="p-2"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('italic')}
                    className="p-2"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('underline')}
                    className="p-2"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('insertUnorderedList')}
                    className="p-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('insertOrderedList')}
                    className="p-2"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('justifyLeft')}
                    className="p-2"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('justifyCenter')}
                    className="p-2"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('justifyRight')}
                    className="p-2"
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Media & Links */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertImage}
                    className="p-2"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertLink}
                    className="p-2"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>

                {/* Special */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('formatBlock', 'blockquote')}
                    className="p-2"
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting('formatBlock', 'pre')}
                    className="p-2"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Editor */}
              <div
                id="rich-editor"
                contentEditable
                className="min-h-[400px] border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                style={{ fontSize: '14px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: content }}
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                onKeyDown={(e) => {
                  // Save selection for toolbar actions
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    setSelectedRange(selection.getRangeAt(0));
                  }
                }}
                suppressContentEditableWarning={true}
              />
            </TabsContent>
            
            <TabsContent value="html">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Edit HTML source code..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {editingContent ? "Update Content" : "Save Content"}
        </Button>
      </div>
    </div>
  );
}