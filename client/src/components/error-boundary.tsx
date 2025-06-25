import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Bug, Copy, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  isolate?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
  errorId: string;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Send to error tracking service (if configured)
    this.reportError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorId: this.state.errorId,
        level: this.props.level || 'component'
      };

      // Store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('eduease_errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      localStorage.setItem('eduease_errors', JSON.stringify(existingErrors));

      console.log('Error report stored:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: newRetryCount
      });
    } else {
      // Max retries reached, show permanent error state
      console.warn('Max retries reached for error boundary');
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        console.log('Error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy error details:', err);
      });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount } = this.state;
      const { fallback: FallbackComponent, level = 'component' } = this.props;

      if (FallbackComponent && error && errorInfo) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            retry={this.handleRetry}
            errorId={errorId}
            retryCount={retryCount}
          />
        );
      }

      return (
        <div className="error-boundary-container p-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900">
                    {level === 'critical' ? 'Critical Error' : 'Something went wrong'}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {errorId}
                    </Badge>
                    {retryCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Attempt {retryCount}/{this.maxRetries}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error?.message || 'An unexpected error occurred while rendering this component.'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && (
                <details className="bg-gray-100 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details (Development)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error Stack:</strong>
                      <pre className="mt-1 overflow-auto">{error?.stack}</pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-auto">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-2">
                {retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button onClick={this.handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                
                {level === 'page' && (
                  <Button onClick={this.handleGoHome} variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
                
                <Button onClick={this.copyErrorDetails} variant="ghost" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Details
                </Button>
              </div>

              <div className="text-xs text-gray-600">
                If this problem persists, please contact support with the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;