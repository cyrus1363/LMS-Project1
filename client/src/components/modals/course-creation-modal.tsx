import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Bold, 
  Italic, 
  Underline, 
  Type,
  List,
  ListOrdered,
  Link2,
  Image,
  Video,
  Save,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Zap,
  ShoppingCart,
  HelpCircle,
  BarChart3,
  Home
} from "lucide-react";

interface CourseCreationModalProps {
  organizationId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface CourseFormData {
  title: string;
  description: string;
  instructorId: string;
  price: number;
  currency: string;
  billingPeriod: number;
  billingCycles: number;
  prepaidPeriods: number;
  onlineSessions: number;
  isHidden: boolean;
  isMandatory: boolean;
  isActive: boolean;
  additionalFees: number;
}

export default function CourseCreationModal({ organizationId, isOpen, onClose }: CourseCreationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showTeacherSearch, setShowTeacherSearch] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("courses");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const form = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      description: "",
      instructorId: "",
      price: 0,
      currency: "BGN",
      billingPeriod: 1,
      billingCycles: 1,
      prepaidPeriods: 1,
      onlineSessions: 1,
      isHidden: false,
      isMandatory: false,
      isActive: true,
      additionalFees: 0
    }
  });

  // Fetch available teachers
  const { data: teachers } = useQuery({
    queryKey: ["/api/users", "teachers"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users?userType=teacher&organizationId=${organizationId}`);
      return response;
    },
    enabled: isOpen
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const courseData = {
        ...data,
        organizationId,
        instructorId: selectedTeachers[0] || data.instructorId
      };
      return await apiRequest("POST", "/api/courses", courseData);
    },
    onSuccess: (newCourse) => {
      toast({
        title: "Success",
        description: "Course created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", organizationId, "courses"] });
      onClose();
      form.reset();
      setSelectedTeachers([]);
      
      // Navigate to the new course page
      setTimeout(() => {
        window.location.href = `/courses/${newCourse.id}`;
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    if (selectedTeachers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one teacher",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(data);
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "virtual-classrooms", label: "Virtual classrooms", icon: Video },
    { id: "courses", label: "Courses", icon: FileText, active: true, subitems: ["Courses list", "Packages", "Reviews"] },
    { id: "file-library", label: "File library", icon: FileText },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Account & settings", icon: Settings },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "orders", label: "Orders", icon: ShoppingCart }
  ];

  const renderNavContent = () => {
    switch (activeNavItem) {
      case "courses":
        return renderCourseCreation();
      case "file-library":
        return renderFileLibrary();
      case "quizzes":
        return renderQuizzes();
      case "messages":
        return renderMessages();
      case "integrations":
        return renderIntegrations();
      default:
        return renderCourseCreation();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">
                {activeNavItem === "courses" ? "New Course" : navigationItems.find(item => item.id === activeNavItem)?.label}
              </DialogTitle>
              <p className="text-sm text-gray-600">← Back to all units</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Sidebar - Navigation */}
          <div className={`${isNavCollapsed ? 'w-16' : 'w-64'} bg-gray-50 border-r transition-all duration-300 flex-shrink-0 overflow-hidden`}>
            <div className="p-4 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                {!isNavCollapsed && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      TO
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Training Organization</h3>
                      <p className="text-xs text-gray-600">profile</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                  className="p-1"
                >
                  {isNavCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeNavItem === item.id;
                  
                  return (
                    <div key={item.id}>
                      <div
                        onClick={() => setActiveNavItem(item.id)}
                        className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-gray-700 text-white' 
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        {!isNavCollapsed && (
                          <span className="text-sm font-medium truncate">{item.label}</span>
                        )}
                      </div>
                      
                      {/* Subitems for Courses */}
                      {item.subitems && isActive && !isNavCollapsed && (
                        <div className="ml-7 mt-2 space-y-1">
                          {item.subitems.map((subitem, index) => (
                            <div key={index} className="text-sm text-gray-300 hover:text-white cursor-pointer p-1">
                              — {subitem}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderNavContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  function renderCourseCreation() {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Course Details Tab */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 text-lg">Details about the unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4 border-2 border-orange-400 p-4 rounded">
                      <div>
                        <Label htmlFor="title">Name</Label>
                        <Input
                          id="title"
                          {...form.register("title", { required: true })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <div className="mt-1">
                          {/* Rich Text Editor Toolbar */}
                          <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex items-center space-x-2">
                            <Button type="button" variant="ghost" size="sm">
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              <Italic className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              <Underline className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              <Type className="w-4 h-4" />
                            </Button>
                            <Select defaultValue="font">
                              <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="font">Font</SelectItem>
                                <SelectItem value="arial">Arial</SelectItem>
                                <SelectItem value="helvetica">Helvetica</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="format">
                              <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="format">Format</SelectItem>
                                <SelectItem value="p">Paragraph</SelectItem>
                                <SelectItem value="h1">Heading 1</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="size">
                              <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="size">Size</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="14">14</SelectItem>
                                <SelectItem value="16">16</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="ghost" size="sm">
                              <List className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              <ListOrdered className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              <Link2 className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              <Image className="w-4 h-4" />
                            </Button>
                          </div>
                          <Textarea
                            {...form.register("description")}
                            className="rounded-t-none border-t-0 min-h-32"
                            placeholder="Source"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="onlineSessions">Number of online sessions</Label>
                        <Input
                          id="onlineSessions"
                          type="number"
                          {...form.register("onlineSessions", { valueAsNumber: true })}
                          className="mt-1"
                          defaultValue={1}
                        />
                      </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                      {/* Teachers Section */}
                      <div className="border border-gray-300 p-4 rounded">
                        <div className="flex items-center justify-between mb-3">
                          <Label>Teachers</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTeacherSearch(!showTeacherSearch)}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            ADD NEW TEACHER
                          </Button>
                        </div>
                        
                        {showTeacherSearch && (
                          <div className="mb-3 space-y-2">
                            <Select onValueChange={(value) => {
                              if (value && !selectedTeachers.includes(value)) {
                                setSelectedTeachers([...selectedTeachers, value]);
                              }
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {(teachers || []).map((teacher: any) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.firstName} {teacher.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          {selectedTeachers.map((teacherId) => {
                            const teacher = (teachers || []).find((t: any) => t.id === teacherId);
                            return (
                              <Badge key={teacherId} variant="secondary" className="gap-2">
                                {teacher?.firstName} {teacher?.lastName}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId))}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Billing Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Billing information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="price">Price</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              {...form.register("price", { valueAsNumber: true })}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select defaultValue="BGN" onValueChange={(value) => form.setValue("currency", value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BGN">BGN</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Additional fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...form.register("additionalFees", { valueAsNumber: true })}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="billingPeriod">Billing period duration (in months)</Label>
                            <Input
                              id="billingPeriod"
                              type="number"
                              {...form.register("billingPeriod", { valueAsNumber: true })}
                              className="mt-1"
                              defaultValue={1}
                            />
                          </div>

                          <div>
                            <Label htmlFor="billingCycles">Billing periods</Label>
                            <Input
                              id="billingCycles"
                              type="number"
                              {...form.register("billingCycles", { valueAsNumber: true })}
                              className="mt-1"
                              defaultValue={1}
                            />
                          </div>

                          <div>
                            <Label htmlFor="prepaidPeriods">Prepaid billing periods</Label>
                            <Input
                              id="prepaidPeriods"
                              type="number"
                              {...form.register("prepaidPeriods", { valueAsNumber: true })}
                              className="mt-1"
                              defaultValue={1}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Session Rules */}
                  <div className="border-2 border-orange-400 p-4 rounded space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isHidden"
                        checked={form.watch("isHidden")}
                        onCheckedChange={(checked) => form.setValue("isHidden", !!checked)}
                      />
                      <Label htmlFor="isHidden" className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        Hidden
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isMandatory"
                        checked={form.watch("isMandatory")}
                        onCheckedChange={(checked) => form.setValue("isMandatory", !!checked)}
                      />
                      <Label htmlFor="isMandatory">Mandatory</Label>
                    </div>

                    <div className="flex items-center space-x-2 border-2 border-orange-400 p-2 rounded">
                      <Checkbox
                        id="isActive"
                        checked={form.watch("isActive")}
                        onCheckedChange={(checked) => form.setValue("isActive", !!checked)}
                      />
                      <Label htmlFor="isActive" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Is active
                      </Label>
                    </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={createCourseMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white px-6"
              >
                {createCourseMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                CREATE
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    );
  }

  function renderFileLibrary() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Library Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="h-32 border-2 border-dashed border-gray-300 hover:border-blue-500">
                <div className="text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <span>Upload Files</span>
                </div>
              </Button>
              <div className="h-32 border rounded-lg p-4 bg-gray-50">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Documents</span>
                </div>
              </div>
              <div className="h-32 border rounded-lg p-4 bg-gray-50">
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Images</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderQuizzes() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Quiz Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Quiz
              </Button>
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Sample Quiz</h3>
                  <p className="text-sm text-gray-600">Multiple choice quiz with 10 questions</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
                <Button variant="outline">Broadcast</Button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                      U
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">User Message</p>
                      <p className="text-sm text-gray-600">Latest course update notification</p>
                    </div>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderIntegrations() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Third-party Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                    Z
                  </div>
                  <div>
                    <h3 className="font-semibold">Zoom Integration</h3>
                    <p className="text-sm text-gray-600">Video conferencing</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">Connect</Button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <h3 className="font-semibold">Slack Integration</h3>
                    <p className="text-sm text-gray-600">Team communication</p>
                  </div>
                </div>
                <Button size="sm" className="w-full" variant="outline">Connected</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}