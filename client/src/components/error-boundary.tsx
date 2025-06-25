import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, RefreshCw, Bug, Copy, Home, ChevronDown, Download } from 'lucide-react';
import { errorDiagnostics } from '@/utils/errorDiagnostics';
import { intelligentErrorMessages } from '@/utils/intelligentErrorMessages';

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

    // Enhanced error logging with diagnostics
    const diagnostics = errorDiagnostics.collectDiagnostics();
    const errorContext = errorDiagnostics.generateErrorContext(error);

    console.group('🚨 Enhanced Error Boundary Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Context:', errorContext);
    console.error('Diagnostics:', diagnostics);
    console.groupEnd();

    // Send to error tracking service with enhanced data
    this.reportError(error, errorInfo, diagnostics, errorContext);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, diagnostics?: any, errorContext?: any) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorId: this.state.errorId,
        level: this.props.level || 'component',
        diagnostics,
        errorContext
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
    const diagnostics = errorDiagnostics.collectDiagnostics();
    const errorContext = this.state.error ? errorDiagnostics.generateErrorContext(this.state.error) : {};
    
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      diagnostics,
      errorContext
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        console.log('Enhanced error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy error details:', err);
      });
  };

  private downloadErrorLog = () => {
    const diagnostics = errorDiagnostics.collectDiagnostics();
    const errorContext = this.state.error ? errorDiagnostics.generateErrorContext(this.state.error) : {};
    
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      diagnostics,
      errorContext
    };

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      // Generate intelligent error message
      const intelligentMessage = intelligentErrorMessages.generateMessage(error || new Error('Unknown error'));

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
              <Alert className={`border-${intelligentMessage.color}-200 bg-${intelligentMessage.color}-50`}>
                <AlertTriangle className={`h-4 w-4 text-${intelligentMessage.color}-600`} />
                <AlertDescription className={`text-${intelligentMessage.color}-900`}>
                  {intelligentMessage.userMessage}
                </AlertDescription>
              </Alert>

              {intelligentMessage.suggestions.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What you can try:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {intelligentMessage.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span>Technical Details</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded text-xs">
                    <div className="space-y-2">
                      <div>
                        <strong>Error Message:</strong>
                        <pre className="mt-1 overflow-auto">{intelligentMessage.technicalMessage}</pre>
                      </div>
                      {process.env.NODE_ENV === 'development' && (
                        <>
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
                        </>
                      )}
                      <div>
                        <strong>Error Category:</strong> {intelligentMessage.category}
                      </div>
                      <div>
                        <strong>Severity:</strong> {intelligentMessage.severity}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

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

                <Button onClick={this.downloadErrorLog} variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Log
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