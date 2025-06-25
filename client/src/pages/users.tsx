import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Search, Filter, UserCheck, UserX, Shield } from "lucide-react";
import { Link } from "wouter";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  // Allow both system owners and subscriber admins to access user management
  const hasAccess = user?.userType === "system_owner" || user?.userType === "subscriber_admin";

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: hasAccess,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  if (!hasAccess) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">
                You don't have permission to access user management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter((u: any) => {
    const matchesSearch = !searchTerm || 
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "trainer":
        return "default";
      default:
        return "secondary";
    }
  };

  const stats = {
    total: allUsers?.length || 0,
    admins: allUsers?.filter((u: any) => u.role === "admin").length || 0,
    trainers: allUsers?.filter((u: any) => u.role === "trainer").length || 0,
    students: allUsers?.filter((u: any) => u.role === "student").length || 0,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Link to="/users/create">
          <Button 
            className="gap-2 btn-animate hover-lift transition-all duration-200" 
            onClick={(e) => {
              console.log("Add User button clicked!");
              console.log("Current user:", user);
              console.log("User type:", user?.userType);
            }}
          >
            <Users className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 stagger-children">
        <Card className="hover-lift animate-fadeIn">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-300">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full hover-scale transition-all duration-200">
                <Users className="h-6 w-6 text-blue-600 transition-transform duration-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-fadeIn">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Administrators</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-300">{stats.admins}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full hover-scale transition-all duration-200">
                <Shield className="h-6 w-6 text-red-600 transition-transform duration-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-fadeIn">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Trainers</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-300">{stats.trainers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full hover-scale transition-all duration-200">
                <UserCheck className="h-6 w-6 text-green-600 transition-transform duration-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-fadeIn">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Students</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-300">{stats.students}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full hover-scale transition-all duration-200">
                <Users className="h-6 w-6 text-purple-600 transition-transform duration-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 hover-lift animate-slideIn">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-all duration-200" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-ring transition-all duration-200"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="transition-all duration-200 hover:border-blue-300">
                  <Filter className="w-4 h-4 mr-2 transition-transform duration-200" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="animate-scaleIn">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="trainer">Trainers</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle className="transition-all duration-200">Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-full skeleton animate-shimmer" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userItem: any, index) => (
                  <TableRow key={userItem.id} className="animate-fadeIn hover:bg-gray-50 transition-all duration-200" style={{animationDelay: `${index * 0.1}s`}}>
                    <TableCell>
                      <Link to={`/users/${userItem.id}`} className="flex items-center space-x-3 hover:bg-blue-50 -m-2 p-2 rounded transition-all duration-200 hover-scale">
                        <img
                          src={userItem.profileImageUrl || `https://ui-avatars.com/api/?name=${userItem.firstName}+${userItem.lastName}&background=random`}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover transition-transform duration-200 hover:scale-110 ring-2 ring-transparent hover:ring-blue-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900 transition-colors duration-200">
                            {userItem.firstName} {userItem.lastName}
                          </p>
                          <p className="text-sm text-gray-500 transition-colors duration-200">ID: {userItem.id}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-900 transition-colors duration-200">
                      {userItem.email || "No email"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={userItem.userType === 'system_owner' ? 'destructive' : 'secondary'} className="transition-all duration-200 hover:scale-105">
                        {userItem.userType?.replace('_', ' ') || 'student'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 transition-colors duration-200">
                      {userItem.createdAt 
                        ? new Date(userItem.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild className="hover-lift transition-all duration-200">
                        <Link to={`/users/${userItem.id}`}>View Profile</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No users have been registered yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
