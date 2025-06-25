import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  Clock, 
  Users, 
  Trophy,
  FileText,
  Video,
  MessageSquare,
  CheckCircle
} from "lucide-react";

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

  const handleContentComplete = (contentIndex: number) => {
    if (content && contentIndex < content.length - 1) {
      setActiveContent(contentIndex + 1);
      setProgress(((contentIndex + 2) / content.length) * 100);
    }
  };

  if (classLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/classes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Classes
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{classData.title}</h1>
                <p className="text-sm text-gray-600">
                  with {classData.instructor?.firstName || ''} {classData.instructor?.lastName || 'Instructor'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">Progress</div>
                <div className="text-xs text-gray-600">{Math.round(progress)}% Complete</div>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Content Area */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {currentContent?.type === "video" && <Video className="h-5 w-5" />}
                    {currentContent?.type === "lesson" && <BookOpen className="h-5 w-5" />}
                    {currentContent?.type === "quiz" && <FileText className="h-5 w-5" />}
                    {currentContent?.type === "discussion" && <MessageSquare className="h-5 w-5" />}
                    {currentContent?.title || "Welcome to the Course"}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentContent?.type || "intro"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentContent ? (
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
                    </div>
                    <div className="flex justify-between pt-6">
                      <Button 
                        variant="outline" 
                        disabled={activeContent === 0}
                        onClick={() => setActiveContent(Math.max(0, activeContent - 1))}
                      >
                        Previous
                      </Button>
                      <Button onClick={() => handleContentComplete(activeContent)}>
                        {activeContent === (content?.length || 1) - 1 ? "Complete Course" : "Next"}
                      </Button>
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
                      
                      {content && content.length > 0 ? (
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  {classData.enrollmentCount} students enrolled
                </div>
                {classData.estimatedDuration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {classData.estimatedDuration} minutes
                  </div>
                )}
                {classData.difficulty && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-gray-500" />
                    {classData.difficulty} level
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {content?.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveContent(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        activeContent === index 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {index < activeContent ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : activeContent === index ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs opacity-75 capitalize">{item.type}</div>
                        </div>
                      </div>
                    </button>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2" />
                      <p>No content available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}