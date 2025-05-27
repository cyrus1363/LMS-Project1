import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Palette, 
  Building2, 
  Users, 
  Shield, 
  Activity, 
  Globe, 
  Wrench,
  Eye,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MasterAdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(false);

  // Redirect if not master admin
  if (!user?.isMasterAdmin && user?.role !== 'master_admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">Master Admin privileges required</p>
        </div>
      </div>
    );
  }

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["/api/master-admin/tenants"],
  });

  const { data: systemConfig } = useQuery({
    queryKey: ["/api/master-admin/system-config"],
  });

  const { data: tenantBranding } = useQuery({
    queryKey: ["/api/master-admin/tenant-branding", selectedTenant],
    enabled: !!selectedTenant,
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/master-admin/stats"],
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Master Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Admin Control Panel</h1>
            <p className="text-muted-foreground">
              Complete system control and multi-tenant management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm">
            <Shield className="w-3 h-3 mr-1" />
            Master Admin
          </Badge>
          <Button 
            variant={previewMode ? "destructive" : "outline"} 
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {previewMode ? "Exit Preview" : "Preview Mode"}
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.activeTenants || 0} active, {systemStats?.trialTenants || 0} trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all tenant organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${systemStats?.monthlyRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month's recurring revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Tabs */}
      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* 1. BRANDING & LOOK/FEEL CONTROL */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Global Branding & Theme Management
              </CardTitle>
              <CardDescription>
                Control the visual identity and user experience across all tenant organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tenant Selector */}
              <div className="space-y-2">
                <Label>Select Tenant Organization</Label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tenant to customize..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global Default Theme</SelectItem>
                    {tenants?.map((tenant: any) => (
                      <SelectItem key={tenant.id} value={tenant.id.toString()}>
                        {tenant.name} ({tenant.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Palette Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Color Palette</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={tenantBranding?.primaryColor || "#3b82f6"}
                          className="w-16 h-10 p-1 rounded border"
                        />
                        <Input 
                          value={tenantBranding?.primaryColor || "#3b82f6"}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={tenantBranding?.secondaryColor || "#64748b"}
                          className="w-16 h-10 p-1 rounded border"
                        />
                        <Input 
                          value={tenantBranding?.secondaryColor || "#64748b"}
                          placeholder="#64748b"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Typography</h4>
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter (Default)</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                        <SelectItem value="lato">Lato</SelectItem>
                        <SelectItem value="custom">Upload Custom Font</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Logo & Assets */}
              <div className="space-y-4">
                <h4 className="font-medium">Brand Assets</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Logo Upload</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <Button variant="outline" size="sm">
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        SVG, PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <Button variant="outline" size="sm">
                        Upload Favicon
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        ICO, PNG 32x32px
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Login Background</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <Button variant="outline" size="sm">
                        Upload Background
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom CSS/JS Injection */}
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Custom CSS</Label>
                    <Textarea 
                      placeholder="/* Custom CSS rules */"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custom JavaScript</Label>
                    <Textarea 
                      placeholder="// Custom JavaScript code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Theme
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Theme
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Preview Changes</Button>
                  <Button>Save & Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. CLIENT & ACCOUNT MANAGEMENT */}
        <TabsContent value="tenants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create New Tenant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Create New Organization
                </CardTitle>
                <CardDescription>
                  Set up a new client tenant with custom branding and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input placeholder="Acme University" />
                  </div>
                  <div className="space-y-2">
                    <Label>Subdomain Slug</Label>
                    <Input placeholder="acme-university" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Custom Domain (Optional)</Label>
                  <Input placeholder="learning.acme.edu" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <Select defaultValue="basic">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (50 users)</SelectItem>
                        <SelectItem value="pro">Pro (500 users)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="trial">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Billing Email</Label>
                  <Input type="email" placeholder="billing@acme.edu" />
                </div>

                <Button className="w-full">Create Organization</Button>
              </CardContent>
            </Card>

            {/* Bulk Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Operations
                </CardTitle>
                <CardDescription>
                  Manage multiple tenants and users efficiently
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <Button variant="outline" size="sm">
                      Upload CSV Users
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bulk import with role assignments
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Content Transfer</Label>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="From tenant..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants?.map((tenant: any) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="To tenant..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants?.map((tenant: any) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="w-full">
                      Transfer Content
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Global Actions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Export All Data
                      </Button>
                      <Button variant="outline" size="sm">
                        Backup Tenants
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing Tenants Management */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Organizations</CardTitle>
              <CardDescription>
                Manage all client organizations and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants?.map((tenant: any) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{tenant.name}</h4>
                        <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                          {tenant.status}
                        </Badge>
                        <Badge variant="outline">{tenant.planType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tenant.slug}.eduease.com • {tenant.userCount || 0} users
                      </p>
                      {tenant.customDomain && (
                        <p className="text-sm text-blue-600">
                          Custom: {tenant.customDomain}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        Login As
                      </Button>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tenant organizations yet</p>
                    <p className="text-sm">Create your first client organization above</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. SYSTEM-WIDE CONTROLS */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Global Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Platform Settings
                </CardTitle>
                <CardDescription>
                  Control system-wide defaults and behaviors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to self-register
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Force email verification for new accounts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Features Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable OpenAI integration globally
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>NASBA Compliance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable CPE tracking and compliance
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fa">Persian/Farsi</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Feature Flags & Toggles
                </CardTitle>
                <CardDescription>
                  Control feature availability across all tenants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Roleplay Assistant</Label>
                      <p className="text-sm text-muted-foreground">
                        AI-powered roleplay coaching
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Smart Content Generation</Label>
                      <p className="text-sm text-muted-foreground">
                        AI content creation tools
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Advanced Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Detailed learning analytics
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Video Conferencing</Label>
                      <p className="text-sm text-muted-foreground">
                        Integrated video calls
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mobile App Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow mobile application usage
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>White Label Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Hide EduEase branding
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health & Monitoring
              </CardTitle>
              <CardDescription>
                Real-time system performance and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Status</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Optimal</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Services</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-muted-foreground">23%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory</span>
                    <span className="text-sm text-muted-foreground">1.2GB / 4GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-muted-foreground">45GB / 100GB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Sessions</span>
                    <span className="text-sm text-muted-foreground">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Calls/min</span>
                    <span className="text-sm text-muted-foreground">892</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-green-600">0.01%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Detailed Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    Performance Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule Maintenance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. SECURITY & ACCESS CONTROL */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Access Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  User Access & Permissions
                </CardTitle>
                <CardDescription>
                  Control user roles and access across all tenants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Force 2FA for Admins</Label>
                      <p className="text-sm text-muted-foreground">
                        Require two-factor authentication for admin users
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Whitelist Enforcement</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict admin access to approved IP addresses
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Monitoring</Label>
                      <p className="text-sm text-muted-foreground">
                        Track and log all admin activities
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Failed Login Attempts</Label>
                    <Input type="number" defaultValue="5" />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Lockout Duration (minutes)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>

                  <div className="space-y-2">
                    <Label>Password Policy</Label>
                    <Select defaultValue="strong">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (8+ chars)</SelectItem>
                        <SelectItem value="strong">Strong (12+ chars, mixed)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (16+ chars, complex)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Security Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevent abuse with request rate limits
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>HTTPS Enforcement</Label>
                      <p className="text-sm text-muted-foreground">
                        Force secure connections only
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Content Security Policy</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable CSP headers for XSS protection
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention (days)</Label>
                    <Input type="number" defaultValue="2555" placeholder="7 years default" />
                  </div>

                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Audit Log Level</Label>
                    <Select defaultValue="detailed">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="paranoid">Paranoid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Security Threats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Monitoring Dashboard
              </CardTitle>
              <CardDescription>
                Real-time security events and threat detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600">Recent Security Events</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Failed login attempts (24h)</span>
                      <span className="text-orange-600">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suspicious IP blocks</span>
                      <span className="text-red-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate limit violations</span>
                      <span className="text-yellow-600">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin privilege escalations</span>
                      <span className="text-green-600">0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Active Admin Sessions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Master Admins</span>
                      <span className="text-blue-600">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenant Admins</span>
                      <span className="text-green-600">7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Elevated Sessions</span>
                      <span className="text-orange-600">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Key Usage</span>
                      <span className="text-gray-600">145/min</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Compliance Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>GDPR Compliance</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NASBA Requirements</span>
                      <span className="text-green-600">✓ Met</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Encryption</span>
                      <span className="text-green-600">✓ AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Certificates</span>
                      <span className="text-green-600">✓ Valid</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Security Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Audit Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Security Scan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. EMERGENCY PROTOCOLS */}
        <TabsContent value="emergency" className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Critical Controls</h3>
            </div>
            <p className="text-sm text-red-700">
              These actions have immediate platform-wide effects. Use with extreme caution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Actions */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Immediate Response Actions
                </CardTitle>
                <CardDescription>
                  Critical emergency controls for platform incidents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="destructive" className="w-full justify-start" size="lg">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    PLATFORM LOCKDOWN
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Immediately disable all user access except master admins
                  </p>

                  <Button variant="destructive" className="w-full justify-start" size="lg">
                    <Shield className="w-4 h-4 mr-2" />
                    FORCE LOGOUT ALL USERS
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Terminate all active sessions across all tenants
                  </p>

                  <Button variant="destructive" className="w-full justify-start" size="lg">
                    <Settings className="w-4 h-4 mr-2" />
                    DISABLE API ACCESS
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Block all API calls except emergency management
                  </p>

                  <Button variant="destructive" className="w-full justify-start" size="lg">
                    <Activity className="w-4 h-4 mr-2" />
                    MAINTENANCE MODE
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Show maintenance page to all users
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant-Specific Emergency */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Building2 className="h-5 w-5" />
                  Tenant Emergency Controls
                </CardTitle>
                <CardDescription>
                  Target specific organizations for emergency actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Affected Tenant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose tenant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants?.map((tenant: any) => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.name} ({tenant.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-red-200 text-red-600">
                    <Users className="w-4 h-4 mr-2" />
                    Suspend Tenant Access
                  </Button>

                  <Button variant="outline" className="w-full justify-start border-orange-200 text-orange-600">
                    <Download className="w-4 h-4 mr-2" />
                    Emergency Data Export
                  </Button>

                  <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-600">
                    <Shield className="w-4 h-4 mr-2" />
                    Reset Admin Passwords
                  </Button>

                  <Button variant="outline" className="w-full justify-start border-gray-200">
                    <Settings className="w-4 h-4 mr-2" />
                    Disable Features
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Communication & Documentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Emergency Communications
                </CardTitle>
                <CardDescription>
                  Notify users and stakeholders about incidents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Emergency Notice</Label>
                  <Textarea 
                    placeholder="Enter emergency notification message..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notification Recipients</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="all-users" className="rounded" />
                      <label htmlFor="all-users" className="text-sm">All Users</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="admins-only" className="rounded" />
                      <label htmlFor="admins-only" className="text-sm">Admins Only</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="specific-tenant" className="rounded" />
                      <label htmlFor="specific-tenant" className="text-sm">Specific Tenant</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    Send Email Alert
                  </Button>
                  <Button variant="outline">
                    In-App Notification
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Incident Documentation
                </CardTitle>
                <CardDescription>
                  Track and document emergency responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Incident Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Security Breach</SelectItem>
                      <SelectItem value="performance">Performance Issue</SelectItem>
                      <SelectItem value="data">Data Integrity</SelectItem>
                      <SelectItem value="compliance">Compliance Violation</SelectItem>
                      <SelectItem value="other">Other Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Incident Notes</Label>
                  <Textarea 
                    placeholder="Document incident details, actions taken, and timeline..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button className="w-full">
                  Create Incident Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recovery & Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recovery & Status Monitoring
              </CardTitle>
              <CardDescription>
                Monitor system recovery and restore normal operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">System Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Platform Access</span>
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Normal
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API Services</span>
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Services</span>
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recovery Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Restore Normal Access
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Enable All Features
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Globe className="w-4 h-4 mr-2" />
                      Clear Maintenance Mode
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Notify Resolution
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Incidents</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">No recent incidents</div>
                      <div className="text-muted-foreground">System running normally</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Download Incident Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    System Health Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Recovery Checklist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}