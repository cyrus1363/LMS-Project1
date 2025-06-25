import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  BookOpen, 
  Users, 
  Video, 
  MessageSquare, 
  Brain, 
  Trophy,
  Play,
  Eye,
  Plus,
  Edit,
  Trash2,

  GripVertical,
  Palette,
  Zap,
  Shield,
  Monitor,
  Gamepad2,
  Award,
  Star,
  Camera,
  Mic,
  FileText,
  BarChart,
  Calendar,
  Clock,
  Globe,
  Lock,
  Unlock
} from "lucide-react";
import ContentBuilder from "@/components/content/content-builder";

interface ClassData {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  timezone: string;
  enrollmentType: string;
  maxStudents?: number;
  cpeCredits?: number;
  nasbaApprovalId?: string;
  learningPathway?: string;
  isPublished: boolean;
}

interface ContentModule {
  id: string;
  type: 'discussion' | 'video' | 'quiz' | 'scorm' | 'roleplay' | 'whiteboard' | 'poll' | 'h5p';
  title: string;
  content: any;
  order: number;
  conditions?: {
    unlockAfter?: string;
    requiredScore?: number;
  };
}

export default function ManageClass() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [previewMode, setPreviewMode] = useState<"facilitator" | "student">("facilitator");
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [editingModule, setEditingModule] = useState<ContentModule | null>(null);

  // Fetch class data
  const { data: classData, isLoading } = useQuery<ClassData>({
    queryKey: ['/api/classes', id],
    enabled: !!id,
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: (data: Partial<ClassData>) =>
      apiRequest("PATCH", `/api/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes', id] });
      toast({ title: "Class updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update class", variant: "destructive" });
    },
  });

  const handleSaveChanges = () => {
    if (classData) {
      updateClassMutation.mutate(classData);
    }
  };

  const addContentModule = (type: ContentModule['type']) => {
    const newModule: ContentModule = {
      id: `module-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: {},
      order: modules.length + 1,
    };
    setModules([...modules, newModule]);
    setEditingModule(newModule);
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const reorderModules = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedModules = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setModules(updatedModules);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Class Not Found</h2>
        <Button onClick={() => setLocation("/classes")}>Back to Classes</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage: {classData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive class management and content builder
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={previewMode} onValueChange={(value: "facilitator" | "student") => setPreviewMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facilitator">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Facilitator View
                    </div>
                  </SelectItem>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Student View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setLocation("/classes")}>
                Back to Classes
              </Button>
              <Button onClick={handleSaveChanges} disabled={updateClassMutation.isPending}>
                {updateClassMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 gap-4 h-auto p-2 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 p-3">
              <BookOpen className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 p-3">
              <Edit className="w-4 h-4" />
              Content Builder
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2 p-3">
              <Zap className="w-4 h-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center gap-2 p-3">
              <Brain className="w-4 h-4" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2 p-3">
              <Shield className="w-4 h-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2 p-3">
              <Globe className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2 p-3">
              <Trophy className="w-4 h-4" />
              Gamification
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Class Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={classData.title}
                      onChange={(e) => 
                        updateClassMutation.mutate({ ...classData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={classData.description}
                      onChange={(e) => 
                        updateClassMutation.mutate({ ...classData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={classData.startDate?.slice(0, 16)}
                        onChange={(e) => 
                          updateClassMutation.mutate({ ...classData, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={classData.endDate?.slice(0, 16)}
                        onChange={(e) => 
                          updateClassMutation.mutate({ ...classData, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CPE/NASBA Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    CPE/NASBA Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cpeCredits">CPE Credits</Label>
                    <Input
                      id="cpeCredits"
                      type="number"
                      value={classData.cpeCredits || 0}
                      onChange={(e) => 
                        updateClassMutation.mutate({ ...classData, cpeCredits: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="nasbaApprovalId">NASBA Approval ID</Label>
                    <Input
                      id="nasbaApprovalId"
                      value={classData.nasbaApprovalId || ""}
                      onChange={(e) => 
                        updateClassMutation.mutate({ ...classData, nasbaApprovalId: e.target.value })
                      }
                      placeholder="e.g., CPE-2024-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="learningPathway">Learning Pathway</Label>
                    <Select
                      value={classData.learningPathway || ""}
                      onValueChange={(value) => 
                        updateClassMutation.mutate({ ...classData, learningPathway: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pathway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accounting">Accounting & Auditing</SelectItem>
                        <SelectItem value="taxation">Taxation</SelectItem>
                        <SelectItem value="consulting">Management Consulting</SelectItem>
                        <SelectItem value="ethics">Professional Ethics</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modules</p>
                      <p className="text-2xl font-bold">{modules.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion</p>
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                    <BarChart className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-2xl font-bold">
                        {classData.isPublished ? 
                          <Badge variant="default">Live</Badge> : 
                          <Badge variant="secondary">Draft</Badge>
                        }
                      </p>
                    </div>
                    <Monitor className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Builder Tab */}
          <TabsContent value="content" className="space-y-6">
            <ContentBuilder 
              classId={id!} 
              onContentSaved={() => {
                toast({ title: "Content saved successfully!" });
                queryClient.invalidateQueries({ queryKey: ["/api/classes", id, "content"] });
              }} 
            />
          </TabsContent>

          {/* Additional tabs would continue here... */}
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Tools</CardTitle>
                <CardDescription>Interactive features to boost student participation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Engagement Tools Coming Soon</h3>
                  <p className="text-gray-500">Virtual whiteboards, peer reviews, and interactive polls</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tools">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Features</CardTitle>
                <CardDescription>Intelligent content generation and assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">AI Tools Coming Soon</h3>
                  <p className="text-gray-500">Auto-generated quizzes, roleplay scenarios, and smart chatbots</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Security</CardTitle>
                <CardDescription>HIPAA, accessibility, and proctoring settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Compliance Tools Coming Soon</h3>
                  <p className="text-gray-500">Advanced security and accessibility features</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>External Integrations</CardTitle>
                <CardDescription>Connect with Zoom, Teams, H5P, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Integrations Coming Soon</h3>
                  <p className="text-gray-500">Video conferencing and authoring tool connections</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification">
            <Card>
              <CardHeader>
                <CardTitle>Gamification & Rewards</CardTitle>
                <CardDescription>Badges, XP, and achievement systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gamification Coming Soon</h3>
                  <p className="text-gray-500">Custom badges, XP thresholds, and reward systems</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}