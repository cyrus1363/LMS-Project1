import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  ArrowLeft,
  Video,
  FileText,
  Award
} from "lucide-react";
import { Link } from "wouter";
import ErrorBoundary from "@/components/error-boundary";
import { CourseErrorFallback } from "@/components/error-fallbacks";
import ModernNavbar from "@/components/layout/modern-navbar";

export default function CourseView() {
  const params = useParams();
  const courseId = parseInt(params.id as string);

  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="page" fallback={CourseErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ModernNavbar />
        
        {/* Header */}
        <div className="bg-blue-600 text-white pt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <span className="text-blue-200">/</span>
              <span className="text-blue-200">Getting Started With eLearning</span>
              <Badge className="bg-blue-800 text-blue-100">(004)</Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Course Info */}
            <div className="lg:col-span-1">
              <Card className="bg-teal-500 text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="bg-white/20 rounded-lg p-6 mb-4">
                      <Play className="w-12 h-12 mx-auto mb-2" />
                      <h3 className="font-semibold">Ready to Start</h3>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Getting Started With eLearning</h2>
                    <p className="text-teal-100 text-sm">Introduction to online learning fundamentals</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-semibold">0%</span>
                    </div>
                    <Progress value={0} className="bg-white/20" />

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <Clock className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs text-teal-100">Duration</div>
                        <div className="font-semibold">2 hours</div>
                      </div>
                      <div>
                        <Users className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs text-teal-100">Students</div>
                        <div className="font-semibold">124</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm">4.8 (45 reviews)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Course Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Sarah Johnson</h4>
                      <p className="text-sm text-gray-600">Senior Learning Designer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Modules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Module 1 */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        Module 1: Introduction to eLearning
                      </h3>
                      <Badge variant="outline">15 min</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Learn the basics of online education and digital learning platforms.
                    </p>
                    <Button size="sm" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Start Module
                    </Button>
                  </div>

                  {/* Module 2 */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        Module 2: Learning Strategies
                      </h3>
                      <Badge variant="outline">20 min</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Discover effective study techniques for online courses.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Module 1 First
                    </Button>
                  </div>

                  {/* Module 3 */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        Module 3: Assessment & Certification
                      </h3>
                      <Badge variant="outline">25 min</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Understanding evaluations and earning your certificate.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Previous Modules
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}