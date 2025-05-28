import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  MessageSquare, 
  Bookmark, 
  Award,
  Users,
  Video,
  FileText,
  BookOpen,
  CheckCircle,
  Clock,
  Lightbulb,
  Star,
  Trophy,
  Target,
  Zap,
  Eye,
  VolumeX,
  Volume2,
  Maximize,
  Settings,
  Download,
  Share2
} from "lucide-react";

interface CourseModule {
  id: number;
  title: string;
  type: 'video' | 'pdf' | 'interactive' | 'vr' | 'quiz';
  duration: number;
  completed: boolean;
  progress: number;
}

interface Annotation {
  id: string;
  timestamp: number;
  content: string;
  type: 'note' | 'highlight' | 'question';
  x?: number;
  y?: number;
}

export default function CoursePlayer() {
  const { toast } = useToast();
  const [currentModule, setCurrentModule] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [userXP, setUserXP] = useState(1250);
  const [userLevel, setUserLevel] = useState(5);
  const [badges, setBadges] = useState(['Quick Learner', 'Note Taker', 'Collaborator']);
  const videoRef = useRef<HTMLVideoElement>(null);

  const courseModules: CourseModule[] = [
    { id: 1, title: "Introduction to Healthcare Compliance", type: 'video', duration: 15, completed: true, progress: 100 },
    { id: 2, title: "HIPAA Fundamentals", type: 'pdf', duration: 25, completed: true, progress: 100 },
    { id: 3, title: "Interactive Case Study", type: 'interactive', duration: 30, completed: false, progress: 60 },
    { id: 4, title: "VR Hospital Simulation", type: 'vr', duration: 20, completed: false, progress: 0 },
    { id: 5, title: "Knowledge Assessment", type: 'quiz', duration: 10, completed: false, progress: 0 }
  ];

  const courseProgress = Math.round(
    courseModules.reduce((acc, module) => acc + module.progress, 0) / courseModules.length
  );

  const addAnnotation = (type: 'note' | 'highlight' | 'question') => {
    if (!newAnnotation.trim()) return;
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      timestamp: progress * courseModules[currentModule].duration / 100,
      content: newAnnotation,
      type
    };
    
    setAnnotations([...annotations, annotation]);
    setNewAnnotation('');
    
    // Award XP for engagement
    setUserXP(prev => prev + 25);
    toast({
      title: "Note Added! +25 XP",
      description: "Great engagement with the content!",
    });
  };

  const completeModule = () => {
    const updatedModules = [...courseModules];
    updatedModules[currentModule].completed = true;
    updatedModules[currentModule].progress = 100;
    
    // Award XP and potentially badges
    setUserXP(prev => prev + 100);
    
    toast({
      title: "Module Completed! +100 XP",
      description: `Great job completing ${courseModules[currentModule].title}`,
    });

    if (currentModule < courseModules.length - 1) {
      setCurrentModule(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Course Info */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Healthcare Compliance Training</h1>
            <p className="text-gray-600">Professional Development • 4.8 ★ • 2,450 learners</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-600">Level {userLevel}</div>
              <div className="text-sm text-gray-600">{userXP} XP</div>
            </div>
            <div className="flex gap-2">
              {badges.slice(0, 3).map((badge, idx) => (
                <Badge key={idx} variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Trophy className="h-3 w-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="flex items-center gap-4 mb-6">
          <Progress value={courseProgress} className="flex-1" />
          <span className="text-sm font-medium">{courseProgress}% Complete</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Modules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {courseModules.map((module, index) => (
                <Button
                  key={module.id}
                  variant={currentModule === index ? "default" : "ghost"}
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => setCurrentModule(index)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      {module.type === 'video' && <Video className="h-4 w-4" />}
                      {module.type === 'pdf' && <FileText className="h-4 w-4" />}
                      {module.type === 'interactive' && <Target className="h-4 w-4" />}
                      {module.type === 'vr' && <Eye className="h-4 w-4" />}
                      {module.type === 'quiz' && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{module.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {module.duration}min
                        {module.completed && <CheckCircle className="h-3 w-3 text-green-600" />}
                      </div>
                      <Progress value={module.progress} className="mt-1 h-1" />
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Gamification Panel */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Next Level</span>
                <span className="text-sm font-medium">{2000 - userXP} XP needed</span>
              </div>
              <Progress value={(userXP % 500) / 5} />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Badges</h4>
                {badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-yellow-600" />
                    {badge}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{courseModules[currentModule].title}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Content Display Area */}
              <div className="relative bg-black rounded-lg aspect-video mb-4">
                {courseModules[currentModule].type === 'video' && (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      className="w-full h-full rounded-lg"
                      poster="/api/placeholder/800/450"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                      </Button>
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Button size="sm" variant="ghost" className="text-white">
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white" onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white">
                          <SkipForward className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <Progress value={progress} className="bg-white/20" />
                        </div>
                        <Button size="sm" variant="ghost" className="text-white">
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Annotations Overlay */}
                    {showAnnotations && annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="absolute bg-yellow-400 text-black text-xs p-2 rounded shadow-lg max-w-xs"
                        style={{ 
                          left: `${(annotation.x || 50)}%`, 
                          top: `${(annotation.y || 30)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="font-medium">{annotation.type.toUpperCase()}</div>
                        <div>{annotation.content}</div>
                        <div className="text-xs opacity-75">
                          {Math.floor(annotation.timestamp / 60)}:{(annotation.timestamp % 60).toFixed(0).padStart(2, '0')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {courseModules[currentModule].type === 'vr' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Eye className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">VR Hospital Simulation</h3>
                      <p className="mb-4">Experience immersive healthcare scenarios</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Zap className="h-4 w-4 mr-2" />
                        Launch VR Experience
                      </Button>
                    </div>
                  </div>
                )}

                {courseModules[currentModule].type === 'interactive' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Target className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Interactive Case Study</h3>
                      <p className="mb-4">Work through real-world scenarios</p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Interactive Module
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAnnotations(!showAnnotations)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showAnnotations ? 'Hide' : 'Show'} Notes ({annotations.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark
                  </Button>
                  <Button variant="outline" size="sm">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    AI Summary
                  </Button>
                </div>
                <Button onClick={completeModule}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Tools */}
          <Tabs defaultValue="notes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="notes">Notes & Annotations</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="quiz">Live Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Add Your Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add a note, highlight, or question about this content..."
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => addAnnotation('note')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                    <Button variant="outline" onClick={() => addAnnotation('highlight')}>
                      <Star className="h-4 w-4 mr-2" />
                      Highlight
                    </Button>
                    <Button variant="outline" onClick={() => addAnnotation('question')}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Ask Question
                    </Button>
                  </div>

                  {/* Recent Annotations */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {annotations.slice(-5).map((annotation) => (
                      <div key={annotation.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {annotation.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Math.floor(annotation.timestamp / 60)}:{(annotation.timestamp % 60).toFixed(0).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-sm">{annotation.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Class Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                          JD
                        </div>
                        <span className="font-medium">John Doe</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-sm">Great explanation of HIPAA requirements. The case study really helped clarify the compliance procedures.</p>
                    </div>
                    <Textarea placeholder="Join the discussion..." />
                    <Button>Post Comment</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Live Knowledge Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Which of the following is required for HIPAA compliance?</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">A) Encryption of data at rest</Button>
                        <Button variant="outline" className="w-full justify-start">B) Regular risk assessments</Button>
                        <Button variant="outline" className="w-full justify-start">C) Staff training programs</Button>
                        <Button variant="outline" className="w-full justify-start">D) All of the above</Button>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      45 students participating • Poll ends in 2:30
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}