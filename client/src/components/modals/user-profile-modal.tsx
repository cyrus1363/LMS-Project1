import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, User, Edit, Mail, Calendar, Building2, Shield } from "lucide-react";

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && isOpen,
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
            <p className="text-gray-600 mb-4">The requested user profile could not be found.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              User Profile: {user.firstName} {user.lastName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover-lift transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card className="hover-lift transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold hover-scale transition-all duration-200">
                  {user.firstName && user.lastName 
                    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    : <User className="w-8 h-8" />
                  }
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 transition-colors duration-200">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-600 text-lg transition-colors duration-200">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    <Badge variant="outline" className="transition-all duration-200 hover:scale-105">
                      ID: {user.id}
                    </Badge>
                    <Badge variant="default" className="transition-all duration-200 hover:scale-105">
                      {user.userType?.replace('_', ' ') || "Student"}
                    </Badge>
                  </div>
                </div>
                <Button className="gap-2 btn-animate hover-lift transition-all duration-200">
                  <Edit className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="transition-all duration-200">Basic Info</TabsTrigger>
              <TabsTrigger value="security" className="transition-all duration-200">Security</TabsTrigger>
              <TabsTrigger value="activity" className="transition-all duration-200">Activity</TabsTrigger>
              <TabsTrigger value="permissions" className="transition-all duration-200">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.firstName || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.lastName || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {user.email}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">User Type</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        {user.userType?.replace('_', ' ') || "Student"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-600">Last updated: Never</p>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Not configured</p>
                      </div>
                      <Button variant="outline" size="sm">Setup 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-gray-600">Activity tracking will appear here once the user starts engaging with the system.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    User Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Current Role: {user.userType?.replace('_', ' ') || "Student"}</h4>
                      <p className="text-sm text-gray-600 mb-3">This user has access to:</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">View assigned courses</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Submit assignments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Participate in discussions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}