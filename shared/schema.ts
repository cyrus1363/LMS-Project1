import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Multi-tenant Organizations (Subscriber Companies/Institutions)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 63 }).unique().notNull(), // e.g., 'acme' for acme.yourlms.com
  customDomain: varchar("custom_domain"), // e.g., 'learn.acme.com'
  
  // Contact & Billing
  contactEmail: varchar("contact_email").notNull(),
  billingEmail: varchar("billing_email"),
  phone: varchar("phone"),
  address: text("address"),
  
  // Subscription & Plan
  subscriptionPlan: varchar("subscription_plan", { 
    enum: ["starter", "professional", "enterprise"] 
  }).default("starter"),
  subscriptionStatus: varchar("subscription_status", { 
    enum: ["active", "inactive", "trialing", "past_due", "canceled", "suspended"] 
  }).default("trialing"),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  
  // Limits & Quotas
  maxUsers: integer("max_users").default(25),
  maxStorage: integer("max_storage").default(5120), // MB
  maxCourses: integer("max_courses").default(10),
  
  // Branding & Customization
  logoUrl: varchar("logo_url"),
  primaryColor: varchar("primary_color").default("#2563eb"),
  secondaryColor: varchar("secondary_color").default("#64748b"),
  customCss: text("custom_css"),
  
  // Features enabled for this org
  featuresEnabled: jsonb("features_enabled").default({
    "ai_content_generation": true,
    "advanced_analytics": false,
    "sso_integration": false,
    "white_labeling": false,
    "api_access": false
  }),
  
  // Settings
  timezone: varchar("timezone").default("UTC"),
  language: varchar("language").default("en"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revamped User System with Clear Hierarchy
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Clear User Types
  userType: varchar("user_type", { 
    enum: ["system_owner", "subscriber_admin", "teacher", "facilitator", "student"] 
  }).notNull().default("student"),
  
  // Organization Context (null for system_owner)
  organizationId: integer("organization_id").references(() => organizations.id),
  
  // System Owner Privileges (only for you)
  isSystemOwner: boolean("is_system_owner").default(false),
  
  // Profile & Preferences  
  bio: text("bio"),
  phoneNumber: varchar("phone_number"),
  timezone: varchar("timezone").default("UTC"),
  language: varchar("language", { enum: ["en", "es", "fr", "de", "zh"] }).default("en"),
  
  // Security & Access
  lastLoginAt: timestamp("last_login_at"),
  emailNotifications: boolean("email_notifications").default(true),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses (renamed from classes for better LMS terminology)
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  
  // Course Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  
  // Course Structure
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  category: varchar("category"), // e.g., "Technology", "Compliance", "Sales"
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).default("beginner"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  
  // Course Media & Assets
  thumbnailUrl: varchar("thumbnail_url"),
  trailerVideoUrl: varchar("trailer_video_url"),
  
  // Course Settings
  isPublished: boolean("is_published").default(false),
  isPublic: boolean("is_public").default(false), // Public within organization
  requiresEnrollment: boolean("requires_enrollment").default(true),
  allowSelfEnrollment: boolean("allow_self_enrollment").default(true),
  
  // Scheduling
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  enrollmentDeadline: timestamp("enrollment_deadline"),
  
  // Completion & Certification
  requiresCompletion: boolean("requires_completion").default(true),
  minimumPassingScore: integer("minimum_passing_score").default(70),
  generateCertificate: boolean("generate_certificate").default(false),
  
  // Analytics & Tracking
  totalEnrollments: integer("total_enrollments").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Modules (Learning Paths/Chapters)
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  
  // Module Settings
  isRequired: boolean("is_required").default(true),
  unlockDate: timestamp("unlock_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Content Items with Rich Media Support
export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => courseModules.id, { onDelete: "cascade" }),
  
  // Content Basics
  title: varchar("title", { length: 255 }).notNull(),
  contentType: varchar("content_type", { 
    enum: ["text", "video", "audio", "document", "quiz", "assignment", "discussion", "scorm", "link", "interactive"] 
  }).notNull(),
  
  // Rich Content Data
  textContent: text("text_content"), // Rich HTML content
  mediaUrl: varchar("media_url"), // Video, audio, document URL
  mediaMetadata: jsonb("media_metadata"), // Duration, size, etc.
  
  // Interactive Content (Quizzes, Assignments)
  quizData: jsonb("quiz_data"), // Quiz questions, answers, settings
  assignmentData: jsonb("assignment_data"), // Assignment instructions, rubric
  discussionData: jsonb("discussion_data"), // Discussion prompts, settings
  
  // External Content
  externalUrl: varchar("external_url"), // For links, SCORM packages
  embedCode: text("embed_code"), // For interactive content
  
  // Content Settings
  orderIndex: integer("order_index").default(0),
  isRequired: boolean("is_required").default(true),
  timeLimit: integer("time_limit"), // in minutes
  maxAttempts: integer("max_attempts"), // for quizzes/assignments
  
  // Publishing
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  authorId: varchar("author_id").notNull().references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Enrollments
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Enrollment Details
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  enrolledBy: varchar("enrolled_by").references(() => users.id), // Who enrolled them
  enrollmentType: varchar("enrollment_type", { enum: ["self", "admin", "bulk"] }).default("self"),
  
  // Progress Tracking
  progress: integer("progress").default(0), // Percentage 0-100
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  timeSpent: integer("time_spent").default(0), // total minutes
  
  // Performance
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  attempts: integer("attempts").default(0),
  
  // Status
  status: varchar("status", { 
    enum: ["enrolled", "in_progress", "completed", "failed", "dropped", "suspended"] 
  }).default("enrolled"),
  
  // Certification
  certificateIssued: boolean("certificate_issued").default(false),
  certificateUrl: varchar("certificate_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Progress Tracking
export const contentProgress = pgTable("content_progress", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => courseEnrollments.id, { onDelete: "cascade" }),
  contentItemId: integer("content_item_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
  
  // Progress Details
  status: varchar("status", { 
    enum: ["not_started", "in_progress", "completed", "skipped"] 
  }).default("not_started"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Performance (for quizzes/assessments)
  score: decimal("score", { precision: 5, scale: 2 }),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }),
  attempts: integer("attempts").default(0),
  timeSpent: integer("time_spent").default(0), // in seconds
  
  // Responses & Data
  responseData: jsonb("response_data"), // Quiz answers, assignment submissions
  feedback: text("feedback"), // Instructor feedback
  
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discussion Forums for Courses
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  contentItemId: integer("content_item_id").references(() => contentItems.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Discussion Settings
  isPublic: boolean("is_public").default(true), // Public to all enrolled students
  allowAnonymous: boolean("allow_anonymous").default(false),
  moderationRequired: boolean("moderation_required").default(false),
  
  // Engagement
  totalPosts: integer("total_posts").default(0),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discussion Posts
export const discussionPosts = pgTable("discussion_posts", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull().references(() => discussions.id, { onDelete: "cascade" }),
  parentPostId: integer("parent_post_id").references(() => discussionPosts.id), // For replies
  
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  isAnonymous: boolean("is_anonymous").default(false),
  
  // Moderation
  isApproved: boolean("is_approved").default(true),
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  
  // Engagement
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Chat conversations and history
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  courseId: integer("course_id").references(() => courses.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Store confidence, sources, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  courses: many(courses),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  instructedCourses: many(courses, { relationName: "instructor" }),
  enrollments: many(courseEnrollments),
  authoredContent: many(contentItems, { relationName: "author" }),
  chatConversations: many(chatConversations),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [courses.organizationId],
    references: [organizations.id],
  }),
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
  modules: many(courseModules),
  enrollments: many(courseEnrollments),
  discussions: many(discussions),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  contentItems: many(contentItems),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [contentItems.moduleId],
    references: [courseModules.id],
  }),
  author: one(users, {
    fields: [contentItems.authorId],
    references: [users.id],
    relationName: "author",
  }),
  progress: many(contentProgress),
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseEnrollments.courseId],
    references: [courses.id],
  }),
  student: one(users, {
    fields: [courseEnrollments.studentId],
    references: [users.id],
  }),
  progress: many(contentProgress),
}));

