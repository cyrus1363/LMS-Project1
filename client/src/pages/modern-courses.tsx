import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  BookOpen,
  Users,
  Clock,
  Star,
  Play,
  Edit,
  Settings,
  MoreVertical
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ModernCourses() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const canCreateCourse = user?.userType && ['system_owner', 'subscriber_admin', 'teacher'].includes(user.userType);

  const filteredCourses = courses?.filter((course: any) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600">
                {user?.userType === 'student' 
                  ? 'Explore and continue your learning journey'
                  : 'Manage and create engaging learning experiences'
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              {canCreateCourse && (
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Course
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {courses?.length === 0 ? 'No courses yet' : 'No courses match your search'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {courses?.length === 0 
                ? canCreateCourse 
                  ? 'Get started by creating your first course to engage learners.'
                  : 'Courses will appear here once they are created and published.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {canCreateCourse && courses?.length === 0 && (
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <BookOpen className="w-12 h-12 opacity-80" />
                    </div>
                  )}
                  
                  {/* Overlay with Play Button for Students */}
                  {user?.userType === 'student' && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button size="lg" className="gap-2 bg-white text-black hover:bg-gray-100">
                        <Play className="w-5 h-5" />
                        Continue Learning
                      </Button>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {/* Actions Menu for Instructors */}
                  {canCreateCourse && (
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-white bg-opacity-90 hover:bg-opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Users className="w-4 h-4" />
                            Manage Students
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Course Title & Description */}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                    </div>

                    {/* Course Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.totalEnrollments || 0}</span>
                        </div>
                        {course.estimatedDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{Math.round(course.estimatedDuration / 60)}h</span>
                          </div>
                        )}
                      </div>
                      {course.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.averageRating}</span>
                        </div>
                      )}
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {course.instructor?.profileImageUrl ? (
                          <img 
                            src={course.instructor.profileImageUrl} 
                            alt={course.instructor.firstName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {course.instructor?.firstName?.charAt(0) || 'I'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {course.instructor?.userType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {/* Course Difficulty */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={
                          course.difficulty === 'beginner' ? 'border-green-300 text-green-700' :
                          course.difficulty === 'intermediate' ? 'border-yellow-300 text-yellow-700' :
                          'border-red-300 text-red-700'
                        }
                      >
                        {course.difficulty}
                      </Badge>
                      
                      {/* Action Button */}
                      {user?.userType === 'student' ? (
                        <Button size="sm" className="gap-2">
                          <Play className="w-4 h-4" />
                          Start
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="w-4 h-4" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}