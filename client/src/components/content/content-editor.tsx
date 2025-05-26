import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Undo,
  Redo,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Target,
  Play,
  MessageSquare,
  BookOpen
} from "lucide-react";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ContentEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your content here...",
  className = ""
}: ContentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiResults, setAIResults] = useState<any>(null);
  const [showActivityGenerator, setShowActivityGenerator] = useState(false);
  const [activityResults, setActivityResults] = useState<any>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<'quiz' | 'roleplay' | 'discussion'>('quiz');
  const { toast } = useToast();

  const improveContentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/ai/improve-content", { content });
      return response.json();
    },
    onSuccess: (data) => {
      setAIResults(data);
      setShowAIDialog(true);
      toast({
        title: "AI Analysis Complete",
        description: "Content improvements and quiz questions generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to improve content with AI",
        variant: "destructive",
      });
    },
  });

  const generateActivityMutation = useMutation({
    mutationFn: async (activityType: 'quiz' | 'roleplay' | 'discussion') => {
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      const response = await apiRequest("POST", "/api/ai/generate-activity", {
        content: textContent,
        activityType
      });
      return response.json();
    },
    onSuccess: (data) => {
      setActivityResults(data);
      toast({
        title: "Activity Generated",
        description: `${selectedActivityType.charAt(0).toUpperCase() + selectedActivityType.slice(1)} activity created successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to generate activity",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      executeCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const handleAIImprove = () => {
    if (!value || value.trim().length < 50) {
      toast({
        title: "Not enough content",
        description: "Please add at least 50 characters of content for AI to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    const textContent = value.replace(/<[^>]*>/g, '').trim();
    improveContentMutation.mutate(textContent);
  };

  const applyImprovedContent = () => {
    if (aiResults?.improved) {
      onChange(aiResults.improved);
      setShowAIDialog(false);
      toast({
        title: "Content Updated",
        description: "AI improvements have been applied to your content.",
      });
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      command: 'bold',
      tooltip: 'Bold (Ctrl+B)'
    },
    {
      icon: Italic,
      command: 'italic',
      tooltip: 'Italic (Ctrl+I)'
    },
    {
      icon: Underline,
      command: 'underline',
      tooltip: 'Underline (Ctrl+U)'
    },
    {
      separator: true
    },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      tooltip: 'Align Left'
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      tooltip: 'Align Center'
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      tooltip: 'Align Right'
    },
    {
      separator: true
    },
    {
      icon: List,
      command: 'insertUnorderedList',
      tooltip: 'Bullet List'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      tooltip: 'Numbered List'
    },
    {
      separator: true
    },
    {
      icon: Quote,
      command: 'formatBlock',
      value: 'blockquote',
      tooltip: 'Quote'
    },
    {
      icon: Code,
      command: 'formatBlock',
      value: 'pre',
      tooltip: 'Code Block'
    },
    {
      separator: true
    },
    {
      icon: Link,
      command: 'createLink',
      tooltip: 'Insert Link',
      onClick: () => {
        const url = prompt('Enter URL:');
        if (url) {
          executeCommand('createLink', url);
        }
      }
    },
    {
      separator: true
    },
    {
      icon: Undo,
      command: 'undo',
      tooltip: 'Undo (Ctrl+Z)'
    },
    {
      icon: Redo,
      command: 'redo',
      tooltip: 'Redo (Ctrl+Y)'
    },
    {
      separator: true
    },
    {
      icon: Sparkles,
      tooltip: 'AI Assistant - Improve content and generate quiz questions',
      onClick: handleAIImprove,
      isAI: true
    },
    {
      separator: true
    },
    {
      icon: Target,
      tooltip: 'Generate Activity - Create quizzes, roleplays, or discussions from content',
      onClick: () => setShowActivityGenerator(true),
      isActivity: true
    }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        {toolbarButtons.map((button, index) => {
          if (button.separator) {
            return <Separator key={index} orientation="vertical" className="h-6 mx-1" />;
          }

          const Icon = button.icon!;
          return (
            <Button
              key={index}
              type="button"
              variant={button.isAI ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${button.isAI ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' : ''}`}
              title={button.tooltip}
              onClick={button.onClick || (() => executeCommand(button.command!, button.value))}
              disabled={button.isAI && improveContentMutation.isPending}
            >
              <Icon className={`h-4 w-4 ${button.isAI ? 'text-white' : ''}`} />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`min-h-[200px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''
        }`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
      />

      {/* AI Assistant Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Content Assistant
            </DialogTitle>
            <DialogDescription>
              AI-powered improvements and quiz questions for your content
            </DialogDescription>
          </DialogHeader>

          {aiResults && (
            <Tabs defaultValue="improvements" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="quiz">Quiz Questions</TabsTrigger>
              </TabsList>

              <TabsContent value="improvements" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Improved Content</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div dangerouslySetInnerHTML={{ __html: aiResults.improved }} />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={applyImprovedContent}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Apply Improvements
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content Suggestions</h4>
                  <div className="space-y-2">
                    {aiResults.suggestions?.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Generated Quiz Questions</h4>
                  <div className="space-y-4">
                    {aiResults.quizQuestions?.map((quiz: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-3">Question {index + 1}</h5>
                        <p className="mb-3">{quiz.question}</p>
                        <div className="space-y-2">
                          {quiz.options?.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <Badge variant={optIndex === quiz.correct ? "default" : "outline"}>
                                {String.fromCharCode(65 + optIndex)}
                              </Badge>
                              <span className={optIndex === quiz.correct ? "font-medium" : ""}>
                                {option}
                              </span>
                              {optIndex === quiz.correct && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 0.75rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
