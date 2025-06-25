// Error reporting utilities
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  level: 'error' | 'warning' | 'critical';
  context?: Record<string, any>;
  recovered?: boolean;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private readonly storageKey = 'eduease_error_reports';
  private readonly maxReports = 50;

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  // Store error report locally
  public reportError(error: ErrorReport): void {
    try {
      const existingReports = this.getStoredReports();
      existingReports.push(error);

      // Keep only the most recent reports
      if (existingReports.length > this.maxReports) {
        existingReports.splice(0, existingReports.length - this.maxReports);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(existingReports));
      
      console.group('📊 Error Report Stored');
      console.log('Error ID:', error.id);
      console.log('Level:', error.level);
      console.log('Message:', error.message);
      console.groupEnd();
    } catch (storageError) {
      console.error('Failed to store error report:', storageError);
    }
  }

  // Get all stored error reports
  public getStoredReports(): ErrorReport[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clear all stored reports
  public clearReports(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Get error statistics
  public getErrorStats(): {
    total: number;
    critical: number;
    errors: number;
    warnings: number;
    recovered: number;
    lastError?: ErrorReport;
  } {
    const reports = this.getStoredReports();
    
    return {
      total: reports.length,
      critical: reports.filter(r => r.level === 'critical').length,
      errors: reports.filter(r => r.level === 'error').length,
      warnings: reports.filter(r => r.level === 'warning').length,
      recovered: reports.filter(r => r.recovered).length,
      lastError: reports[reports.length - 1]
    };
  }

  // Mark error as recovered
  public markAsRecovered(errorId: string): void {
    const reports = this.getStoredReports();
    const errorIndex = reports.findIndex(r => r.id === errorId);
    
    if (errorIndex !== -1) {
      reports[errorIndex].recovered = true;
      localStorage.setItem(this.storageKey, JSON.stringify(reports));
    }
  }

  // Generate error report
  public createErrorReport(
    error: Error,
    level: ErrorReport['level'] = 'error',
    context?: Record<string, any>,
    componentStack?: string
  ): ErrorReport {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      level,
      context,
      recovered: false
    };
  }

  // Setup global error handlers with enhanced diagnostics
  public setupGlobalHandlers(): void {
    // Unhandled JavaScript errors with enhanced context
    window.addEventListener('error', (event) => {
      const error = new Error(event.message);
      error.stack = `at ${event.filename}:${event.lineno}:${event.colno}`;
      
      const report = this.createErrorReport(
        error,
        'critical',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'unhandled_error',
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      );
      this.reportError(report);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
        
      const report = this.createErrorReport(
        error,
        'critical',
        {
          type: 'unhandled_promise_rejection'
        }
      );
      this.reportError(report);
    });

    // Console error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Only report if it looks like an actual error
      const firstArg = args[0];
      if (firstArg instanceof Error) {
        const report = this.createErrorReport(
          firstArg,
          'error',
          {
            type: 'console_error',
            args: args.slice(1)
          }
        );
        this.reportError(report);
      }
    };
  }
}

export const errorReporter = ErrorReportingService.getInstance();