export const contentProgressRelations = relations(contentProgress, ({ one }) => ({
  enrollment: one(courseEnrollments, {
    fields: [contentProgress.enrollmentId],
    references: [courseEnrollments.id],
  }),
  contentItem: one(contentItems, {
    fields: [contentProgress.contentItemId],
    references: [contentItems.id],
  }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  course: one(courses, {
    fields: [discussions.courseId],
    references: [courses.id],
  }),
  contentItem: one(contentItems, {
    fields: [discussions.contentItemId],
    references: [contentItems.id],
  }),
  posts: many(discussionPosts),
}));

export const discussionPostsRelations = relations(discussionPosts, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [discussionPosts.discussionId],
    references: [discussions.id],
  }),
  author: one(users, {
    fields: [discussionPosts.authorId],
    references: [users.id],
  }),
  parentPost: one(discussionPosts, {
    fields: [discussionPosts.parentPostId],
    references: [discussionPosts.id],
  }),
  replies: many(discussionPosts),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [chatConversations.courseId],
    references: [courses.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// Security table relations
export const systemAuditLogsRelations = relations(systemAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemAuditLogs.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [systemAuditLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const phiDetectionLogsRelations = relations(phiDetectionLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [phiDetectionLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const secureFileDeletionsRelations = relations(secureFileDeletions, ({ one }) => ({
  user: one(users, {
    fields: [secureFileDeletions.deletedBy],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [secureFileDeletions.organizationId],
    references: [organizations.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).omit({
  id: true,
  enrolledAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentProgressSchema = createInsertSchema(contentProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionPostSchema = createInsertSchema(discussionPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Export all types
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModule = typeof courseModules.$inferSelect;

export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ContentItem = typeof contentItems.$inferSelect;

export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;

export type InsertContentProgress = z.infer<typeof insertContentProgressSchema>;
export type ContentProgress = typeof contentProgress.$inferSelect;

export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect;

export type InsertDiscussionPost = z.infer<typeof insertDiscussionPostSchema>;
export type DiscussionPost = typeof discussionPosts.$inferSelect;

export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;