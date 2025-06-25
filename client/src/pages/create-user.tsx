import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function CreateUser() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [backUrl, setBackUrl] = useState("/users");

  // Check URL parameters for context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    const orgId = urlParams.get('orgId');
    
    if (from === 'organization' && orgId) {
      setBackUrl(`/organizations/${orgId}`);
    }
  }, []);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      userType: "student",
      isActive: true,
      showInTeachersPage: false,
      profileImageUrl: "",
      organizationId: null,
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setLocation(backUrl);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    
    // Basic validation
    if (!data.firstName || !data.lastName || !data.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, Email)",
        variant: "destructive",
      });
      return;
    }
    
    createUser.mutate(data);
  };

  const generateUsername = () => {
    const firstName = form.watch("firstName");
    const lastName = form.watch("lastName");
    if (firstName && lastName) {
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
      form.setValue("username", username);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        <div className="mb-8">
          <Link to={backUrl} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-all duration-200 hover-lift">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 hover:-translate-x-1" />
            {backUrl.includes('/organizations/') ? 'Back to Organization' : 'Back to Users'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 animate-slideIn">Create New User</h1>
          <p className="text-gray-600 mt-2 animate-slideIn" style={{animationDelay: '0.1s'}}>Add a new user to the system with role-based permissions</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Card className="animate-scaleIn hover-lift">
                <CardHeader>
                  <CardTitle className="transition-colors duration-200">Basic information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First name *</Label>
                          <Input
                            id="firstName"
                            {...form.register("firstName", { required: "First name is required" })}
                            placeholder="Vedamo"
                            className="mt-1 focus-ring transition-all duration-200"
                          />
                          {form.formState.errors.firstName && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last name *</Label>
                          <Input
                            id="lastName"
                            {...form.register("lastName", { required: "Last name is required" })}
                            placeholder="User"
                            className="mt-1 focus-ring transition-all duration-200"
                          />
                          {form.formState.errors.lastName && (
                            <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email", { required: "Email is required" })}
                          placeholder="user@example.com"
                          className="mt-1 focus-ring transition-all duration-200"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="username">Username</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="username"
                            {...form.register("username")}
                            placeholder="vedamouser"
                          />
                          <Button type="button" variant="outline" onClick={generateUsername} className="hover-lift transition-all duration-200">
                            Generate
                          </Button>
                        </div>
                      </div>

                      <div className="border border-orange-300 rounded-lg p-4">
                        <Label className="text-sm font-medium">Roles *</Label>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="admin"
                              checked={form.watch("userType") === "subscriber_admin"}
                              onCheckedChange={(checked) => {
                                if (checked) form.setValue("userType", "subscriber_admin");
                              }}
                            />
                            <Label htmlFor="admin">Admin</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="user"
                              checked={form.watch("userType") === "student"}
                              onCheckedChange={(checked) => {
                                if (checked) form.setValue("userType", "student");
                              }}
                            />
                            <Label htmlFor="user">User</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="teacher"
                              checked={form.watch("userType") === "teacher"}
                              onCheckedChange={(checked) => {
                                if (checked) form.setValue("userType", "teacher");
                              }}
                            />
                            <Label htmlFor="teacher">Teacher</Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="showInTeachers"
                          {...form.register("showInTeachersPage")}
                        />
                        <Label htmlFor="showInTeachers">Show this teacher's profile in the Teachers page.</Label>
                      </div>

                      <div>
                        <Label>Account status</Label>
                        <Select
                          value={form.watch("isActive") ? "active" : "inactive"}
                          onValueChange={(value) => form.setValue("isActive", value === "active")}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">active</SelectItem>
                            <SelectItem value="inactive">inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Storage</Label>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">829.9MB of 0MB used</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div>
                        <Label>Profile picture</Label>
                        <p className="text-xs text-gray-500">(PNG, JPG, GIF files, 256x256px recommended)</p>
                      </div>
                      <div className="mt-4 flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                          {form.watch("firstName") && form.watch("lastName") 
                            ? `${form.watch("firstName")[0]}${form.watch("lastName")[0]}`.toUpperCase()
                            : <User className="w-12 h-12" />
                          }
                        </div>
                        <Button type="button" variant="outline" className="gap-2 hover-lift transition-all duration-200">
                          <Upload className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                          UPLOAD NEW PHOTO
                        </Button>
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
                  <p className="text-gray-600">Additional personal information can be added here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change password</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Password management will be handled by authentication system.</p>
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

          <div className="flex justify-start gap-4 mt-8">
            <Button type="submit" disabled={createUser.isPending} className="bg-green-600 hover:bg-green-700 btn-animate hover-lift transition-all duration-200">
              {createUser.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "SAVE CHANGES"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation(backUrl)} className="hover-lift transition-all duration-200">
              CANCEL CHANGES
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}