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
        <div className="mb-8">
          <Link to="/organizations" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add Organization</h1>
          <p className="text-gray-600 mt-2">Create a new subscriber organization with its own isolated environment</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="language">Language *</Label>
                  <Select
                    value={form.watch("language")}
                    onValueChange={(value) => form.setValue("language", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="organizationType">Type *</Label>
                  <Select
                    value={form.watch("organizationType")}
                    onValueChange={(value) => form.setValue("organizationType", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Satine MI Office"
                  className="mt-1"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="domain">Organization Code *</Label>
                <Input
                  id="domain"
                  {...form.register("domain")}
                  placeholder="e.g., satine-mi"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">This will be used for the subdomain: {form.watch("domain") || "subdomain"}.yourlms.com</p>
                {form.formState.errors.domain && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.domain.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="effectiveDate">Effective Date *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    defaultValue="2025-01-01"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Registration / Activation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">User Registration / Activation</CardTitle>
              <p className="text-sm text-red-600">This section is only available when configuring</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="defaultActiveDays">Default # Active Days for Users *</Label>
                  <Input
                    id="defaultActiveDays"
                    type="number"
                    {...form.register("defaultActiveDays", { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="userLimit">Maximum users allowed for this Location *</Label>
                  <Input
                    id="userLimit"
                    type="number"
                    {...form.register("userLimit", { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>User Type *</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="totalActive" name="userType" defaultChecked />
                    <Label htmlFor="totalActive">Total Active Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="totalRegistered" name="userType" />
                    <Label htmlFor="totalRegistered">Total Registered (Active/Inactive) Users</Label>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="selfRegOpen">Self-Registration Open Date *</Label>
                  <Input
                    id="selfRegOpen"
                    type="date"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="selfRegClose">Self-Registration Close Date *</Label>
                  <Input
                    id="selfRegClose"
                    type="date"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Address */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Address</CardTitle>
              <p className="text-sm text-gray-600">These fields are not required, but if you choose to specify an address, you must fill out all of the fields. Lines 2 and 3 of the street address are always optional.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="address">Street *</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="100 E. Michigan Avenue (Line 1)"
                  className="mt-1"
                />
                <Input
                  placeholder="Suite 200 (Line 2)"
                  className="mt-2"
                />
                <Input
                  placeholder="(Line 3)"
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Saline"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={form.watch("country")}
                    onValueChange={(value) => form.setValue("country", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Select
                    value={form.watch("state")}
                    onValueChange={(value) => form.setValue("state", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Michigan">Michigan</SelectItem>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Texas">Texas</SelectItem>
                      <SelectItem value="Florida">Florida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    {...form.register("postalCode")}
                    placeholder="48176"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button type="submit" disabled={createOrganization.isPending} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {createOrganization.isPending ? "Creating..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}