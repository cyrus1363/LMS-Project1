import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Settings, Plus, Eye } from "lucide-react";
import { Link } from "wouter";

export default function OrganizationsList() {
  const { data: organizations, isLoading } = useQuery({
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600">Manage subscriber organizations and their settings</p>
          </div>
          <Link to="/organizations/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Organization
            </Button>
          </Link>
        </div>

        {/* Organizations Grid */}
        {organizations && organizations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org: any) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <p className="text-sm text-gray-500">{org.subdomain}.eduelms.com</p>
                      </div>
                    </div>
                    <Badge variant={org.isActive ? "default" : "secondary"}>
                      {org.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium">{org.userCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Courses</span>
                      <span className="font-medium">{org.courseCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Plan</span>
                      <Badge variant="outline">{org.subscriptionTier || "Free"}</Badge>
                    </div>
                    <div className="pt-3 border-t">
                      <Link to={`/organizations/${org.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Eye className="w-4 h-4" />
                          Manage Organization
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Yet</h3>
            <p className="text-gray-500 mb-6">Create your first subscriber organization to get started.</p>
            <Link to="/organizations/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Organization
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}