import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Shield, 
  Globe, 
  Database,
  Mail,
  Bell,
  Key,
  Users,
  Building2,
  Save,
  CheckCircle,
  AlertTriangle,
  Lock
} from "lucide-react";

export default function SystemSettings() {
  const { toast } = useToast();
  
  // Fetch HIPAA compliance status
  const { data: hipaaStatus } = useQuery({
    queryKey: ["/api/security/hipaa/status"],
    retry: false,
  });

  // Fetch CPE compliance status
  const { data: cpeStatus } = useQuery({
    queryKey: ["/api/security/cpe/status"],
    retry: false,
  });

  // Test encryption functionality
  const testEncryption = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/security/encryption/test", {
        method: "POST",
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Encryption Test",
        description: data.success ? "Encryption system working correctly" : "Encryption test failed",
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test encryption system",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure global LMS settings and system preferences</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Globe className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="EduEase LMS" />
                  </div>
                  <div>
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" type="email" defaultValue="support@eduelms.com" />
                  </div>
                  <div>
                    <Label htmlFor="max-orgs">Max Organizations</Label>
                    <Input id="max-orgs" type="number" defaultValue="100" />
                  </div>
                  <Button className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Toggles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>AI Content Generation</Label>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Multi-tenant Support</Label>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Analytics Dashboard</Label>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* HIPAA Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    HIPAA Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Compliance Status</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {hipaaStatus?.compliant ? "Compliant" : "Checking..."}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>PHI Encryption</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {hipaaStatus?.encryption || "AES-256-GCM"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Audit Logging</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {hipaaStatus?.auditLogging || "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>PHI Detection</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {hipaaStatus?.phiDetection || "Enabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Secure File Deletion</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {hipaaStatus?.secureFileDeletion || "DOD 5220.22-M"}
                    </Badge>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      size="sm"
                      onClick={() => testEncryption.mutate()}
                      disabled={testEncryption.isPending}
                    >
                      <Shield className="w-4 h-4" />
                      {testEncryption.isPending ? "Testing..." : "Test Encryption"}
                    </Button>
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <Database className="w-4 h-4" />
                      View Audit Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Authentication & Access Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" type="number" defaultValue="60" />
                  </div>
                  <div>
                    <Label htmlFor="password-min">Minimum Password Length</Label>
                    <Input id="password-min" type="number" defaultValue="8" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Role-Based Access Control</Label>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Button className="w-full gap-2">
                    <Shield className="w-4 h-4" />
                    Update Security Settings
                  </Button>
                </CardContent>
              </Card>

              {/* API Security */}
              <Card>
                <CardHeader>
                  <CardTitle>API Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                    <Input id="rate-limit" type="number" defaultValue="100" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>API Key Rotation</Label>
                    <Badge>90 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>CORS Protection</Label>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Request Signing</Label>
                    <Badge className="bg-green-100 text-green-800">HMAC-SHA256</Badge>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Key className="w-4 h-4" />
                    Generate New API Keys
                  </Button>
                </CardContent>
              </Card>

              {/* CPE & Professional Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Professional Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>NASBA CPE Tracking</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {cpeStatus?.cpeTracking || "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Certificate Generation</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {cpeStatus?.certificateGeneration || "Automated"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Completion Verification</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {cpeStatus?.verificationMethod || "Hash-Verified"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Time Tracking</Label>
                    <Badge className="bg-green-100 text-green-800">
                      {cpeStatus?.timeTracking || "50min = 1 CPE"}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Bell className="w-4 h-4" />
                    View CPE Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" type="number" defaultValue="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-user">SMTP Username</Label>
                    <Input id="smtp-user" type="email" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-pass">SMTP Password</Label>
                    <Input id="smtp-pass" type="password" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Save Email Settings
                  </Button>
                  <Button variant="outline" className="ml-3">
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>External Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>OpenAI Integration</Label>
                    <Badge>Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Stripe Payments</Label>
                    <Badge variant="secondary">Not Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Zoom Integration</Label>
                    <Badge variant="secondary">Not Connected</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Integrations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhooks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input id="webhook-url" placeholder="https://your-domain.com/webhook" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>User Events</Label>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Course Events</Label>
                    <Badge>Enabled</Badge>
                  </div>
                  <Button className="w-full">
                    Save Webhook Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Connection Status</Label>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Database Size</Label>
                    <span className="text-sm font-medium">2.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active Connections</Label>
                    <span className="text-sm font-medium">12/100</span>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Database className="w-4 h-4" />
                    Run Diagnostics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Last Backup</Label>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Backup Frequency</Label>
                    <Badge>Daily</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-Vacuum</Label>
                    <Badge>Enabled</Badge>
                  </div>
                  <Button className="w-full">
                    Backup Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}