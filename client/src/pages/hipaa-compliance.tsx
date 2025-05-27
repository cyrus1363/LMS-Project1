import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Eye, 
  FileX, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Trash2,
  Database,
  FileText,
  Users,
  File
} from "lucide-react";

interface ComplianceStatus {
  isCompliant: boolean;
  findings: string[];
  recommendations: string[];
}

interface PhiScanResult {
  phiDetected: boolean;
  detectedTypes: string[];
  confidenceScore: number;
  quarantined: boolean;
}

export default function HipaaCompliance() {
  const [scanContent, setScanContent] = useState("");
  const [scanFileId, setScanFileId] = useState("");
  const [deleteFileId, setDeleteFileId] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deletionMethod, setDeletionMethod] = useState("overwrite_7pass");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch compliance status
  const { data: complianceStatus, isLoading: statusLoading } = useQuery<ComplianceStatus>({
    queryKey: ["/api/hipaa/compliance-status"],
    retry: false,
  });

  // PHI scanning mutation
  const scanMutation = useMutation({
    mutationFn: async (data: { content: string; fileId: string }) => {
      const response = await apiRequest("POST", "/api/hipaa/scan-content", data);
      return response.json();
    },
    onSuccess: (data: PhiScanResult) => {
      if (data.phiDetected) {
        toast({
          title: "PHI Detected!",
          description: `Found ${data.detectedTypes.join(", ")} with ${Math.round(data.confidenceScore * 100)}% confidence`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "No PHI Detected",
          description: "Content appears safe to process",
        });
      }
    },
    onError: () => {
      toast({
        title: "Scan Failed",
        description: "Unable to scan content for PHI",
        variant: "destructive",
      });
    },
  });

  // Secure deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (data: { fileId: string; reason: string; method: string }) => {
      const response = await apiRequest("DELETE", `/api/hipaa/secure-delete/${data.fileId}`, {
        reason: data.reason,
        method: data.method
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Secure Deletion Complete",
          description: "File has been securely deleted according to HIPAA standards",
        });
        setDeleteFileId("");
        setDeleteReason("");
      } else {
        toast({
          title: "Deletion Failed",
          description: data.message || "Unable to securely delete file",
          variant: "destructive",
        });
      }
    },
  });

  const handlePhiScan = () => {
    if (!scanContent.trim()) {
      toast({
        title: "No Content",
        description: "Please enter content to scan for PHI",
        variant: "destructive",
      });
      return;
    }
    
    scanMutation.mutate({
      content: scanContent,
      fileId: scanFileId || `scan-${Date.now()}`
    });
  };

  const handleSecureDelete = () => {
    if (!deleteFileId.trim() || !deleteReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both file ID and deletion reason",
        variant: "destructive",
      });
      return;
    }
    
    deleteMutation.mutate({
      fileId: deleteFileId,
      reason: deleteReason,
      method: deletionMethod
    });
  };

  const getComplianceColor = (isCompliant: boolean) => {
    return isCompliant ? "text-green-600" : "text-red-600";
  };

  const getComplianceIcon = (isCompliant: boolean) => {
    return isCompliant ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HIPAA Compliance Center</h1>
            <p className="text-gray-600">Comprehensive protection for Protected Health Information (PHI)</p>
          </div>
        </div>

        {/* Compliance Status Overview */}
        {statusLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ) : complianceStatus ? (
          <Alert className={`mb-6 ${complianceStatus.isCompliant ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className={`flex items-center gap-2 ${getComplianceColor(complianceStatus.isCompliant)}`}>
              {getComplianceIcon(complianceStatus.isCompliant)}
              <AlertDescription className="text-lg font-semibold">
                {complianceStatus.isCompliant ? 'HIPAA Compliant' : 'Compliance Issues Detected'}
              </AlertDescription>
            </div>
          </Alert>
        ) : null}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phi-detection">PHI Detection</TabsTrigger>
          <TabsTrigger value="secure-deletion">Secure Deletion</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="controls">Security Controls</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Encryption Status</CardTitle>
                <Lock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">AES-256</div>
                <p className="text-xs text-muted-foreground">Data at rest & in transit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Retention</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">6+ Years</div>
                <p className="text-xs text-muted-foreground">HIPAA compliant retention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Access Controls</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">RBAC</div>
                <p className="text-xs text-muted-foreground">Role-based access control</p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Findings */}
          {complianceStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {complianceStatus.findings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      Compliance Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {complianceStatus.findings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {complianceStatus.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {complianceStatus.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* PHI Detection Tab */}
        <TabsContent value="phi-detection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                PHI Content Scanner
              </CardTitle>
              <CardDescription>
                Scan content for Protected Health Information using advanced pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File ID (Optional)</label>
                <Input
                  placeholder="Enter file identifier for tracking"
                  value={scanFileId}
                  onChange={(e) => setScanFileId(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Content to Scan</label>
                <Textarea
                  placeholder="Paste content here to scan for PHI..."
                  value={scanContent}
                  onChange={(e) => setScanContent(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handlePhiScan} 
                disabled={scanMutation.isPending}
                className="w-full"
              >
                {scanMutation.isPending ? "Scanning..." : "Scan for PHI"}
              </Button>

              {scanMutation.data && (
                <Alert className={scanMutation.data.phiDetected ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                  <div className="flex items-center gap-2">
                    {scanMutation.data.phiDetected ? (
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription>
                      {scanMutation.data.phiDetected ? (
                        <div>
                          <p className="font-semibold text-red-800">PHI Detected!</p>
                          <p>Types: {scanMutation.data.detectedTypes.join(", ")}</p>
                          <p>Confidence: {Math.round(scanMutation.data.confidenceScore * 100)}%</p>
                          {scanMutation.data.quarantined && (
                            <Badge variant="destructive" className="mt-1">Quarantined</Badge>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold text-green-800">No PHI detected - content is safe</p>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secure Deletion Tab */}
        <TabsContent value="secure-deletion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileX className="h-5 w-5" />
                HIPAA-Compliant File Deletion
              </CardTitle>
              <CardDescription>
                Securely delete files containing PHI with cryptographic verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File ID</label>
                <Input
                  placeholder="Enter file identifier to delete"
                  value={deleteFileId}
                  onChange={(e) => setDeleteFileId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deletion Method</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={deletionMethod}
                  onChange={(e) => setDeletionMethod(e.target.value)}
                >
                  <option value="overwrite_3pass">3-Pass Overwrite (Fast)</option>
                  <option value="overwrite_7pass">7-Pass Overwrite (Recommended)</option>
                  <option value="dod_5220">DoD 5220.22-M Standard</option>
                  <option value="crypto_erase">Cryptographic Erasure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Justification</label>
                <Textarea
                  placeholder="Provide reason for deletion (required for audit trail)"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSecureDelete} 
                disabled={deleteMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? "Securely Deleting..." : "Perform Secure Deletion"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AuditLog className="h-5 w-5" />
                HIPAA Audit Trail
              </CardTitle>
              <CardDescription>
                Comprehensive logging of all PHI access and system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">6+ Years</div>
                  <p className="text-sm text-blue-800">Retention Period</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">AES-256</div>
                  <p className="text-sm text-green-800">Log Encryption</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Real-time</div>
                  <p className="text-sm text-purple-800">Activity Tracking</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">72hr</div>
                  <p className="text-sm text-orange-800">Breach Notification</p>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  All user interactions with PHI are automatically logged and encrypted. 
                  Audit logs include timestamps, user identification, actions performed, and business justification.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Encryption at Rest</span>
                  <Badge variant="outline" className="text-green-600">AES-256 ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Encryption in Transit</span>
                  <Badge variant="outline" className="text-green-600">TLS 1.3+ ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Key Management</span>
                  <Badge variant="outline" className="text-green-600">PBKDF2 ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Security</span>
                  <Badge variant="outline" className="text-green-600">PostgreSQL ✓</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Access Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Role-Based Access (RBAC)</span>
                  <Badge variant="outline" className="text-green-600">Active ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Multi-Factor Authentication</span>
                  <Badge variant="outline" className="text-yellow-600">Planned</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Management</span>
                  <Badge variant="outline" className="text-green-600">Secure ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access Logging</span>
                  <Badge variant="outline" className="text-green-600">Complete ✓</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  PHI Safeguards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Automatic PHI Detection</span>
                  <Badge variant="outline" className="text-green-600">Regex ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Content Quarantine</span>
                  <Badge variant="outline" className="text-green-600">Auto ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secure File Deletion</span>
                  <Badge variant="outline" className="text-green-600">DoD 5220 ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Loss Prevention</span>
                  <Badge variant="outline" className="text-green-600">Active ✓</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Risk Assessments</span>
                  <Badge variant="outline" className="text-green-600">Annual ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Incident Response</span>
                  <Badge variant="outline" className="text-green-600">72hr ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Business Associate Agreements</span>
                  <Badge variant="outline" className="text-green-600">Tracked ✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Staff Training</span>
                  <Badge variant="outline" className="text-yellow-600">In Progress</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}