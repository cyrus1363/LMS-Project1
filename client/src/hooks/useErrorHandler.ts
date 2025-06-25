import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Log error
    if (logError) {
      console.group(`🚨 Error Handler: ${context || 'Unknown Context'}`);
      console.error('Message:', errorMessage);
      if (errorStack) {
        console.error('Stack:', errorStack);
      }
      console.error('Context:', context);
      console.error('Critical:', critical);
      console.groupEnd();
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: critical ? 'Critical Error' : 'Error',
        description: errorMessage || fallbackMessage,
        variant: 'destructive',
        duration: critical ? 10000 : 5000
      });
    }

    // Store error for debugging
    try {
      const errorReport = {
        message: errorMessage,
        stack: errorStack,
        context: context || 'useErrorHandler',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        critical
      };

      const existingErrors = JSON.parse(localStorage.getItem('eduease_errors') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 20 errors
      if (existingErrors.length > 20) {
        existingErrors.splice(0, existingErrors.length - 20);
      }
      
      localStorage.setItem('eduease_errors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.error('Failed to store error:', storageError);
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