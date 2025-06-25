import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, BookOpen, Users, Calendar, MoreHorizontal, Edit, Trash, Settings, Eye } from "lucide-react";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const createClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type CreateClassData = z.infer<typeof createClassSchema>;

export default function Classes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: classes, isLoading } = useQuery({
    queryKey: ["/api/classes"],
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: CreateClassData) => {
      const response = await apiRequest("POST", "/api/classes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      await apiRequest("DELETE", `/api/classes/${classId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateClassData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (data: CreateClassData) => {
    createClassMutation.mutate(data);
  };

  const handleDeleteClass = (classId: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      deleteClassMutation.mutate(classId);
    }
  };

  const canCreateClass = user?.role === "master_admin" || user?.role === "admin" || user?.role === "facilitator";
  const canManageClass = user?.role === "master_admin" || user?.role === "admin" || user?.role === "facilitator";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">
            {user?.role === "student" 
              ? "View and access your enrolled classes"
              : "Manage your classes and content"}
          </p>
        </div>
        {canCreateClass && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Create a new class to start organizing your content.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter class title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter class description" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createClassMutation.isPending}
                    >
                      Create Class
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes && classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem: any) => (
            <Card key={classItem.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{classItem.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {classItem.instructor 
                        ? `${classItem.instructor.firstName} ${classItem.instructor.lastName}`
                        : classItem.instructorId}
                    </CardDescription>
                  </div>
                  {canManageClass && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/classes/${classItem.id}/manage`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Class
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/classes/${classItem.id}/preview`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Frontend
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClass(classItem.id)}
                          className="text-red-600"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {classItem.description || "No description available"}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {classItem.enrollmentCount || 0}
                    </div>
                    {classItem.startDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(classItem.startDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge variant={classItem.isActive ? "default" : "secondary"}>
                    {classItem.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" asChild>
                    <Link href={`/classes/${classItem.id}/preview`}>
                      <Eye className="w-4 h-4 mr-2" />
                      {user?.role === "student" ? "Access Class" : "Preview"}
                    </Link>
                  </Button>
                  {canManageClass && (
                    <Button className="flex-1" asChild>
                      <Link href={`/classes/${classItem.id}/manage`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-500 mb-6">
            {user?.role === "student" 
              ? "You haven't enrolled in any classes yet."
              : "Create your first class to get started."}
          </p>
          {canCreateClass && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Class
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
