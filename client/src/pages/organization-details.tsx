import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Settings, 
  BookOpen, 
  Award,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Globe
} from "lucide-react";

export default function OrganizationDetails() {
  const { id } = useParams();
  
  const { data: organization, isLoading } = useQuery({
    queryKey: [`/api/organizations/${id}`],
  });

  const { data: users } = useQuery({
    queryKey: [`/api/organizations/${id}/users`],
  });

  const { data: courses } = useQuery({
    queryKey: [`/api/organizations/${id}/courses`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600">The organization you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">{organization.subdomain}.eduelms.com</p>
                <Badge variant={organization.isActive ? "default" : "secondary"}>
                  {organization.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">{organization.subscriptionTier || "Free"}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Globe className="w-4 h-4" />
              View Site
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Details
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="classes" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="pathways" className="gap-2">
              <Award className="w-4 h-4" />
              Learning Pathways
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Users</CardTitle>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <Badge variant="outline">{user.userType}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Users Yet</h3>
                    <p className="text-gray-500 text-sm">Add users to this organization to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Classes & Courses</CardTitle>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Class
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {courses && courses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {courses.map((course: any) => (
                      <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Classes Yet</h3>
                    <p className="text-gray-500 text-sm">Create your first class to start building courses.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathways" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Learning Pathways</CardTitle>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Pathway
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Learning Pathways Yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Create learning pathways that combine multiple classes to lead to certifications.
                  </p>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Pathway
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Organization Name</label>
                    <p className="text-sm text-gray-600">{organization.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subdomain</label>
                    <p className="text-sm text-gray-600">{organization.subdomain}.eduelms.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={organization.isActive ? "default" : "secondary"}>
                      {organization.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Plan</label>
                    <Badge variant="outline">{organization.subscriptionTier || "Free"}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User Limit</label>
                    <p className="text-sm text-gray-600">{organization.maxUsers || "Unlimited"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Storage Limit</label>
                    <p className="text-sm text-gray-600">{organization.maxStorage || "Unlimited"}</p>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}