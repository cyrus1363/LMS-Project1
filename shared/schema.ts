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
  uuid,
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

// Subscription plans and products
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  stripePriceId: varchar("stripe_price_id").unique().notNull(),
  stripeProductId: varchar("stripe_product_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency").default("usd").notNull(),
  interval: varchar("interval", { enum: ["month", "year"] }).notNull(),
  features: jsonb("features").notNull(), // Array of feature strings
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User analytics and tracking
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id"),
  event: varchar("event").notNull(),
  properties: jsonb("properties"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Multi-Tenant & Master Admin Tables

// Tenants (Organizations/Clients)
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(), // subdomain identifier
  customDomain: varchar("custom_domain"),
  status: varchar("status", { enum: ["active", "suspended", "trial", "expired"] }).default("trial"),
  planType: varchar("plan_type", { enum: ["basic", "pro", "enterprise"] }).default("basic"),
  maxUsers: integer("max_users").default(50),
  maxStorage: integer("max_storage").default(1000), // MB
  features: jsonb("features"), // Feature flags per tenant
  billingEmail: varchar("billing_email"),
  contactInfo: jsonb("contact_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenant Branding & Customization
export const tenantBranding = pgTable("tenant_branding", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  logoUrl: varchar("logo_url"),
  faviconUrl: varchar("favicon_url"),
  primaryColor: varchar("primary_color").default("#3b82f6"),
  secondaryColor: varchar("secondary_color").default("#64748b"),
  errorColor: varchar("error_color").default("#ef4444"),
  successColor: varchar("success_color").default("#10b981"),
  fontFamily: varchar("font_family").default("Inter"),
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  emailTemplates: jsonb("email_templates"),
  loginScreenConfig: jsonb("login_screen_config"),
  uiComponents: jsonb("ui_components"), // Custom component library
  layoutConfig: jsonb("layout_config"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System-wide Admin Configuration
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  configKey: varchar("config_key").unique().notNull(),
  configValue: text("config_value"),
  configType: varchar("config_type", { enum: ["string", "number", "boolean", "json", "secret"] }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false), // Public configs visible to tenants
  category: varchar("category").default("general"),
  updatedBy: varchar("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Master Admin Activity Logs
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminUserId: varchar("admin_user_id").notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type"), // tenant, user, system, etc.
  entityId: varchar("entity_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  severity: varchar("severity", { enum: ["low", "medium", "high", "critical"] }).default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature Flags & Rollout Control
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  flagKey: varchar("flag_key").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false),
  rolloutPercentage: integer("rollout_percentage").default(0), // 0-100
  targetTenants: jsonb("target_tenants"), // Array of tenant IDs
  conditions: jsonb("conditions"), // Complex targeting rules
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  analytics: many(userAnalytics),
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

// Chat conversation relations
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentPageSchema = createInsertSchema(contentPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
  id: true,
  createdAt: true,
});

// Types
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

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertUserAnalytics = typeof userAnalytics.$inferInsert;
export type UserAnalytics = typeof userAnalytics.$inferSelect;

// NASBA/CPE Compliance Types
export const insertCpeAuditLogSchema = createInsertSchema(cpeAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCpeCertificateSchema = createInsertSchema(cpeCertificates).omit({
  id: true,
  issueDate: true,
  createdAt: true,
});

export const insertComplianceSettingSchema = createInsertSchema(complianceSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCpeAuditLog = z.infer<typeof insertCpeAuditLogSchema>;
export type CpeAuditLog = typeof cpeAuditLogs.$inferSelect;
export type InsertCpeCertificate = z.infer<typeof insertCpeCertificateSchema>;
export type CpeCertificate = typeof cpeCertificates.$inferSelect;
export type InsertComplianceSetting = z.infer<typeof insertComplianceSettingSchema>;
export type ComplianceSetting = typeof complianceSettings.$inferSelect;

// Multi-Tenant & Master Admin Types
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantBrandingSchema = createInsertSchema(tenantBranding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenantBranding = z.infer<typeof insertTenantBrandingSchema>;
export type TenantBranding = typeof tenantBranding.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

// Tutorial System Tables
export const tutorialCategories = pgTable("tutorial_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"), // Lucide icon name
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(), // Markdown content
  categoryId: integer("category_id").references(() => tutorialCategories.id),
  targetRoles: varchar("target_roles").array().default(['student', 'trainer', 'admin']), // JSON array of roles
  uiLocation: varchar("ui_location"), // e.g., "Courses > +New > Upload SCORM"
  featureId: varchar("feature_id"), // Maps to specific feature for versioning
  version: varchar("version").default("1.0.0"),
  isNewFeature: boolean("is_new_feature").default(false),
  mediaUrls: varchar("media_urls").array().default([]), // Screenshots/GIFs URLs
  hotspots: text("hotspots"), // JSON for interactive elements
  steps: text("steps"), // JSON for step-by-step workflows
  searchKeywords: text("search_keywords"), // For search functionality
  difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
  estimatedTime: integer("estimated_time_minutes").default(5),
  isActive: boolean("is_active").default(true),
  isOutdated: boolean("is_outdated").default(false),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tutorialProgress = pgTable("tutorial_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tutorialId: integer("tutorial_id").notNull().references(() => tutorials.id),
  completed: boolean("completed").default(false),
  currentStep: integer("current_step").default(0),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tutorialFeedback = pgTable("tutorial_feedback", {
  id: serial("id").primaryKey(),
  tutorialId: integer("tutorial_id").notNull().references(() => tutorials.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  isHelpful: boolean("is_helpful"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tutorialVersions = pgTable("tutorial_versions", {
  id: serial("id").primaryKey(),
  tutorialId: integer("tutorial_id").notNull().references(() => tutorials.id),
  version: varchar("version").notNull(),
  content: text("content").notNull(),
  changes: text("changes"), // What changed in this version
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// New Feature Tables for 4-Tier LMS

// Cross-Org Analytics (Tier 1: LMS Owner)
export const crossOrgAnalytics = pgTable("cross_org_analytics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type").notNull(), // enrollment, completion, engagement, etc.
  organizationId: integer("organization_id").references(() => organizations.id),
  metricValue: decimal("metric_value").notNull(),
  metricData: jsonb("metric_data"), // Additional context
  calculatedAt: timestamp("calculated_at").defaultNow(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
});

// LDAP/Active Directory Integration (Tier 2: Subscriber Org)
export const ldapSyncLogs = pgTable("ldap_sync_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  syncType: varchar("sync_type", { enum: ["users", "groups", "full"] }).notNull(),
  status: varchar("status", { enum: ["pending", "success", "error"] }).notNull(),
  usersAdded: integer("users_added").default(0),
  usersUpdated: integer("users_updated").default(0),
  usersDeactivated: integer("users_deactivated").default(0),
  errorMessage: text("error_message"),
  syncedAt: timestamp("synced_at").defaultNow(),
});

// Plagiarism Detection (Tier 3: Facilitator)
export const plagiarismScans = pgTable("plagiarism_scans", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id"), // References assignment submission
  studentId: varchar("student_id").references(() => users.id),
  facilitatorId: varchar("facilitator_id").references(() => users.id),
  scanProvider: varchar("scan_provider").default("turnitin"), // turnitin, copyscape, etc.
  similarityScore: decimal("similarity_score"), // Percentage
  reportUrl: varchar("report_url"),
  flaggedSources: jsonb("flagged_sources"), // Array of matched sources
  status: varchar("status", { enum: ["scanning", "completed", "failed"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Peer Review System (Tier 4: Student)
export const peerReviews = pgTable("peer_reviews", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id"), // References assignment
  reviewerId: varchar("reviewer_id").references(() => users.id),
  revieweeId: varchar("reviewee_id").references(() => users.id),
  rubricScores: jsonb("rubric_scores"), // Structured scoring
  feedback: text("feedback"),
  isAnonymous: boolean("is_anonymous").default(true),
  status: varchar("status", { enum: ["pending", "submitted", "reviewed"] }).default("pending"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zoom/LTI Integration
export const ltiIntegrations = pgTable("lti_integrations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  provider: varchar("provider").notNull(), // zoom, teams, webex, etc.
  consumerKey: varchar("consumer_key").notNull(),
  sharedSecret: varchar("shared_secret").notNull(),
  launchUrl: varchar("launch_url").notNull(),
  customParameters: jsonb("custom_parameters"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ltiSessions = pgTable("lti_sessions", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => ltiIntegrations.id),
  classId: integer("class_id").references(() => classes.id),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  launchData: jsonb("launch_data"),
  status: varchar("status", { enum: ["active", "ended", "error"] }).default("active"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Sandbox Environment Management
export const sandboxEnvironments = pgTable("sandbox_environments", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  status: varchar("status", { enum: ["creating", "active", "suspended", "deleting"] }).default("creating"),
  dataSnapshot: jsonb("data_snapshot"), // Reference to data state
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// GDPR Data Export System
export const gdprExportRequests = pgTable("gdpr_export_requests", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  userId: varchar("user_id").references(() => users.id),
  requestedBy: varchar("requested_by").references(() => users.id),
  dataTypes: jsonb("data_types"), // Array of data categories to export
  status: varchar("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending"),
  exportUrl: varchar("export_url"), // S3/storage URL
  expiresAt: timestamp("expires_at"), // URL expiration
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Audit Trails (Enhanced for HIPAA Compliance)
export const systemAuditLogs = pgTable("system_audit_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(), // table/feature affected
  resourceId: varchar("resource_id"), // ID of affected record
  details: jsonb("details"), // Change details (PHI-sanitized)
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  severity: varchar("severity", { enum: ["low", "medium", "high", "critical"] }).default("low"),
  // HIPAA-specific fields
  phiAccessed: boolean("phi_accessed").default(false),
  hipaaEvent: varchar("hipaa_event", { 
    enum: ["access", "view", "modify", "delete", "export", "print", "share", "breach"] 
  }),
  accessJustification: text("access_justification"), // Business need for PHI access
  sessionId: varchar("session_id"), // For tracking user sessions
  retentionUntil: timestamp("retention_until"), // 6+ years for HIPAA
  isEncrypted: boolean("is_encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// HIPAA-Specific Tables

// PHI Detection and Classification
export const phiDetectionLogs = pgTable("phi_detection_logs", {
  id: serial("id").primaryKey(),
  fileId: varchar("file_id"), // Reference to uploaded file
  contentHash: varchar("content_hash"), // SHA-256 of content for deduplication
  detectedPhiTypes: varchar("detected_phi_types").array(), // SSN, medical_id, etc.
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // 0.00-1.00
  scanEngine: varchar("scan_engine").default("regex"), // regex, ml, hybrid
  quarantined: boolean("quarantined").default(false),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewStatus: varchar("review_status", { 
    enum: ["pending", "approved", "rejected", "escalated"] 
  }).default("pending"),
  mitigationActions: jsonb("mitigation_actions"), // Actions taken
  organizationId: integer("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// HIPAA Risk Assessments
export const hipaaRiskAssessments = pgTable("hipaa_risk_assessments", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  assessmentType: varchar("assessment_type", { 
    enum: ["annual", "incident", "system_change", "vendor_onboarding"] 
  }).notNull(),
  riskLevel: varchar("risk_level", { enum: ["low", "medium", "high", "critical"] }),
  findings: jsonb("findings"), // Detailed assessment results
  recommendations: jsonb("recommendations"), // Remediation steps
  completedBy: varchar("completed_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  nextAssessmentDue: timestamp("next_assessment_due"),
  status: varchar("status", { 
    enum: ["draft", "review", "approved", "implemented"] 
  }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

// Business Associate Agreements (BAA) Management
export const businessAssociateAgreements = pgTable("business_associate_agreements", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  vendorName: varchar("vendor_name").notNull(),
  vendorContact: jsonb("vendor_contact"), // Contact information
  services: text("services"), // Services provided
  phiTypes: varchar("phi_types").array(), // Types of PHI they handle
  agreementSigned: boolean("agreement_signed").default(false),
  signedDate: timestamp("signed_date"),
  expirationDate: timestamp("expiration_date"),
  renewalNotificationSent: boolean("renewal_notification_sent").default(false),
  status: varchar("status", { 
    enum: ["draft", "sent", "signed", "expired", "terminated"] 
  }).default("draft"),
  documentUrl: varchar("document_url"), // Encrypted storage location
  lastReviewDate: timestamp("last_review_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// HIPAA Incident Management
export const hipaaIncidents = pgTable("hipaa_incidents", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  incidentType: varchar("incident_type", { 
    enum: ["breach", "unauthorized_access", "improper_disposal", "lost_device", 
           "hacking", "malware", "phishing", "insider_threat"] 
  }).notNull(),
  severity: varchar("severity", { enum: ["low", "medium", "high", "critical"] }),
  description: text("description"),
  affectedRecords: integer("affected_records"), // Number of PHI records affected
  discoveryDate: timestamp("discovery_date").notNull(),
  reportedToHhs: boolean("reported_to_hhs").default(false),
  reportedToMedia: boolean("reported_to_media").default(false),
  notificationsSent: boolean("notifications_sent").default(false),
  investigationStatus: varchar("investigation_status", { 
    enum: ["open", "investigating", "resolved", "closed"] 
  }).default("open"),
  rootCause: text("root_cause"),
  correctiveActions: jsonb("corrective_actions"),
  reportedBy: varchar("reported_by").references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// HIPAA Training Records
export const hipaaTraining = pgTable("hipaa_training", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  trainingModule: varchar("training_module").notNull(), // e.g., "annual_hipaa", "phi_handling"
  completionDate: timestamp("completion_date"),
  score: integer("score"), // Percentage score if quiz involved
  certificateUrl: varchar("certificate_url"), // Link to completion certificate
  expirationDate: timestamp("expiration_date"), // When retraining is required
  status: varchar("status", { 
    enum: ["not_started", "in_progress", "completed", "expired"] 
  }).default("not_started"),
  attestationSigned: boolean("attestation_signed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Secure File Deletion Logs
export const secureFileDeletions = pgTable("secure_file_deletions", {
  id: serial("id").primaryKey(),
  originalPath: varchar("original_path").notNull(),
  fileHash: varchar("file_hash"), // SHA-256 of original file
  fileSize: integer("file_size"), // Size in bytes
  deletionMethod: varchar("deletion_method", { 
    enum: ["overwrite_3pass", "overwrite_7pass", "dod_5220", "crypto_erase"] 
  }).default("overwrite_7pass"),
  verificationPassed: boolean("verification_passed").default(false),
  deletedBy: varchar("deleted_by").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  reason: varchar("reason"), // Business justification for deletion
  retentionSchedule: varchar("retention_schedule"), // Legal requirement met
  createdAt: timestamp("created_at").defaultNow(),
});

// Auto-Generated API Documentation
export const apiDocumentations = pgTable("api_documentations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  endpoint: varchar("endpoint").notNull(),
  method: varchar("method").notNull(),
  description: text("description"),
  parameters: jsonb("parameters"),
  responseSchema: jsonb("response_schema"),
  exampleRequest: text("example_request"),
  exampleResponse: text("example_response"),
  isPublic: boolean("is_public").default(false),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Tutorial Relations
export const tutorialCategoriesRelations = relations(tutorialCategories, ({ many }) => ({
  tutorials: many(tutorials),
}));

export const tutorialsRelations = relations(tutorials, ({ one, many }) => ({
  category: one(tutorialCategories, {
    fields: [tutorials.categoryId],
    references: [tutorialCategories.id],
  }),
  author: one(users, {
    fields: [tutorials.authorId],
    references: [users.id],
  }),
  progress: many(tutorialProgress),
  feedback: many(tutorialFeedback),
  versions: many(tutorialVersions),
}));

export const tutorialProgressRelations = relations(tutorialProgress, ({ one }) => ({
  user: one(users, {
    fields: [tutorialProgress.userId],
    references: [users.id],
  }),
  tutorial: one(tutorials, {
    fields: [tutorialProgress.tutorialId],
    references: [tutorials.id],
  }),
}));

export const tutorialFeedbackRelations = relations(tutorialFeedback, ({ one }) => ({
  tutorial: one(tutorials, {
    fields: [tutorialFeedback.tutorialId],
    references: [tutorials.id],
  }),
  user: one(users, {
    fields: [tutorialFeedback.userId],
    references: [users.id],
  }),
}));

// Tutorial Schema Validation
export const insertTutorialCategorySchema = createInsertSchema(tutorialCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutorialSchema = createInsertSchema(tutorials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutorialProgressSchema = createInsertSchema(tutorialProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutorialFeedbackSchema = createInsertSchema(tutorialFeedback).omit({
  id: true,
  createdAt: true,
});

// Tutorial Types
export type InsertTutorialCategory = z.infer<typeof insertTutorialCategorySchema>;
export type TutorialCategory = typeof tutorialCategories.$inferSelect;
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;
export type Tutorial = typeof tutorials.$inferSelect;
export type InsertTutorialProgress = z.infer<typeof insertTutorialProgressSchema>;
export type TutorialProgress = typeof tutorialProgress.$inferSelect;
export type InsertTutorialFeedback = z.infer<typeof insertTutorialFeedbackSchema>;
export type TutorialFeedback = typeof tutorialFeedback.$inferSelect;
export type TutorialVersion = typeof tutorialVersions.$inferSelect;

// New Feature Types for 4-Tier LMS
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type CrossOrgAnalytics = typeof crossOrgAnalytics.$inferSelect;
export type LdapSyncLog = typeof ldapSyncLogs.$inferSelect;
export type PlagiarismScan = typeof plagiarismScans.$inferSelect;
export type PeerReview = typeof peerReviews.$inferSelect;
export type LtiIntegration = typeof ltiIntegrations.$inferSelect;
export type LtiSession = typeof ltiSessions.$inferSelect;
export type SandboxEnvironment = typeof sandboxEnvironments.$inferSelect;
export type GdprExportRequest = typeof gdprExportRequests.$inferSelect;
export type SystemAuditLog = typeof systemAuditLogs.$inferSelect;
export type ApiDocumentation = typeof apiDocumentations.$inferSelect;

// HIPAA Compliance Types
export type PhiDetectionLog = typeof phiDetectionLogs.$inferSelect;
export type InsertPhiDetectionLog = typeof phiDetectionLogs.$inferInsert;
export type HipaaRiskAssessment = typeof hipaaRiskAssessments.$inferSelect;
export type InsertHipaaRiskAssessment = typeof hipaaRiskAssessments.$inferInsert;
export type BusinessAssociateAgreement = typeof businessAssociateAgreements.$inferSelect;
export type InsertBusinessAssociateAgreement = typeof businessAssociateAgreements.$inferInsert;
export type HipaaIncident = typeof hipaaIncidents.$inferSelect;
export type InsertHipaaIncident = typeof hipaaIncidents.$inferInsert;
export type HipaaTraining = typeof hipaaTraining.$inferSelect;
export type InsertHipaaTraining = typeof hipaaTraining.$inferInsert;
export type SecureFileDeletion = typeof secureFileDeletions.$inferSelect;
export type InsertSecureFileDeletion = typeof secureFileDeletions.$inferInsert;

// Enhanced User Type with Tier Support
export type UserWithTier = User & {
  tier: "lms_owner" | "subscriber_org" | "facilitator" | "student";
  organization?: Organization;
};

// Tier-Specific Feature Capabilities
export type TierFeatures = {
  lms_owner: {
    crossOrgAnalytics: boolean;
    customSSO: boolean;
    webhookGovernance: boolean;
    systemAuditTrails: boolean;
    globalBranding: boolean;
    subscriberManagement: boolean;
  };
  subscriber_org: {
    userManagement: boolean;
    whiteLabelBranding: boolean;
    aiIntegration: boolean;
    scormSupport: boolean;
    ldapSync: boolean;
    automatedCohorts: boolean;
    sandboxEnvironment: boolean;
    compliancePolicies: boolean;
    dataRetention: boolean;
    accessibilityChecker: boolean;
  };
  facilitator: {
    classActivities: boolean;
    gradeSubmissions: boolean;
    moderateDiscussions: boolean;
    plagiarismDetection: boolean;
    rubricGrading: boolean;
    breakoutRooms: boolean;
    attendanceTracking: boolean;
    engagementHeatmaps: boolean;
  };
  student: {
    accessCourses: boolean;
    earnCertifications: boolean;
    joinDiscussions: boolean;
    peerReviews: boolean;
    offlineContent: boolean;
    linkedinBadges: boolean;
    personalizedPaths: boolean;
  };
};
