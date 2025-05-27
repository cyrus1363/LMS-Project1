import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Book, 
  PlayCircle, 
  Clock, 
  Star, 
  Target, 
  Lightbulb,
  GraduationCap,
  Users,
  Settings,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Sparkles
} from "lucide-react";

interface TutorialCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  orderIndex: number;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  content: string;
  categoryId: number;
  targetRoles: string[];
  uiLocation: string;
  featureId: string;
  version: string;
  isNewFeature: boolean;
  mediaUrls: string[];
  difficulty: string;
  estimatedTime: number;
  isActive: boolean;
  isOutdated: boolean;
  category: TutorialCategory;
  author: any;
}

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tutorial categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/tutorial-categories'],
  });

  // Fetch tutorials based on filters
  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['/api/tutorials', { categoryId: selectedCategory, targetRole: user?.role }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (user?.role) params.append('targetRole', user.role);
      params.append('isActive', 'true');
      
      const response = await fetch(`/api/tutorials?${params}`);
      return response.json();
    }
  });

  // Fetch recommended tutorials
  const { data: recommendedTutorials = [] } = useQuery({
    queryKey: ['/api/tutorials/recommended'],
    enabled: !!user,
  });

  // Search tutorials
  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/tutorials/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/tutorials/search?q=${encodeURIComponent(searchQuery)}&role=${user?.role}`);
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  // Track tutorial progress
  const progressMutation = useMutation({
    mutationFn: async ({ tutorialId, progressData }: { tutorialId: number; progressData: any }) => {
      const response = await fetch('/api/tutorial-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tutorialId, ...progressData }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorial-progress'] });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Book, Users, Settings, FileText, Video, GraduationCap, Target
    };
    const IconComponent = icons[iconName] || Book;
    return <IconComponent className="h-5 w-5" />;
  };

  const filteredTutorials = searchQuery.length > 2 ? searchResults : tutorials;

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    // Track that user started the tutorial
    progressMutation.mutate({
      tutorialId: tutorial.id,
      progressData: { currentStep: 1 }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Hub</h1>
              <p className="text-gray-600">Interactive guides and tutorials for every LMS feature</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search tutorials (e.g., 'How to reset passwords?', 'Adding SCORM content')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            <TabsTrigger value="recommended">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommended
            </TabsTrigger>
            <TabsTrigger value="new">
              <AlertCircle className="h-4 w-4 mr-2" />
              New Features
            </TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          {/* Browse All Tutorials */}
          <TabsContent value="browse" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All Categories
              </Button>
              {categories.map((category: TutorialCategory) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap flex items-center gap-2"
                >
                  {getIconComponent(category.icon)}
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial: Tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center gap-2">
                          {tutorial.title}
                          {tutorial.isNewFeature && (
                            <Badge variant="destructive" className="text-xs">NEW</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {tutorial.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* UI Location */}
                    {tutorial.uiLocation && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        📍 {tutorial.uiLocation}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tutorial.estimatedTime} min
                      </div>
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                    </div>

                    {/* Target Roles */}
                    <div className="flex flex-wrap gap-1">
                      {tutorial.targetRoles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => startTutorial(tutorial)}
                        className="flex-1"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Tutorial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading tutorials...</p>
              </div>
            )}

            {!isLoading && filteredTutorials.length === 0 && (
              <div className="text-center py-12">
                <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tutorials found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter.</p>
              </div>
            )}
          </TabsContent>

          {/* Recommended Tutorials */}
          <TabsContent value="recommended" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-2">Personalized for You</h2>
              <p className="opacity-90">Based on your role as {user?.role} and learning progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTutorials.map((tutorial: Tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => startTutorial(tutorial)} className="w-full">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* New Features */}
          <TabsContent value="new" className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-2">Latest Features</h2>
              <p className="opacity-90">Discover new capabilities and improvements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.filter((t: Tutorial) => t.isNewFeature).map((tutorial: Tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-500" />
                      {tutorial.title}
                      <Badge variant="destructive" className="text-xs">NEW</Badge>
                    </CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => startTutorial(tutorial)} className="w-full">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Explore New Feature
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Learning Progress</CardTitle>
                <CardDescription>Track your tutorial completion and learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">3</div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">8h 30m</div>
                      <div className="text-sm text-gray-600">Time Learned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4.8</div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Tutorial Viewer Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-blue-600" />
              {selectedTutorial?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTutorial && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Tutorial Header Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <Badge className={getDifficultyColor(selectedTutorial.difficulty)}>
                      {selectedTutorial.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {selectedTutorial.estimatedTime} minutes
                    </div>
                    {selectedTutorial.uiLocation && (
                      <div className="text-sm text-blue-600">
                        📍 {selectedTutorial.uiLocation}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{selectedTutorial.description}</p>
                </div>

                {/* Tutorial Content */}
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedTutorial.content }} />
                </div>

                {/* Media URLs */}
                {selectedTutorial.mediaUrls && selectedTutorial.mediaUrls.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Visual Guides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTutorial.mediaUrls.map((url, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <img src={url} alt={`Tutorial step ${index + 1}`} className="w-full h-auto rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complete Tutorial Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      progressMutation.mutate({
                        tutorialId: selectedTutorial.id,
                        progressData: { completed: true, completedAt: new Date() }
                      });
                      toast({
                        title: "Tutorial Completed!",
                        description: "Great job completing this tutorial."
                      });
                      setSelectedTutorial(null);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTutorial(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}