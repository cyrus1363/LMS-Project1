import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Clock, FileText, Download, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CPETracker() {
  const { user } = useAuth();

  const { data: cpeData, isLoading } = useQuery({
    queryKey: ["/api/cpe/summary"],
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ["/api/cpe/certificates"],
    enabled: !!user,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["/api/cpe/audit-logs"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCredits = cpeData?.totalCredits || 0;
  const activeCredits = cpeData?.activeCredits || 0;
  const yearlyRequirement = 40; // Standard CPE requirement
  const progressPercentage = (activeCredits / yearlyRequirement) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CPE Tracker</h1>
          <p className="text-muted-foreground">
            Track your Continuing Professional Education credits and NASBA compliance
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Shield className="w-4 h-4 mr-1" />
          NASBA Compliant
        </Badge>
      </div>

      {/* CPE Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CPE Credits</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earned credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Credits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCredits}</div>
            <p className="text-xs text-muted-foreground">
              Currently valid credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.min(progressPercentage, 100).toFixed(0)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {activeCredits} of {yearlyRequirement} required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CPE Certificates
              </CardTitle>
              <CardDescription>
                Your official NASBA-compliant certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates?.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert: any) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{cert.className}</h4>
                          <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                            {cert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Certificate #{cert.certificateNumber}
                        </p>
                        <p className="text-sm">
                          <strong>{cert.cpeCreditsAwarded} CPE Credits</strong> • 
                          Issued {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No certificates earned yet</p>
                  <p className="text-sm">Complete NASBA-approved courses to earn certificates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CPE Audit Logs</CardTitle>
              <CardDescription>
                Complete history of your CPE activities for compliance verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs?.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{log.className}</h4>
                          <Badge variant="outline">{log.action}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.cpeCreditsEarned} CPE Credits • 
                          {log.timeSpentMinutes} minutes • 
                          Score: {log.assessmentScore || 'N/A'}%
                        </p>
                        <p className="text-sm">
                          Completed {new Date(log.completionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={log.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                        {log.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs available</p>
                  <p className="text-sm">Your CPE activities will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                NASBA Compliance Status
              </CardTitle>
              <CardDescription>
                Your compliance status and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Annual Requirement</h4>
                  <p className="text-2xl font-bold">{yearlyRequirement} CPE Credits</p>
                  <p className="text-sm text-muted-foreground">
                    Standard professional requirement
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Current Status</h4>
                  <p className="text-2xl font-bold">
                    {activeCredits >= yearlyRequirement ? (
                      <span className="text-green-600">Compliant</span>
                    ) : (
                      <span className="text-orange-600">In Progress</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeCredits >= yearlyRequirement 
                      ? "You meet the annual requirements"
                      : `${yearlyRequirement - activeCredits} credits remaining`
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Compliance Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">NASBA-approved courses only</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">50 minutes = 1 CPE credit</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Assessment completion required</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">5+ year record retention</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}