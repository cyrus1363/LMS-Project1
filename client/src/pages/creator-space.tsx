import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  Wand2, 
  Calendar, 
  Users, 
  Globe, 
  Lock, 
  Building, 
  Upload, 
  Eye, 
  Save, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  UserPlus,
  FileText,
  Palette,
  Settings,
  Copy,
  Play,
  BookOpen,
  Target,
  Zap,
  Crown,
  AlertCircle,
  Download,
  Upload as UploadIcon
} from "lucide-react";

interface ClassTemplate {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  isGlobal: boolean;
  createdBy: string;
  enrollmentType: 'public' | 'private' | 'auto-enroll';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface EnrollmentTypeOption {
  value: 'public' | 'private' | 'auto-enroll';
  label: string;
  description: string;
  icon: any;
}

export default function CreatorSpace() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    timezone: 'UTC-5',
    enrollmentType: 'public' as 'public' | 'private' | 'auto-enroll',
    selectedTemplate: '',
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#64748b', 
      accent: '#10b981'
    },
    facilitators: [] as string[],
    maxStudents: 100,
    // User Management
    addUsersNow: false,
    // CPE Compliance
    cpeEnabled: false,
    cpeCreditHours: 0,
    courseApprovalNumber: '',
    competencyMapping: '',
    // Learning Pathway
    pathwayType: 'none' as 'none' | 'new' | 'existing',
    newPathwayName: '',
    newPathwayDescription: '',
    existingPathwayId: '',
    pathwayRule: 'optional' as 'mandatory' | 'optional',
    certificateType: 'completion' as 'completion' | 'badge' | 'custom',
    // Draft saving
    isDraft: false
  });

  const [templates, setTemplates] = useState<ClassTemplate[]>([
    {
      id: '1',
      title: 'Healthcare Compliance Course',
      description: 'Comprehensive HIPAA and healthcare regulatory training',
      thumbnail: '/api/placeholder/300/200',
      category: 'Compliance',
      isGlobal: true,
      createdBy: 'System',
      enrollmentType: 'public',
      colorScheme: { primary: '#059669', secondary: '#64748b', accent: '#0ea5e9' }
    },
    {
      id: '2', 
      title: 'Professional Development Workshop',
      description: 'Skills training and career advancement program',
      thumbnail: '/api/placeholder/300/200',
      category: 'Professional',
      isGlobal: false,
      createdBy: 'Dr. Sarah Wilson',
      enrollmentType: 'private',
      colorScheme: { primary: '#7c3aed', secondary: '#64748b', accent: '#f59e0b' }
    },
    {
      id: '3',
      title: 'Technical Certification Training',
      description: 'Industry-standard technical skills certification',
      thumbnail: '/api/placeholder/300/200',
      category: 'Technical',
      isGlobal: true,
      createdBy: 'System',
      enrollmentType: 'auto-enroll',
      colorScheme: { primary: '#dc2626', secondary: '#64748b', accent: '#8b5cf6' }
    }
  ]);

  const enrollmentTypes: EnrollmentTypeOption[] = [
    {
      value: 'public',
      label: 'Public Enrollment',
      description: 'Anyone can discover and join this class',
      icon: Globe
    },
    {
      value: 'private', 
      label: 'Private (Invite Only)',
      description: 'Students need invitation or approval to join',
      icon: Lock
    },
    {
      value: 'auto-enroll',
      label: 'Organization Auto-Enroll',
      description: 'Automatically enroll all organization members',
      icon: Building
    }
  ];

  const timezones = [
    { value: 'UTC-12', label: 'Baker Island, Howland Island (UTC-12)' },
    { value: 'UTC-11', label: 'American Samoa, Niue (UTC-11)' },
    { value: 'UTC-10', label: 'Hawaii, Cook Islands (UTC-10)' },
    { value: 'UTC-9', label: 'Alaska, Gambier Islands (UTC-9)' },
    { value: 'UTC-8', label: 'Los Angeles, Vancouver (UTC-8)' },
    { value: 'UTC-7', label: 'Denver, Phoenix (UTC-7)' },
    { value: 'UTC-6', label: 'Chicago, Mexico City (UTC-6)' },
    { value: 'UTC-5', label: 'New York, Toronto (UTC-5)' },
    { value: 'UTC-4', label: 'Santiago, Atlantic Canada (UTC-4)' },
    { value: 'UTC-3', label: 'São Paulo, Buenos Aires (UTC-3)' },
    { value: 'UTC-2', label: 'South Georgia, Fernando de Noronha (UTC-2)' },
    { value: 'UTC-1', label: 'Azores, Cape Verde (UTC-1)' },
    { value: 'UTC+0', label: 'London, Dublin, Lisbon (UTC+0)' },
    { value: 'UTC+1', label: 'Paris, Berlin, Rome (UTC+1)' },
    { value: 'UTC+2', label: 'Cairo, Athens, Helsinki (UTC+2)' },
    { value: 'UTC+3', label: 'Moscow, Nairobi, Istanbul (UTC+3)' },
    { value: 'UTC+4', label: 'Dubai, Baku, Mauritius (UTC+4)' },
    { value: 'UTC+5', label: 'Karachi, Tashkent, Yekaterinburg (UTC+5)' },
    { value: 'UTC+6', label: 'Dhaka, Almaty, Omsk (UTC+6)' },
    { value: 'UTC+7', label: 'Bangkok, Jakarta, Ho Chi Minh City (UTC+7)' },
    { value: 'UTC+8', label: 'Beijing, Singapore, Manila (UTC+8)' },
    { value: 'UTC+9', label: 'Tokyo, Seoul, Pyongyang (UTC+9)' },
    { value: 'UTC+10', label: 'Sydney, Melbourne, Port Moresby (UTC+10)' },
    { value: 'UTC+11', label: 'Solomon Islands, New Caledonia (UTC+11)' },
    { value: 'UTC+12', label: 'Auckland, Fiji, Marshall Islands (UTC+12)' }
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.startDate !== '' && formData.endDate !== '';
      case 3:
        return true; // Enrollment type has default value
      case 4:
        return true; // Template is optional
      case 5:
        return true; // User management is optional
      case 6:
        return !formData.cpeEnabled || (formData.cpeCreditHours > 0 && formData.competencyMapping !== '');
      case 7:
        return formData.pathwayType === 'none' || 
               (formData.pathwayType === 'new' && formData.newPathwayName.trim() !== '') ||
               (formData.pathwayType === 'existing' && formData.existingPathwayId !== '');
      default:
        return true;
    }
  };

  const validateDateConflict = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();
    
    if (startDate < now) {
      toast({
        title: "Date Validation Error",
        description: "Start date cannot be in the past",
        variant: "destructive",
      });
      return false;
    }
    
    if (endDate <= startDate) {
      toast({
        title: "Date Validation Error", 
        description: "End date must be after start date",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (currentStep === 2 && !validateDateConflict()) {
      return;
    }
    
    if (validateStep(currentStep) && currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createClass = async () => {
    try {
      const classData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timezone: formData.timezone,
        enrollmentType: formData.enrollmentType,
        maxStudents: formData.maxStudents,
        colorScheme: formData.colorScheme,
        instructorId: user?.id
      };

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      if (response.ok) {
        toast({
          title: "Class Created Successfully!",
          description: `"${formData.title}" is now ready for students`,
        });
        
        // Redirect to classes page to see the new class
        window.location.href = '/classes';
      } else {
        const error = await response.json();
        toast({
          title: "Error Creating Class",
          description: error.message || "Failed to create class",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Creating Class",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectTemplate = (template: ClassTemplate) => {
    setFormData({
      ...formData,
      selectedTemplate: template.id,
      colorScheme: template.colorScheme,
      enrollmentType: template.enrollmentType
    });
  };

  const handleBulkImport = () => {
    toast({
      title: "Bulk Import",
      description: "CSV import functionality would be implemented here",
    });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'master_admin';
  const isOrgSubscriber = user?.tier === 'subscriber_org';

  if (!isAdmin && !isOrgSubscriber) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600">Creator Space is available to Admins and Organization Subscribers only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/classes'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Creator Space
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Wand2 className="h-6 w-6 text-purple-600" />
                  Creator Space
                </h1>
                <p className="text-gray-600">Build engaging learning experiences</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Crown className="h-3 w-3 mr-1" />
              {isAdmin ? 'Admin Access' : 'Org Subscriber'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Class Setup Wizard</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/classes">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Existing Classes
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFormData({...formData, isDraft: true})}>
                Save as Draft
              </Button>
              <Button variant="outline" size="sm">
                Preview
              </Button>
            </div>
          </div>
          
          <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="1">Basic Info</TabsTrigger>
              <TabsTrigger value="2">Schedule</TabsTrigger>
              <TabsTrigger value="3">Enrollment</TabsTrigger>
              <TabsTrigger value="4">Template</TabsTrigger>
              <TabsTrigger value="5">Users</TabsTrigger>
              <TabsTrigger value="6">CPE</TabsTrigger>
              <TabsTrigger value="7">Pathway</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        1
                      </div>
                      <h3 className="text-xl font-semibold">Basic Information</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Class Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter class title..."
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what students will learn..."
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxStudents">Maximum Students</Label>
                        <Input
                          id="maxStudents"
                          type="number"
                          placeholder="100"
                          value={formData.maxStudents}
                          onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 100 })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Schedule & Dates */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        2
                      </div>
                      <h3 className="text-xl font-semibold">Schedule & Dates</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Conflict Warning */}
                    {formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate) && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">End date must be after start date</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Enrollment Type */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        3
                      </div>
                      <h3 className="text-xl font-semibold">Enrollment Type</h3>
                    </div>

                    <div className="grid gap-4">
                      {enrollmentTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <Card
                            key={type.value}
                            className={`cursor-pointer transition-all ${
                              formData.enrollmentType === type.value
                                ? 'ring-2 ring-purple-500 bg-purple-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setFormData({ ...formData, enrollmentType: type.value })}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                  formData.enrollmentType === type.value ? 'bg-purple-600 text-white' : 'bg-gray-100'
                                }`}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {type.label}
                                    {formData.enrollmentType === type.value && (
                                      <CheckCircle className="h-4 w-4 text-purple-600" />
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4: Template Selection */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        4
                      </div>
                      <h3 className="text-xl font-semibold">Choose Template</h3>
                    </div>

                    <Tabs defaultValue="templates">
                      <TabsList>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="custom">Custom Design</TabsTrigger>
                      </TabsList>

                      <TabsContent value="templates" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {templates
                            .filter(template => isAdmin || !template.isGlobal || template.createdBy === user?.id)
                            .map((template) => (
                            <Card
                              key={template.id}
                              className={`cursor-pointer transition-all ${
                                formData.selectedTemplate === template.id
                                  ? 'ring-2 ring-purple-500'
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => selectTemplate(template)}
                            >
                              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative">
                                <div 
                                  className="absolute inset-4 rounded"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${template.colorScheme.primary}, ${template.colorScheme.accent})` 
                                  }}
                                />
                                {formData.selectedTemplate === template.id && (
                                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                                    <CheckCircle className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold">{template.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {template.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>By {template.createdBy}</span>
                                  {template.isGlobal && (
                                    <Badge variant="secondary" className="text-xs">
                                      Global
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="custom" className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Primary Color</Label>
                            <Input
                              type="color"
                              value={formData.colorScheme.primary}
                              onChange={(e) => setFormData({
                                ...formData,
                                colorScheme: { ...formData.colorScheme, primary: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Secondary Color</Label>
                            <Input
                              type="color"
                              value={formData.colorScheme.secondary}
                              onChange={(e) => setFormData({
                                ...formData,
                                colorScheme: { ...formData.colorScheme, secondary: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Accent Color</Label>
                            <Input
                              type="color"
                              value={formData.colorScheme.accent}
                              onChange={(e) => setFormData({
                                ...formData,
                                colorScheme: { ...formData.colorScheme, accent: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="aspect-video bg-gradient-to-br rounded-lg p-6 text-white relative overflow-hidden"
                             style={{ 
                               background: `linear-gradient(135deg, ${formData.colorScheme.primary}, ${formData.colorScheme.accent})` 
                             }}>
                          <h3 className="text-xl font-bold mb-2">{formData.title || 'Your Class Title'}</h3>
                          <p className="opacity-90">{formData.description || 'Class description will appear here...'}</p>
                          <div className="absolute bottom-4 right-4">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Step 5: User Management */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        5
                      </div>
                      <h3 className="text-xl font-semibold">User Management</h3>
                    </div>

                    {/* Add Users Now Toggle */}
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">User Assignment</h4>
                          <p className="text-sm text-gray-600">Choose when to add users to this class</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={formData.addUsersNow ? "outline" : "default"}
                            onClick={() => setFormData({...formData, addUsersNow: false})}
                          >
                            Add Later
                          </Button>
                          <Button
                            size="sm"
                            variant={formData.addUsersNow ? "default" : "outline"}
                            onClick={() => setFormData({...formData, addUsersNow: true})}
                          >
                            Add Now
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="facilitators">
                      <TabsList>
                        <TabsTrigger value="facilitators">Facilitators</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                      </TabsList>

                      <TabsContent value="facilitators" className="space-y-4">
                        <div className="flex gap-2">
                          <Input placeholder="Enter email address..." className="flex-1" />
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Facilitator
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Facilitators can manage course content, grade assignments, and moderate discussions.
                        </p>
                      </TabsContent>

                      <TabsContent value="students" className="space-y-4">
                        {formData.enrollmentType === 'auto-enroll' ? (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-blue-900">Auto-Enrollment Active</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              All organization members will be automatically enrolled in this class.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input placeholder="Enter student email..." className="flex-1" />
                              <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Student
                              </Button>
                            </div>
                            {formData.enrollmentType === 'public' && (
                              <p className="text-sm text-gray-600">
                                Students can also self-enroll since this is a public class.
                              </p>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="bulk" className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="font-medium mb-2">Bulk Import Users</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Upload a CSV file or sync with Active Directory
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={handleBulkImport}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload CSV
                            </Button>
                            <Button variant="outline">
                              <Building className="h-4 w-4 mr-2" />
                              AD Sync
                            </Button>
                          </div>
                        </div>
                        <div className="text-center">
                          <Button variant="link" className="text-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download CSV Template
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Step 6: CPE Compliance */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        6
                      </div>
                      <h3 className="text-xl font-semibold">CPE Compliance</h3>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cpeEnabled}
                          onChange={(e) => setFormData({...formData, cpeEnabled: e.target.checked})}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="font-medium">Enable NASBA CPE Compliance</span>
                      </label>
                    </div>

                    {formData.cpeEnabled && (
                      <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cpeCreditHours">CPE Credit Hours *</Label>
                            <Input
                              id="cpeCreditHours"
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="1.0"
                              value={formData.cpeCreditHours}
                              onChange={(e) => setFormData({...formData, cpeCreditHours: parseFloat(e.target.value) || 0})}
                            />
                            <p className="text-xs text-gray-600 mt-1">Based on 50 minutes = 1 CPE credit</p>
                          </div>

                          <div>
                            <Label htmlFor="courseApprovalNumber">Course Approval Number</Label>
                            <Input
                              id="courseApprovalNumber"
                              placeholder="e.g., NASBA-2024-001"
                              value={formData.courseApprovalNumber}
                              onChange={(e) => setFormData({...formData, courseApprovalNumber: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="competencyMapping">Competency Mapping</Label>
                          <Select 
                            value={formData.competencyMapping} 
                            onValueChange={(value) => setFormData({...formData, competencyMapping: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select competency area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="accounting">Accounting Standards</SelectItem>
                              <SelectItem value="auditing">Auditing & Attestation</SelectItem>
                              <SelectItem value="tax">Taxation</SelectItem>
                              <SelectItem value="ethics">Professional Ethics</SelectItem>
                              <SelectItem value="management">Management Services</SelectItem>
                              <SelectItem value="technology">Information Technology</SelectItem>
                              <SelectItem value="specialized">Specialized Knowledge</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <h4 className="font-medium text-blue-900 mb-2">NASBA Requirements</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Attendance tracking will be automatically enforced</li>
                            <li>• 5+ year audit logs will be maintained</li>
                            <li>• Completion certificates will include verification codes</li>
                            <li>• Progress monitoring ensures minimum engagement time</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 7: Learning Pathway */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        7
                      </div>
                      <h3 className="text-xl font-semibold">Learning Pathway</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium mb-3 block">Pathway Configuration</Label>
                        <div className="grid gap-4">
                          <Card 
                            className={`cursor-pointer transition-all ${formData.pathwayType === 'none' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setFormData({...formData, pathwayType: 'none'})}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                Standalone Class
                                {formData.pathwayType === 'none' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">This class won't be part of any learning pathway</p>
                            </CardContent>
                          </Card>

                          <Card 
                            className={`cursor-pointer transition-all ${formData.pathwayType === 'new' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setFormData({...formData, pathwayType: 'new'})}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                Create New Pathway
                                {formData.pathwayType === 'new' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">Start a new learning pathway with this class</p>
                            </CardContent>
                          </Card>

                          <Card 
                            className={`cursor-pointer transition-all ${formData.pathwayType === 'existing' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setFormData({...formData, pathwayType: 'existing'})}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                Add to Existing Pathway
                                {formData.pathwayType === 'existing' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">Add this class to an existing learning pathway</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* New Pathway Details */}
                      {formData.pathwayType === 'new' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                          <div>
                            <Label htmlFor="newPathwayName">Pathway Name *</Label>
                            <Input
                              id="newPathwayName"
                              placeholder="e.g., Healthcare Compliance Certification"
                              value={formData.newPathwayName}
                              onChange={(e) => setFormData({...formData, newPathwayName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="newPathwayDescription">Pathway Description</Label>
                            <Textarea
                              id="newPathwayDescription"
                              placeholder="Describe the learning journey and outcomes..."
                              rows={3}
                              value={formData.newPathwayDescription}
                              onChange={(e) => setFormData({...formData, newPathwayDescription: e.target.value})}
                            />
                          </div>
                        </div>
                      )}

                      {/* Existing Pathway Selection */}
                      {formData.pathwayType === 'existing' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                          <div>
                            <Label htmlFor="existingPathway">Select Pathway</Label>
                            <Select 
                              value={formData.existingPathwayId} 
                              onValueChange={(value) => setFormData({...formData, existingPathwayId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Search and select pathway..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pathway1">Healthcare Compliance Track</SelectItem>
                                <SelectItem value="pathway2">Professional Development Series</SelectItem>
                                <SelectItem value="pathway3">Technical Certification Program</SelectItem>
                                <SelectItem value="pathway4">Leadership Excellence Path</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Pathway Rules */}
                      {(formData.pathwayType === 'new' || formData.pathwayType === 'existing') && (
                        <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                          <h4 className="font-medium">Pathway Rules</h4>
                          
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Class Requirement</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={formData.pathwayRule === 'mandatory' ? 'default' : 'outline'}
                                onClick={() => setFormData({...formData, pathwayRule: 'mandatory'})}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                Mandatory
                              </Button>
                              <Button
                                size="sm"
                                variant={formData.pathwayRule === 'optional' ? 'default' : 'outline'}
                                onClick={() => setFormData({...formData, pathwayRule: 'optional'})}
                              >
                                Optional
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Certificate Type</Label>
                            <Select 
                              value={formData.certificateType} 
                              onValueChange={(value: any) => setFormData({...formData, certificateType: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completion">Completion Certificate</SelectItem>
                                <SelectItem value="badge">Digital Badge</SelectItem>
                                <SelectItem value="custom">Custom Certificate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={prevStep} 
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < 7 ? (
                    <Button 
                      onClick={nextStep} 
                      disabled={!validateStep(currentStep)}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={createClass} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Create Class
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="aspect-video rounded-lg p-4 text-white relative"
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.colorScheme.primary}, ${formData.colorScheme.accent})` 
                  }}
                >
                  <h3 className="font-bold mb-2 text-sm">
                    {formData.title || 'Class Title'}
                  </h3>
                  <p className="text-xs opacity-90 line-clamp-3">
                    {formData.description || 'Class description...'}
                  </p>
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {formData.enrollmentType === 'public' && <Globe className="h-3 w-3" />}
                    {formData.enrollmentType === 'private' && <Lock className="h-3 w-3" />}
                    {formData.enrollmentType === 'auto-enroll' && <Building className="h-3 w-3" />}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment:</span>
                    <Badge variant="outline" className="text-xs">
                      {enrollmentTypes.find(t => t.value === formData.enrollmentType)?.label}
                    </Badge>
                  </div>
                  
                  {formData.startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starts:</span>
                      <span className="text-xs">
                        {new Date(formData.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Students:</span>
                    <span className="text-xs">{formData.maxStudents}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quick Actions</h4>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Copy className="h-3 w-3 mr-2" />
                    Clone Settings
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Play className="h-3 w-3 mr-2" />
                    Preview Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}