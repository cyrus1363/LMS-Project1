import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Home, FileX, Settings, Users } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  retry: () => void;
  errorId: string;
  retryCount: number;
}

// Page-level error fallback
export function PageErrorFallback({ error, retry, errorId, retryCount }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">Page Error</CardTitle>
          <Badge variant="secondary" className="w-fit mx-auto">
            {errorId}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This page encountered an error and couldn't load properly.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button onClick={retry} disabled={retryCount >= 3}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again {retryCount > 0 && `(${retryCount}/3)`}
            </Button>
            
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button onClick={() => window.location.reload()} variant="ghost">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Browser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Course-related error fallback
export function CourseErrorFallback({ error, retry, errorId }: ErrorFallbackProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 m-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileX className="w-6 h-6 text-yellow-600" />
          <div>
            <CardTitle className="text-yellow-900">Course Loading Error</CardTitle>
            <Badge variant="outline" className="text-xs mt-1">
              {errorId}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription>
            Unable to load course content. This might be a temporary issue.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={retry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => window.history.back()} variant="outline" size="sm">
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Form error fallback
export function FormErrorFallback({ error, retry, errorId }: ErrorFallbackProps) {
  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <div className="flex items-center justify-between">
        <div>
          <AlertDescription className="text-red-900">
            Form encountered an error. Your data may not be saved.
          </AlertDescription>
          <Badge variant="secondary" className="text-xs mt-1">
            {errorId}
          </Badge>
        </div>
        <Button onClick={retry} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </Alert>
  );
}

// User management error fallback
export function UserManagementErrorFallback({ error, retry, errorId }: ErrorFallbackProps) {
  return (
    <Card className="border-orange-200 bg-orange-50 m-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-orange-600" />
          <div>
            <CardTitle className="text-orange-900">User Management Error</CardTitle>
            <Badge variant="outline" className="text-xs mt-1">
              {errorId}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription>
            Unable to load user data. Please check your permissions.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={retry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Settings error fallback
export function SettingsErrorFallback({ error, retry, errorId }: ErrorFallbackProps) {
  return (
    <Card className="border-purple-200 bg-purple-50 m-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-purple-600" />
          <div>
            <CardTitle className="text-purple-900">Settings Error</CardTitle>
            <Badge variant="outline" className="text-xs mt-1">
              {errorId}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription>
            Settings panel failed to load. Some features may not be available.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={retry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => window.history.back()} variant="outline" size="sm">
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}