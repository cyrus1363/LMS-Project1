// Intelligent user-friendly error message generator
export interface ErrorPattern {
  pattern: RegExp;
  userMessage: string;
  technicalMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'permission' | 'data' | 'system';
  suggestions: string[];
  showTechnical?: boolean;
}

export interface GeneratedErrorMessage {
  userMessage: string;
  technicalMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  suggestions: string[];
  showDetails: boolean;
  icon: string;
  color: string;
}

class IntelligentErrorMessageGenerator {
  private patterns: ErrorPattern[] = [
    // Network Errors
    {
      pattern: /network error|fetch failed|connection refused|connection reset/i,
      userMessage: "We're having trouble connecting to our servers. This is usually temporary.",
      technicalMessage: "Network connection failed",
      severity: 'high',
      category: 'network',
      suggestions: [
        "Check your internet connection",
        "Try refreshing the page",
        "Wait a moment and try again"
      ]
    },
    {
      pattern: /timeout|request timeout/i,
      userMessage: "The request is taking longer than expected. The server might be busy.",
      technicalMessage: "Request timeout",
      severity: 'medium',
      category: 'network',
      suggestions: [
        "Try again in a few moments",
        "Check your internet connection",
        "Contact support if this persists"
      ]
    },

    // Authentication Errors
    {
      pattern: /unauthorized|401/i,
      userMessage: "Your session has expired or you don't have permission to access this resource.",
      technicalMessage: "Authentication required",
      severity: 'medium',
      category: 'authentication',
      suggestions: [
        "Please sign in again",
        "Check your permissions",
        "Contact your administrator"
      ]
    },
    {
      pattern: /forbidden|403/i,
      userMessage: "You don't have permission to perform this action.",
      technicalMessage: "Access forbidden",
      severity: 'medium',
      category: 'permission',
      suggestions: [
        "Contact your administrator for access",
        "Check if you're signed in with the right account",
        "Verify your role permissions"
      ]
    },

    // Validation Errors
    {
      pattern: /validation failed|invalid input|required field/i,
      userMessage: "Some information you entered isn't quite right. Please check the highlighted fields.",
      technicalMessage: "Form validation failed",
      severity: 'low',
      category: 'validation',
      suggestions: [
        "Check all required fields are filled",
        "Verify email addresses and phone numbers",
        "Make sure passwords meet requirements"
      ]
    },

    // Data Errors
    {
      pattern: /not found|404/i,
      userMessage: "We couldn't find what you're looking for. It might have been moved or deleted.",
      technicalMessage: "Resource not found",
      severity: 'medium',
      category: 'data',
      suggestions: [
        "Check the web address",
        "Use the navigation menu",
        "Go back to the previous page"
      ]
    },
    {
      pattern: /duplicate|already exists/i,
      userMessage: "This item already exists. Please choose a different name or check existing items.",
      technicalMessage: "Duplicate resource",
      severity: 'low',
      category: 'validation',
      suggestions: [
        "Use a different name",
        "Check for existing items",
        "Try adding numbers or characters"
      ]
    },

    // System Errors
    {
      pattern: /internal server error|500/i,
      userMessage: "Something went wrong on our end. Our team has been notified and is working on it.",
      technicalMessage: "Internal server error",
      severity: 'critical',
      category: 'system',
      suggestions: [
        "Try refreshing the page",
        "Wait a few minutes and try again",
        "Contact support if this continues"
      ],
      showTechnical: false
    },
    {
      pattern: /database|sql|connection pool/i,
      userMessage: "We're experiencing database issues. Please try again in a few moments.",
      technicalMessage: "Database connection error",
      severity: 'high',
      category: 'system',
      suggestions: [
        "Wait a moment and try again",
        "Refresh the page",
        "Contact support if this persists"
      ],
      showTechnical: false
    },

    // Course/LMS Specific Errors
    {
      pattern: /course not found|module not found/i,
      userMessage: "This course or module isn't available. It might have been removed or you don't have access.",
      technicalMessage: "Course/module not found",
      severity: 'medium',
      category: 'data',
      suggestions: [
        "Check with your instructor",
        "Verify your enrollment",
        "Browse available courses"
      ]
    },
    {
      pattern: /enrollment failed|already enrolled/i,
      userMessage: "There was an issue with your course enrollment. You might already be enrolled.",
      technicalMessage: "Enrollment error",
      severity: 'medium',
      category: 'validation',
      suggestions: [
        "Check your enrolled courses",
        "Contact your instructor",
        "Try enrolling again"
      ]
    }
  ];

  public generateMessage(error: Error | string, context?: any): GeneratedErrorMessage {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Find matching pattern
    const matchedPattern = this.patterns.find(pattern => 
      pattern.pattern.test(errorMessage) || 
      (errorStack && pattern.pattern.test(errorStack))
    );

    if (matchedPattern) {
      return {
        userMessage: matchedPattern.userMessage,
        technicalMessage: matchedPattern.technicalMessage,
        severity: matchedPattern.severity,
        category: matchedPattern.category,
        suggestions: matchedPattern.suggestions,
        showDetails: matchedPattern.showTechnical !== false,
        icon: this.getIconForCategory(matchedPattern.category),
        color: this.getColorForSeverity(matchedPattern.severity)
      };
    }

    // Default fallback message
    return {
      userMessage: "Something unexpected happened. We're working to fix this issue.",
      technicalMessage: errorMessage,
      severity: 'medium',
      category: 'system',
      suggestions: [
        "Try refreshing the page",
        "Wait a moment and try again",
        "Contact support if this continues"
      ],
      showDetails: true,
      icon: 'AlertTriangle',
      color: 'orange'
    };
  }

  private getIconForCategory(category: string): string {
    const iconMap: Record<string, string> = {
      network: 'Wifi',
      validation: 'AlertCircle',
      authentication: 'Lock',
      permission: 'Shield',
      data: 'Database',
      system: 'AlertTriangle'
    };
    return iconMap[category] || 'AlertTriangle';
  }

  private getColorForSeverity(severity: string): string {
    const colorMap: Record<string, string> = {
      low: 'yellow',
      medium: 'orange',
      high: 'red',
      critical: 'red'
    };
    return colorMap[severity] || 'orange';
  }

  public addPattern(pattern: ErrorPattern) {
    this.patterns.unshift(pattern); // Add to beginning for priority
  }

  public getCategories(): string[] {
    return [...new Set(this.patterns.map(p => p.category))];
  }

  public getSeverityLevels(): string[] {
    return ['low', 'medium', 'high', 'critical'];
  }
}

export const intelligentErrorMessages = new IntelligentErrorMessageGenerator();