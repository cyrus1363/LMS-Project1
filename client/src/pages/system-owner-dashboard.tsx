import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Building2, 
  Users, 
  BookOpen, 
  CreditCard,
  Plus,
  Settings,
  BarChart3,
  Shield,
  Globe
} from "lucide-react";

export default function SystemOwnerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/system/stats"],
  });

  const { data: organizations } = useQuery({
    queryKey: ["/api/organizations"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600">Manage your LMS platform and subscriber organizations</p>
            </div>
            <div className="flex gap-3">
              <Link href="/system-settings">
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  System Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Organizations</p>
                  <p className="text-2xl font-bold">{stats?.totalOrganizations || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organizations List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Subscriber Organizations</span>

                </CardTitle>
              </CardHeader>
              <CardContent>
                {!organizations || organizations.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first subscriber organization to the platform.</p>
                    <Link href="/organizations/create">
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Organization
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizations.map((org: any) => (
                      <Link key={org.id} href={`/organizations/${org.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium">{org.name}</h4>
                              <p className="text-sm text-gray-600">{org.subdomain}.yourlms.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={org.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                              {org.subscriptionStatus || 'active'}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/system-settings">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Shield className="w-4 h-4" />
                    Security Settings
                  </Button>
                </Link>
                <Link href="/system-settings">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Globe className="w-4 h-4" />
                    Global Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Storage</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Services</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• New organization "Acme Corp" created</p>
                  <p>• System backup completed successfully</p>
                  <p>• 3 new users registered across all organizations</p>
                  <p>• Weekly analytics report generated</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}