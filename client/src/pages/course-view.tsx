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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-blue-600 text-white">
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
                    <BookOpen className="w-16 h-16 mx-auto text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">eLEARNING FUNDAMENTALS</h3>
                </div>
                
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3">
                  <Play className="w-5 h-5 mr-2" />
                  Resume course
                </Button>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Estimated: 2-3 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">156 enrolled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">4.8 rating</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">Certificate included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-gray-900 mb-2">
                      Getting Started With eLearning
                      <Badge className="ml-2 bg-blue-100 text-blue-800">(004)</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span>25% Complete</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <Badge className="bg-green-100 text-green-800">25%</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Course Description */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <p className="text-gray-700">
                        This course raises some fundamental eLearning questions. What do you need to succeed as an online instructor? 
                        What strategies do eLearning gurus practice? By the end of this course, you'll have all the answers.
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <Progress value={25} className="w-full h-2" />
                    <p className="text-sm text-gray-600 mt-2">1 of 4 modules completed</p>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CONTENT</h3>
                    
                    {/* Completed Module */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="flex-1 text-green-800 font-medium">Welcome to Getting Started With eLearning</span>
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                    </div>

                    {/* eLearning Fundamentals Section */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">4</span>
                        </div>
                        ELEARNING FUNDAMENTALS
                      </h4>
                      
                      <div className="space-y-3 ml-8">
                        {/* Completed Item */}
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">What is an LMS?</span>
                        </div>
                        
                        {/* Pending Items */}
                        <div className="flex items-center gap-3 text-gray-600">
                          <Video className="w-4 h-4" />
                          <span>Why Do You Need eLearning?</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>Why You Should Invest in an LMS (Infographic)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                    <Button variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Course Materials
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}