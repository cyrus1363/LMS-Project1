// Rich Content Type Definitions for Modern LMS

export interface RichTextContent {
  type: "rich_text";
  html: string;
  plainText?: string;
  wordCount?: number;
  readingTime?: number; // estimated minutes
}

export interface VideoContent {
  type: "video";
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  subtitles?: {
    language: string;
    url: string;
  }[];
  quality?: {
    resolution: string;
    bitrate: number;
  }[];
  chapters?: {
    title: string;
    startTime: number;
    endTime: number;
  }[];
}

export interface QuizContent {
  type: "quiz";
  questions: QuizQuestion[];
  settings: {
    timeLimit?: number; // minutes
    maxAttempts?: number;
    randomizeQuestions?: boolean;
    randomizeAnswers?: boolean;
    showCorrectAnswers?: boolean;
    passingScore?: number; // percentage
    allowReview?: boolean;
    shuffleQuestions?: boolean;
  };
  instructions?: string;
}

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "fill_blank" | "essay" | "matching" | "ordering";
  question: string;
  explanation?: string; // Shown after answering
  points: number;
  
  // Multiple choice / True-False
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  
  // Fill in the blank
  blanks?: {
    id: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
  }[];
  
  // Essay questions
  wordLimit?: number;
  rubric?: {
    criteria: string;
    points: number;
  }[];
  
  // Matching
  pairs?: {
    left: string;
    right: string;
  }[];
  
  // Ordering
  items?: {
    id: string;
    text: string;
    correctOrder: number;
  }[];
}

export interface AssignmentContent {
  type: "assignment";
  instructions: string;
  requirements: string[];
  submissionTypes: ("file" | "text" | "url" | "media")[];
  rubric?: {
    criteria: string;
    levels: {
      name: string;
      points: number;
      description: string;
    }[];
  }[];
  dueDate?: string;
  allowLateSubmissions?: boolean;
  latePenalty?: number; // percentage per day
  maxFileSize?: number; // MB
  allowedFileTypes?: string[];
}

export interface DiscussionContent {
  type: "discussion";
  prompt: string;
  guidelines?: string[];
  settings: {
    requireInitialPost?: boolean;
    allowReplies?: boolean;
    allowAnonymous?: boolean;
    moderationRequired?: boolean;
    minWordCount?: number;
    maxWordCount?: number;
  };
}

export interface ScormContent {
  type: "scorm";
  packageUrl: string;
  version: "1.2" | "2004";
  launchUrl: string;
  manifestData: any;
  completionThreshold?: number;
  masteryScore?: number;
}

export interface InteractiveContent {
  type: "interactive";
  embedType: "h5p" | "custom" | "iframe";
  embedUrl: string;
  embedCode?: string;
  width?: string;
  height?: string;
  allowFullscreen?: boolean;
  parameters?: Record<string, any>;
}

export interface DocumentContent {
  type: "document";
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  allowDownload?: boolean;
  viewerType?: "pdf" | "office" | "image" | "generic";
  pages?: number;
}

export interface LinkContent {
  type: "link";
  url: string;
  title: string;
  description?: string;
  openInNewTab?: boolean;
  thumbnailUrl?: string;
}

// Union type for all content types
export type ContentData = 
  | RichTextContent 
  | VideoContent 
  | QuizContent 
  | AssignmentContent 
  | DiscussionContent 
  | ScormContent 
  | InteractiveContent 
  | DocumentContent 
  | LinkContent;

// Content builder form schemas
export interface ContentBuilder {
  type: ContentData["type"];
  title: string;
  description?: string;
  isRequired: boolean;
  orderIndex: number;
  data: ContentData;
}