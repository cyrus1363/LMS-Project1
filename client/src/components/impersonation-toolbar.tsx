import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { User, UserX, Eye, Crown, X, ChevronDown } from "lucide-react";

export default function ImpersonationToolbar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("GET", "/api/users"),
    select: (data) => Array.isArray(data) ? data.filter((u: any) => u.id !== user?.id) : [], // Exclude current user
    enabled: !!user && (user.userType === 'system_owner' || user.id === '43132359')
  });

  const createMockUsersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/create-mock-users"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Mock users created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mock users",
        variant: "destructive",
      });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/impersonate/${userId}`),
    onSuccess: (data) => {
      toast({
        title: "Impersonation Started",
        description: `Now viewing as ${data.user.name}`,
      });
      // Refresh the page to apply new user context
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start impersonation",
        variant: "destructive",
      });
    },
  });

  const stopImpersonationMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/stop-impersonation"),
    onSuccess: () => {
      toast({
        title: "Impersonation Stopped",
        description: "Returned to your account",
      });
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stop impersonation",
        variant: "destructive",
      });
    },
  });

  // Only show for system owners - check both userType field and if user is the original system owner
  if (!user || (user.userType !== 'system_owner' && user.id !== '43132359')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-orange-200 bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-700">
              <Crown className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-sm">System Owner Tools</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-orange-100"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 hover:bg-orange-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">

        {/* Mock Users Creation */}
        <Button
          onClick={() => createMockUsersMutation.mutate()}
          disabled={createMockUsersMutation.isPending}
          size="sm"
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {createMockUsersMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <User className="w-4 h-4 mr-2" />
          )}
          Create Mock Users (17)
        </Button>

        {/* User Impersonation */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Impersonate User:</label>
          <div className="flex gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span>{user.firstName} {user.lastName}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.userType?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => selectedUserId && impersonateMutation.mutate(selectedUserId)}
              disabled={!selectedUserId || impersonateMutation.isPending}
              size="sm"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stop Impersonation */}
        <Button
          onClick={() => stopImpersonationMutation.mutate()}
          disabled={stopImpersonationMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <UserX className="w-4 h-4 mr-2" />
          Stop Impersonation
        </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}