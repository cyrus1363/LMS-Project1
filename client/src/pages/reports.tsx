import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, BookOpen, Clock, Download, Shield } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: user?.role === "admin" || user?.role === "trainer",
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: user?.role === "admin" || user?.role === "trainer",
  });

  const { data: classAnalytics } = useQuery({
    queryKey: ["/api/classes", selectedClass, "analytics"],
    enabled: selectedClass !== "all" && (user?.role === "admin" || user?.role === "trainer"),
  });

  // Redirect if not admin or trainer
  if (user?.role !== "admin" && user?.role !== "trainer") {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">
                You don't have permission to access analytics and reports.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for charts (in a real app, this would come from the API)
  const completionData = [
    { month: "Jan", completion: 65 },
    { month: "Feb", completion: 72 },
    { month: "Mar", completion: 78 },
    { month: "Apr", completion: 81 },
    { month: "May", completion: 84 },
    { month: "Jun", completion: 87 },
  ];

  const enrollmentData = [
    { month: "Jan", enrollments: 120 },
    { month: "Feb", enrollments: 145 },
    { month: "Mar", enrollments: 180 },
    { month: "Apr", enrollments: 210 },
    { month: "May", enrollments: 235 },
    { month: "Jun", enrollments: 267 },
  ];

  const contentTypeData = [
    { name: "Lessons", value: 45, color: "#3b82f6" },
    { name: "Assessments", value: 25, color: "#10b981" },
    { name: "Resources", value: 20, color: "#f59e0b" },
    { name: "SCORM", value: 10, color: "#ef4444" },
  ];

  const topPerformingClasses = [
    { name: "Data Science Fundamentals", completion: 92, students: 45 },
    { name: "Web Development", completion: 88, students: 38 },
    { name: "Digital Marketing", completion: 85, students: 52 },
    { name: "Python Programming", completion: 82, students: 41 },
    { name: "Machine Learning", completion: 79, students: 29 },
  ];

  const recentActivity = [
    { user: "Sarah Johnson", action: "Completed", content: "Introduction to Data Science", time: "2 hours ago" },
    { user: "Mike Chen", action: "Started", content: "Advanced Python", time: "4 hours ago" },
    { user: "Emma Wilson", action: "Submitted", content: "Final Project", time: "6 hours ago" },
    { user: "Alex Thompson", action: "Completed", content: "Web Development Quiz", time: "1 day ago" },
    { user: "Lisa Rodriguez", action: "Enrolled", content: "Digital Marketing 101", time: "2 days ago" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Monitor performance and track learning progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((classItem: any) => (
                <SelectItem key={classItem.id} value={classItem.id.toString()}>
                  {classItem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                <p className="text-sm text-green-600 font-medium">+12% from last month</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm text-green-600 font-medium">+5 new this week</p>
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
                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.averageCompletion || 0}%</p>
                <p className="text-sm text-green-600 font-medium">+3% improvement</p>
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
                <p className="text-gray-500 text-sm font-medium">Avg. Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">2.4h</p>
                <p className="text-sm text-green-600 font-medium">+15min from last week</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Completion Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate Trend</CardTitle>
            <CardDescription>Monthly completion rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollments</CardTitle>
            <CardDescription>New enrollments by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Content types breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {contentTypeData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Classes</CardTitle>
            <CardDescription>Classes with highest completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformingClasses.map((classItem, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{classItem.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${classItem.completion}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{classItem.completion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{classItem.students}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest student interactions and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()} 
                      <span className="font-medium text-primary"> "{activity.content}"</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={
                    activity.action === "Completed" ? "default" :
                    activity.action === "Started" ? "secondary" :
                    activity.action === "Submitted" ? "outline" : "secondary"
                  }>
                    {activity.action}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
