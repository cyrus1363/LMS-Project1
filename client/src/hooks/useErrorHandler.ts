import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorDiagnostics } from '@/utils/errorDiagnostics';
import { intelligentErrorMessages } from '@/utils/intelligentErrorMessages';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  critical?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | string, 
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
      critical = false
    } = options;

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorMessage = errorObj.message;
    
    // Generate intelligent error message
    const intelligentMessage = intelligentErrorMessages.generateMessage(errorObj, { context, critical });

    // Enhanced logging with diagnostics
    if (logError) {
      const diagnostics = errorDiagnostics.collectDiagnostics();
      const errorContext = errorDiagnostics.generateErrorContext(errorObj);
      
      console.group(`🚨 Enhanced Error Handler: ${context || 'Unknown Context'}`);
      console.error('Original Error:', errorObj);
      console.error('Intelligent Message:', intelligentMessage);
      console.error('Error Context:', errorContext);
      console.error('Diagnostics:', diagnostics);
      console.error('Critical:', critical);
      console.groupEnd();
    }

    // Show toast notification with intelligent message
    if (showToast) {
      toast({
        title: critical ? 'Critical Error' : intelligentMessage.category.charAt(0).toUpperCase() + intelligentMessage.category.slice(1) + ' Error',
        description: intelligentMessage.userMessage,
        variant: 'destructive',
        duration: critical ? 10000 : 5000
      });
    }

    // Store enhanced error report
    try {
      const diagnostics = errorDiagnostics.collectDiagnostics();
      const errorContext = errorDiagnostics.generateErrorContext(errorObj);
      
      const errorReport = {
        message: errorMessage,
        stack: errorObj.stack,
        context: context || 'useErrorHandler',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        critical,
        intelligentMessage,
        diagnostics,
        errorContext
      };

      const existingErrors = JSON.parse(localStorage.getItem('eduease_errors') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 50 errors (increased for better diagnostics)
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      
      localStorage.setItem('eduease_errors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.error('Failed to store enhanced error report:', storageError);
    }

    // For critical errors, consider additional actions
    if (critical) {
      // Could trigger additional alerts, send to monitoring service, etc.
      console.error('CRITICAL ERROR DETECTED:', errorMessage);
    }
  }, [toast]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context, options);
      throw error; // Re-throw to allow calling code to handle if needed
    }
  }, [handleError]);

  const wrapAsyncFunction = useCallback((
    asyncFn: () => Promise<any>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    return async () => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error as Error, context, options);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    wrapAsyncFunction
  };
}