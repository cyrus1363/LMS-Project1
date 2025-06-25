import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Trophy,
  Users,
  Star,
  Calendar,
  FileText,
  Video,
  ChevronRight,
  Award,
  Menu,
  Download,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface Class {
  id: number;
  title: string;
  description: string;
  instructor: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  enrollmentCount: number;
  estimatedDuration?: number;
  difficulty?: string;
  category?: string;
}

interface ContentPage {
  id: number;
  title: string;
  content: string;
  type: "lesson" | "assessment" | "resource" | "scorm";
  orderIndex: number;
  isPublished: boolean;
  metadata?: any;
  author: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export default function CoursePlayer() {
  const params = useParams();
  const classId = params.id;
  const [activeContent, setActiveContent] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [completedContent, setCompletedContent] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: classData, isLoading: classLoading } = useQuery<Class>({
    queryKey: ["/api/classes", classId],
    enabled: !!classId,
  });

  const { data: content, isLoading: contentLoading } = useQuery<ContentPage[]>({
    queryKey: ["/api/classes", classId, "content"],
    enabled: !!classId,
  });

  useEffect(() => {
    if (content && content.length > 0) {
      // Calculate progress based on completed content
      const completionRate = (completedContent.size / content.length) * 100;
      setProgress(completionRate);
    }
  }, [completedContent, content]);

  const handleContentComplete = (contentIndex: number) => {
    const newCompleted = new Set(completedContent);
    newCompleted.add(contentIndex);
    setCompletedContent(newCompleted);
    
    if (content && contentIndex < content.length - 1) {
      setActiveContent(contentIndex + 1);
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedContent);
    newCompleted.add(activeContent);
    setCompletedContent(newCompleted);
  };

  if (classLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Class Not Found</h2>
          <Button asChild>
            <Link href="/classes">Back to Classes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentContent = content?.[activeContent];
  const publishedContent = content?.filter(c => c.isPublished) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className={sidebarOpen ? "" : "hidden"}>
              <Link href="/classes">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classes
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
          {sidebarOpen && (
            <div className="mt-4">
              <h2 className="font-semibold text-gray-900 mb-1">{classData.title}</h2>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={classData.instructor?.profileImageUrl} />
                  <AvatarFallback className="text-xs">
                    {classData.instructor?.firstName?.[0]}{classData.instructor?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {classData.instructor?.firstName} {classData.instructor?.lastName}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{completedContent.size} of {publishedContent.length} completed</span>
                  <span>{publishedContent.length - completedContent.size} remaining</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Navigation */}
        {sidebarOpen && (
          <ScrollArea className="flex-1">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Course Content</h3>
              {publishedContent.length > 0 ? (
                <div className="space-y-1">
                  {publishedContent.map((item, index) => {
                    const isActive = index === activeContent;
                    const isCompleted = completedContent.has(index);
                    const IconComponent = item.type === 'lesson' ? BookOpen : 
                                        item.type === 'assessment' ? FileText :
                                        item.type === 'resource' ? Download : Video;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveContent(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-blue-50 border-blue-200 text-blue-900' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded ${
                            isCompleted ? 'bg-green-100' : 
                            isActive ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconComponent className={`h-4 w-4 ${
                                isActive ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{item.title}</span>
                              <span className="text-xs text-gray-500">{index + 1}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No content available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              {currentContent ? (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{currentContent.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">{currentContent.type}</Badge>
                    <span className="text-sm text-gray-500">
                      Lesson {activeContent + 1} of {publishedContent.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{classData.title}</h1>
                  <p className="text-sm text-gray-500">Course Overview</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => activeContent > 0 && setActiveContent(activeContent - 1)}
                disabled={activeContent === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={() => handleContentComplete(activeContent)}
                disabled={!publishedContent || activeContent >= publishedContent.length - 1}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Display */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {currentContent ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                      {currentContent.content}
                    </div>
                  </div>
                  
                  {currentContent.metadata?.files && currentContent.metadata.files.length > 0 && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Resources & Downloads
                      </h4>
                      <div className="space-y-2">
                        {currentContent.metadata.files.map((file: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="flex-1 text-sm">{file.originalName}</span>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={currentContent.author?.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {currentContent.author?.firstName?.[0]}{currentContent.author?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        Created by {currentContent.author?.firstName} {currentContent.author?.lastName}
                      </div>
                      <div className="flex items-center gap-2">
                        {!completedContent.has(activeContent) ? (
                          <Button 
                            variant="outline"
                            onClick={handleMarkComplete}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Welcome to {classData.title}</h3>
                    <p className="text-gray-600 text-lg mb-8">{classData.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-blue-900">Self-Paced</h4>
                      <p className="text-sm text-blue-700">Learn at your own speed</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-900">Interactive</h4>
                      <p className="text-sm text-green-700">Engaging content & activities</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-purple-900">Progress Tracking</h4>
                      <p className="text-sm text-purple-700">Monitor your advancement</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{publishedContent.length}</div>
                        <div className="text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{classData.enrollmentCount || 0}</div>
                        <div className="text-gray-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">4.8</div>
                        <div className="text-gray-600">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Self-paced</div>
                        <div className="text-gray-600">Format</div>
                      </div>
                    </div>
                  </div>
                  
                  {publishedContent.length > 0 ? (
                    <Button size="lg" onClick={() => setActiveContent(0)} className="px-8 py-3">
                      <Play className="h-5 w-5 mr-2" />
                      Start Learning
                    </Button>
                  ) : (
                    <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                      <BookOpen className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-yellow-800 font-medium">Course content is being prepared</p>
                      <p className="text-yellow-700 text-sm">Check back soon for lessons and activities</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}