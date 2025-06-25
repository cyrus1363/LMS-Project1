// Enhanced error diagnostics and logging system
export interface DiagnosticInfo {
  timestamp: string;
  url: string;
  userAgent: string;
  viewport: { width: number; height: number };
  performance: {
    loadTime: number;
    memoryUsage?: number;
    connectionType?: string;
  };
  userActions: string[];
  networkStatus: 'online' | 'offline';
  localStorage: Record<string, any>;
  sessionStorage: Record<string, any>;
  console: string[];
}

export interface ErrorContext {
  userId?: string;
  userType?: string;
  currentPage: string;
  actionSequence: string[];
  formData?: Record<string, any>;
  apiCalls: string[];
  componentStack?: string;
}

class ErrorDiagnosticsService {
  private static instance: ErrorDiagnosticsService;
  private userActions: string[] = [];
  private apiCalls: string[] = [];
  private consoleLogs: string[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorDiagnosticsService {
    if (!ErrorDiagnosticsService.instance) {
      ErrorDiagnosticsService.instance = new ErrorDiagnosticsService();
    }
    return ErrorDiagnosticsService.instance;
  }

  constructor() {
    this.setupTracking();
  }

  private setupTracking() {
    // Track user actions
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = `Click: ${target.tagName}${target.className ? '.' + target.className.split(' ').join('.') : ''}`;
      this.addUserAction(action);
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.addUserAction(`Navigation: ${window.location.pathname}`);
    });

    // Track console logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      this.addConsoleLog('LOG', args);
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      this.addConsoleLog('ERROR', args);
    };

    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      this.addConsoleLog('WARN', args);
    };
  }

  private addUserAction(action: string) {
    this.userActions.push(`${new Date().toISOString()}: ${action}`);
    if (this.userActions.length > this.maxLogSize) {
      this.userActions.shift();
    }
  }

  private addConsoleLog(level: string, args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.consoleLogs.push(`${new Date().toISOString()} [${level}]: ${message}`);
    if (this.consoleLogs.length > this.maxLogSize) {
      this.consoleLogs.shift();
    }
  }

  public trackApiCall(method: string, url: string, status?: number) {
    const call = `${new Date().toISOString()}: ${method} ${url}${status ? ` (${status})` : ''}`;
    this.apiCalls.push(call);
    if (this.apiCalls.length > this.maxLogSize) {
      this.apiCalls.shift();
    }
  }

  public collectDiagnostics(): DiagnosticInfo {
    const performance = window.performance;
    const memoryInfo = (performance as any).memory;

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performance: {
        loadTime: performance.timing ? 
          performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
        memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize : undefined,
        connectionType: (navigator as any).connection?.effectiveType
      },
      userActions: [...this.userActions],
      networkStatus: navigator.onLine ? 'online' : 'offline',
      localStorage: this.safeGetStorage('localStorage'),
      sessionStorage: this.safeGetStorage('sessionStorage'),
      console: [...this.consoleLogs]
    };
  }

  private safeGetStorage(storageType: 'localStorage' | 'sessionStorage'): Record<string, any> {
    try {
      const storage = window[storageType];
      const result: Record<string, any> = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          try {
            result[key] = JSON.parse(storage.getItem(key) || '');
          } catch {
            result[key] = storage.getItem(key);
          }
        }
      }
      return result;
    } catch {
      return {};
    }
  }

  public generateErrorContext(error: Error): ErrorContext {
    const user = this.getCurrentUser();
    
    return {
      userId: user?.id,
      userType: user?.userType,
      currentPage: window.location.pathname,
      actionSequence: this.userActions.slice(-10), // Last 10 actions
      apiCalls: this.apiCalls.slice(-5), // Last 5 API calls
      componentStack: error.stack
    };
  }

  private getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('current_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  public clearLogs() {
    this.userActions = [];
    this.apiCalls = [];
    this.consoleLogs = [];
  }
}

export const errorDiagnostics = ErrorDiagnosticsService.getInstance();