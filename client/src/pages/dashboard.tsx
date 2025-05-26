import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, BookOpen, Users, TrendingUp, Plus } from "lucide-react";
import LearningRecommendations from "@/components/ai/learning-recommendations";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: user?.role === "admin" || user?.role === "trainer",
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes"],
  });

  const isAdminOrTrainer = user?.role === "admin" || user?.role === "trainer";

  const roleConfig = {
    admin: {
      title: "Administrator Dashboard",
      description: "Manage users, classes, and monitor platform performance",
      badge: { text: "Administrator", variant: "default" as const }
    },
    trainer: {
      title: "Trainer Dashboard", 
      description: "Create content, manage classes, and track student progress",
      badge: { text: "Trainer", variant: "secondary" as const }
    },
    student: {
      title: "Student Dashboard",
      description: "Access your courses and track your learning progress",
      badge: { text: "Student", variant: "outline" as const }
    }
  };

  const config = roleConfig[user?.role as keyof typeof roleConfig] || roleConfig.student;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
              <Badge variant={config.badge.variant}>{config.badge.text}</Badge>
            </div>
            <p className="text-gray-600">{config.description}</p>
          </div>
          {isAdminOrTrainer && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Quick Actions
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Only for Admin/Trainer */}
      {isAdminOrTrainer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Active Classes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.activeClasses || 0}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Course Completion</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.averageCompletion || 0}%</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Content</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalContent || 0}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Classes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {user?.role === "student" ? "My Classes" : "Recent Classes"}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : classes && classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.slice(0, 5).map((classItem: any) => (
                    <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{classItem.title}</p>
                          <p className="text-xs text-gray-500">
                            {classItem.instructor?.firstName} {classItem.instructor?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="outline">
                          {classItem.enrollmentCount || 0} students
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                  <p className="text-gray-500">
                    {user?.role === "student" 
                      ? "You haven't enrolled in any classes yet."
                      : "Create your first class to get started."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations for Students OR Quick Actions for Admin/Trainer */}
        <div className="space-y-6">
          {user?.role === "student" ? (
            <LearningRecommendations />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role === "admin" && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Class
                    </Button>
                  </>
                )}
                {user?.role === "trainer" && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Content
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Manage Classes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
