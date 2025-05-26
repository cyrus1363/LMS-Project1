import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, BookOpen, FileText, PenTool, Upload, Edit, Trash, Play, Users } from "lucide-react";
import ContentEditor from "@/components/content/content-editor";
import FileUpload from "@/components/content/file-upload";

const createContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  type: z.enum(["lesson", "assessment", "resource", "scorm"]),
  classId: z.number(),
  isPublished: z.boolean().default(false),
});

type CreateContentData = z.infer<typeof createContentSchema>;

export default function Content() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: user?.role === "admin" || user?.role === "trainer",
  });

  const { data: allContent, isLoading } = useQuery({
    queryKey: ["/api/content", "all"],
    enabled: user?.role === "admin" || user?.role === "trainer",
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: CreateContentData & { files?: File[] }) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "files") {
          formData.append(key, value.toString());
        }
      });
      
      if (data.files) {
        data.files.forEach(file => {
          formData.append("files", file);
        });
      }

      const response = await fetch("/api/content", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create content");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      setIsCreateOpen(false);
      setSelectedFiles([]);
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create content",
        variant: "destructive",
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: number) => {
      await apiRequest("DELETE", `/api/content/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateContentData>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "lesson",
      isPublished: false,
    },
  });

  const onSubmit = (data: CreateContentData) => {
    createContentMutation.mutate({
      ...data,
      files: selectedFiles,
    });
  };

  const handleDeleteContent = (contentId: number) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteContentMutation.mutate(contentId);
    }
  };

  const canCreateContent = user?.role === "admin" || user?.role === "trainer";

  const filteredContent = allContent?.filter((content: any) => {
    if (selectedTab === "all") return true;
    return content.type === selectedTab;
  }) || [];

  const getContentIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-5 w-5" />;
      case "assessment":
        return <PenTool className="h-5 w-5" />;
      case "resource":
        return <FileText className="h-5 w-5" />;
      case "scorm":
        return <Upload className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "lesson":
        return "default";
      case "assessment":
        return "secondary";
      case "resource":
        return "outline";
      case "scorm":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!canCreateContent) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">
                You don't have permission to manage content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Create and manage learning content</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Create educational content for your classes.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter content title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lesson">Lesson</SelectItem>
                            <SelectItem value="assessment">Assessment</SelectItem>
                            <SelectItem value="resource">Resource</SelectItem>
                            <SelectItem value="scorm">SCORM Package</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes?.map((classItem: any) => (
                            <SelectItem key={classItem.id} value={classItem.id.toString()}>
                              {classItem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <ContentEditor 
                          value={field.value || ""} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>File Attachments</Label>
                  <FileUpload
                    files={selectedFiles}
                    onFilesChange={setSelectedFiles}
                    maxFiles={5}
                    maxSize={100 * 1024 * 1024} // 100MB
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Publish immediately
                      </FormLabel>
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
                    disabled={createContentMutation.isPending}
                  >
                    Create Content
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="lesson">Lessons</TabsTrigger>
          <TabsTrigger value="assessment">Assessments</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
          <TabsTrigger value="scorm">SCORM</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Grid */}
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
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content: any) => (
            <Card key={content.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getContentIcon(content.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">{content.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getTypeBadgeVariant(content.type)}>
                          {content.type}
                        </Badge>
                        <Badge variant={content.isPublished ? "default" : "secondary"}>
                          {content.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteContent(content.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4 line-clamp-2">
                  {content.content 
                    ? content.content.replace(/<[^>]*>/g, '').substring(0, 100) + "..."
                    : "No content description"}
                </CardDescription>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {content.author?.firstName} {content.author?.lastName}</span>
                  <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>0 interactions</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500 mb-6">
            {selectedTab === "all" 
              ? "Create your first piece of content to get started."
              : `No ${selectedTab} content found. Try a different filter.`}
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      )}
    </div>
  );
}
