import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Edit } from "lucide-react";
import { Link, useParams } from "wouter";

export default function UserProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("basic");
  const [backUrl, setBackUrl] = useState("/users");

  // Check if we came from an organization page
  useEffect(() => {
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    // If referrer is from the same origin and contains /organizations/
    if (referrer.startsWith(currentOrigin) && referrer.includes('/organizations/')) {
      const orgMatch = referrer.match(/\/organizations\/(\d+)/);
      if (orgMatch) {
        setBackUrl(`/organizations/${orgMatch[1]}`);
      }
    }
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
          <p className="text-gray-600 mt-2">The requested user profile could not be found.</p>
          <Link to={backUrl}>
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backUrl.includes('/organizations/') ? 'Back to Organization' : 'Back to Users'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/users" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mt-2">{user.email}</p>
            </div>
            <Button className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic information</TabsTrigger>
            <TabsTrigger value="personal">Personal details</TabsTrigger>
            <TabsTrigger value="password">Change password</TabsTrigger>
            <TabsTrigger value="groups">User groups</TabsTrigger>
            <TabsTrigger value="courses">Teacher courses</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes results</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">First name</label>
                        <p className="mt-1 text-sm text-gray-900">{user.firstName || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last name</label>
                        <p className="mt-1 text-sm text-gray-900">{user.lastName || "Not provided"}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Email address</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{user.username || "Not set"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {user.userType?.replace("_", " ") || "student"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Account status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Storage</label>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Storage usage not calculated</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Profile picture</label>
                    </div>
                    <div className="mt-4 flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.firstName && user.lastName 
                            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                            : <User className="w-12 h-12" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Organization</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.organizationId ? `Organization ID: ${user.organizationId}` : "No organization assigned"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Password management is handled by the authentication system.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>User groups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Group management features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Teacher courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Course assignments for teachers will be managed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Quizzes results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Quiz results and performance metrics will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}