import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import UserProfileModal from "@/components/modals/user-profile-modal";
import CourseCreationModal from "@/components/modals/course-creation-modal";
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  Building2,
  GraduationCap,
  UserPlus,
  FileText
} from "lucide-react";

export default function OrganizationManagement() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const organizationId = parseInt(params.id as string);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Fetch organization data
  const { data: organization, isLoading } = useQuery({
    queryKey: ["/api/organizations", organizationId],
    enabled: !isNaN(organizationId),
  });

  // Fetch organization users - for now, fetch all users since we don't have org-specific users yet
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !isNaN(organizationId),
  });

  // Fetch organization courses
  const { data: courses } = useQuery({
    queryKey: ["/api/organizations", organizationId, "courses"],
    enabled: !isNaN(organizationId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-6">The organization you're looking for doesn't exist or has been removed.</p>
          <Link to="/organizations">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Organizations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/organizations" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-gray-600">{organization.domain}.yourlms.com</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={organization.isActive ? "default" : "secondary"}>
                    {organization.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{organization.organizationType || "Corporate"}</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="gap-2">
                <Globe className="w-4 h-4" />
                View Frontend
              </Button>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Organization
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6 animate-scaleIn">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="transition-all duration-200">Users</TabsTrigger>
            <TabsTrigger value="courses" className="transition-all duration-200">Courses</TabsTrigger>
            <TabsTrigger value="settings" className="transition-all duration-200">Settings</TabsTrigger>
            <TabsTrigger value="analytics" className="transition-all duration-200">Analytics</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <Link to="/users/create">
                <Button className="gap-2 btn-animate hover-lift transition-all duration-200">
                  <UserPlus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                  Add User
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <Card key={user.id} className="hover-lift transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold transition-transform duration-200 hover:scale-110">
                            {user.firstName && user.lastName 
                              ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                              : <Users className="w-5 h-5" />
                            }
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 transition-colors duration-200">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 transition-colors duration-200">
                              {user.email} • ID: {user.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="transition-all duration-200 hover:scale-105">
                            {user.userType?.replace('_', ' ') || "Student"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover-lift transition-all duration-200"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setIsUserModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Yet</h3>
                    <p className="text-gray-600 mb-6">Start building your organization by adding users</p>
                    <Link to={`/users/create?from=organization&orgId=${organizationId}`}>
                      <Button className="gap-2 btn-animate hover-lift transition-all duration-200">
                        <UserPlus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                        Add First User
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
              <Button 
                className="gap-2 btn-animate hover-lift transition-all duration-200"
                onClick={() => setIsCourseModalOpen(true)}
              >
                <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                Create Course
              </Button>
            </div>

            <div className="grid gap-4">
              {courses && courses.length > 0 ? (
                courses.map((course: any) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={course.isPublished ? "default" : "secondary"}>
                              {course.isPublished ? "Published" : "Draft"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {course.totalEnrollments || 0} enrollments
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                    <p className="text-gray-600 mb-6">Create engaging courses for your organization</p>
                    <Button 
                      className="gap-2 btn-animate hover-lift transition-all duration-200"
                      onClick={() => setIsCourseModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                      Create First Course
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Organization Settings</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input id="orgName" defaultValue={organization.name} />
                    </div>
                    <div>
                      <Label htmlFor="domain">Domain</Label>
                      <Input id="domain" defaultValue={organization.domain} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" defaultValue={organization.description || ""} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limits & Quotas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="userLimit">User Limit</Label>
                      <Input id="userLimit" type="number" defaultValue={organization.userLimit} />
                    </div>
                    <div>
                      <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
                      <Input id="storageLimit" type="number" defaultValue={organization.storageLimit} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" defaultValue={organization.contactEmail || ""} />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" defaultValue={organization.contactPhone || ""} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Settings className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-600">Detailed analytics and reporting will be available once users start engaging with courses.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Profile Modal */}
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            isOpen={isUserModalOpen}
            onClose={() => {
              setIsUserModalOpen(false);
              setSelectedUserId(null);
            }}
          />
        )}

        {/* Course Creation Modal */}
        <CourseCreationModal
          organizationId={organizationId}
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
        />
      </div>
    </div>
  );
}