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

        {/* Placeholder for other tabs - will implement next */}
        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle>Client & Account Management</CardTitle>
              <CardDescription>Coming next - tenant management system</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System-Wide Controls</CardTitle>
              <CardDescription>Coming next - system configuration</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Access Control</CardTitle>
              <CardDescription>Coming next - security management</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Protocols</CardTitle>
              <CardDescription>Coming next - emergency controls</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}