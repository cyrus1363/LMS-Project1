import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Crown, 
  Building2, 
  Users, 
  GraduationCap,
  BarChart3,
  Shield,
  Settings,
  Database,
  Zap,
  Globe,
  Lock,
  FileCheck,
  UserCheck,
  MessageSquare,
  Award,
  Monitor,
  Link,
  CloudDownload,
  Search,
  BookOpen,
  Smartphone,
  Linkedin,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

export default function TierManagementPage() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>("lms_owner");

  // Mock data for demonstration - replace with real API calls
  const tierData = {
    lms_owner: {
      title: "LMS Owner (Root)",
      icon: Crown,
      color: "from-purple-600 to-indigo-600",
      description: "Complete platform governance and cross-organization control",
      users: 1,
      organizations: 25,
      features: [
        { name: "Cross-Org Analytics", icon: BarChart3, status: "active", description: "Unified analytics across all subscriber organizations" },
        { name: "Custom SSO/SAML", icon: Shield, status: "active", description: "Enterprise single sign-on configuration" },
        { name: "Webhook/API Governance", icon: Link, status: "active", description: "Control and monitor all API integrations" },
        { name: "System Audit Trails", icon: FileCheck, status: "active", description: "Complete system-level activity monitoring" },
        { name: "Global Branding", icon: Globe, status: "active", description: "Platform-wide theming and branding control" },
        { name: "Subscriber Management", icon: Building2, status: "active", description: "Manage all subscriber organizations" }
      ]
    },
    subscriber_org: {
      title: "Subscriber Organization",
      icon: Building2,
      color: "from-blue-600 to-cyan-600",
      description: "Organization-level management with white-labeling and compliance",
      users: 150,
      classes: 45,
      features: [
        { name: "User/Class/Certification Management", icon: Users, status: "active", description: "Full organizational user control" },
        { name: "White-labeling", icon: Globe, status: "active", description: "Custom branding and domain configuration" },
        { name: "AI/SCORM Integration", icon: Zap, status: "active", description: "Advanced content and AI features" },
        { name: "LDAP/Active Directory Sync", icon: Database, status: "active", description: "Enterprise directory integration" },
        { name: "Automated Cohort Rules", icon: Settings, status: "active", description: "Smart student grouping and management" },
        { name: "Sandbox Environments", icon: Monitor, status: "active", description: "Safe testing and development spaces" },
        { name: "Data Retention Policies", icon: Lock, status: "active", description: "GDPR/FERPA compliance controls" },
        { name: "Accessibility Checker", icon: Eye, status: "active", description: "Automated accessibility compliance" }
      ]
    },
    facilitator: {
      title: "Facilitator/Trainer",
      icon: Users,
      color: "from-green-600 to-emerald-600",
      description: "Enhanced teaching tools with plagiarism detection and analytics",
      classes: 12,
      students: 340,
      features: [
        { name: "Edit Class Activities", icon: BookOpen, status: "active", description: "Create and modify learning content" },
        { name: "Grade Submissions", icon: Award, status: "active", description: "Comprehensive grading and feedback tools" },
        { name: "Moderate Discussions", icon: MessageSquare, status: "active", description: "Manage student interactions and forums" },
        { name: "Plagiarism Detection", icon: Search, status: "active", description: "Automated plagiarism scanning and reporting" },
        { name: "Rubric Grading", icon: CheckCircle, status: "active", description: "Structured assessment criteria" },
        { name: "Live Breakout Rooms", icon: Users, status: "active", description: "Virtual collaboration spaces" },
        { name: "Attendance/Engagement Heatmaps", icon: BarChart3, status: "active", description: "Visual student engagement analytics" }
      ]
    },
    student: {
      title: "Student/Learner",
      icon: GraduationCap,
      color: "from-orange-600 to-red-600",
      description: "Enhanced learning experience with peer collaboration and personalization",
      courses: 8,
      certificates: 3,
      features: [
        { name: "Access Courses/Cohorts", icon: BookOpen, status: "active", description: "Join and participate in learning programs" },
        { name: "Earn Certifications", icon: Award, status: "active", description: "Complete courses and earn verified certificates" },
        { name: "Join Discussions", icon: MessageSquare, status: "active", description: "Collaborate with peers and instructors" },
        { name: "Peer Reviews", icon: UserCheck, status: "active", description: "Evaluate and learn from fellow students" },
        { name: "Offline Content", icon: CloudDownload, status: "active", description: "Download materials for offline study" },
        { name: "LinkedIn Badge Sharing", icon: Linkedin, status: "active", description: "Share achievements on professional networks" },
        { name: "Personalized Learning Paths", icon: GraduationCap, status: "active", description: "AI-driven customized learning journeys" }
      ]
    }
  };

  const currentTierData = tierData[selectedTier as keyof typeof tierData];
  const IconComponent = currentTierData.icon;

  const getTierAccess = (tier: string) => {
    // Master admin and admin have access to all tiers
    if (user?.role === "master_admin" || user?.role === "admin") {
      return true;
    }
    
    const userTier = user?.tier || "student";
    const hierarchy = ["student", "facilitator", "subscriber_org", "lms_owner"];
    const userLevel = hierarchy.indexOf(userTier);
    const requiredLevel = hierarchy.indexOf(tier);
    return userLevel >= requiredLevel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">4-Tier LMS Management</h1>
              <p className="text-gray-600">Comprehensive role-based platform governance and feature access</p>
            </div>
          </div>

          {/* Current User Tier Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Your Access Level: {user?.tier?.replace('_', ' ').toUpperCase() || 'STUDENT'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Role: {user?.role?.toUpperCase() || 'STUDENT'}
            </Badge>
          </div>
        </div>

        {/* Tier Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(tierData).map(([tier, data]) => {
            const IconComp = data.icon;
            const hasAccess = getTierAccess(tier);
            
            return (
              <Card 
                key={tier}
                className={`cursor-pointer transition-all ${
                  selectedTier === tier 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : hasAccess 
                      ? 'hover:shadow-md' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => hasAccess && setSelectedTier(tier)}
              >
                <CardHeader className="pb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${data.color} text-white w-fit`}>
                    <IconComp className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{data.title}</CardTitle>
                  <CardDescription className="text-sm">{data.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasAccess && (
                    <Badge variant="destructive" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Access Restricted
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Tier Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${currentTierData.color} text-white`}>
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentTierData.title}</CardTitle>
                <CardDescription className="text-lg">{currentTierData.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="features" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="features">Core Features</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="security">Security & Compliance</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTierData.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <FeatureIcon className="h-5 w-5 text-green-600" />
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <Badge 
                              variant={feature.status === 'active' ? 'default' : 'secondary'}
                              className="ml-auto"
                            >
                              {feature.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Active Users</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Engagement Rate</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Content Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Course Completion</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Assessment Scores</span>
                          <span>88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Certifications Earned</span>
                          <span>156</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Peer Reviews</span>
                          <span>89%</span>
                        </div>
                        <Progress value={89} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        GDPR/FERPA Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Data retention policies active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Audit trails enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Export requests: 2 pending</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Access Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">IP restrictions active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">SSO/SAML configured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">2FA pending for 5 users</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Zoom Integration", status: "active", type: "LTI" },
                    { name: "Microsoft Teams", status: "active", type: "LTI" },
                    { name: "Turnitin Plagiarism", status: "active", type: "API" },
                    { name: "LDAP/Active Directory", status: "active", type: "Auth" },
                    { name: "LinkedIn Learning", status: "pending", type: "API" },
                    { name: "Canvas LTI", status: "active", type: "LTI" }
                  ].map((integration, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{integration.name}</CardTitle>
                          <Badge 
                            variant={integration.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {integration.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="text-xs">
                          {integration.type}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your tier level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Launch Sandbox
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <CloudDownload className="h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure LDAP
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}