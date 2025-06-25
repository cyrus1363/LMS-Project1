import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertOrganizationSchema, type InsertOrganization } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function CreateOrganization() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertOrganization>({
    resolver: zodResolver(insertOrganizationSchema),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
      language: "English",
      organizationType: "Corporate",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      country: "United States",
      postalCode: "",
      userLimit: 100,
      storageLimit: 5,
      defaultActiveDays: 365,
      isActive: true,
    },
  });

  const createOrganization = useMutation({
    mutationFn: async (data: InsertOrganization) => {
      return await apiRequest("/api/organizations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Organization created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      setLocation("/organizations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertOrganization) => {
    createOrganization.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 gap-2"
            onClick={() => setLocation("/organizations")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Organization</h1>
              <p className="text-gray-600">Set up a new subscriber organization with custom settings</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain *</Label>
                  <div className="flex">
                    <Input
                      id="subdomain"
                      value={formData.subdomain}
                      onChange={(e) => handleInputChange("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="acme"
                      required
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-50 border border-l-0 rounded-r-md px-3 py-2 text-sm text-gray-600">
                      .eduelms.com
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of the organization"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Subscription & Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subscription">Subscription Tier</Label>
                  <Select
                    value={formData.subscriptionTier}
                    onValueChange={(value) => handleInputChange("subscriptionTier", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (Limited)</SelectItem>
                      <SelectItem value="basic">Basic ($29/month)</SelectItem>
                      <SelectItem value="professional">Professional ($99/month)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => handleInputChange("maxUsers", parseInt(e.target.value))}
                    min="1"
                    max="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="maxStorage">Storage Limit (MB)</Label>
                  <Input
                    id="maxStorage"
                    type="number"
                    value={formData.maxStorage}
                    onChange={(e) => handleInputChange("maxStorage", parseInt(e.target.value))}
                    min="100"
                    max="100000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="admin@acme.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Organization URL</Label>
                  <p className="text-sm text-blue-600">
                    {formData.subdomain ? `${formData.subdomain}.eduelms.com` : "subdomain.eduelms.com"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan Features</Label>
                  <div className="text-sm text-gray-600">
                    <p>• {formData.maxUsers} users maximum</p>
                    <p>• {(formData.maxStorage / 1000).toFixed(1)} GB storage</p>
                    <p>• {formData.subscriptionTier === 'free' ? 'Basic' : 'Premium'} features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/organizations")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOrganization.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {createOrganization.isPending ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}