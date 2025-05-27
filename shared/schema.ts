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

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["master_admin", "admin", "trainer", "student"] }).notNull().default("student"),
  tenantId: integer("tenant_id").references(() => tenants.id), // null for master admins
  language: varchar("language", { enum: ["en", "fa", "ar", "es", "zh"] }).notNull().default("en"),
  // Master Admin & Security
  isMasterAdmin: boolean("is_master_admin").default(false),
  adminPermissions: jsonb("admin_permissions"), // Granular permissions
  lastLoginAt: timestamp("last_login_at"),
  ipWhitelist: jsonb("ip_whitelist"), // Array of allowed IPs
  sessionTimeout: integer("session_timeout").default(3600), // seconds
  // Stripe subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { enum: ["active", "inactive", "trialing", "past_due", "canceled"] }),
  subscriptionPlan: varchar("subscription_plan"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  // Profile fields
  bio: text("bio"),
  phoneNumber: varchar("phone_number"),
  timezone: varchar("timezone").default("UTC"),
  // Settings
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").notNull(),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  // NASBA/CPE Compliance fields
  nasbaId: varchar("nasba_id"), // NASBA course approval ID
  cpeCredits: decimal("cpe_credits", { precision: 5, scale: 2 }).default("0"), // Total CPE credits for course
  isNasbaApproved: boolean("is_nasba_approved").default(false),
  requiresAssessment: boolean("requires_assessment").default(true), // Mandatory for CPE compliance
  minimumPassingScore: integer("minimum_passing_score").default(70), // Required % to pass
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content pages table
export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  translations: jsonb("translations"), // Store content in multiple languages: {"fa": "...", "ar": "...", "es": "...", "zh": "..."}
  type: varchar("type", { enum: ["lesson", "assessment", "resource", "scorm"] }).notNull(),
  classId: integer("class_id").notNull(),
  authorId: varchar("author_id").notNull(),
  isPublished: boolean("is_published").default(false),
  orderIndex: integer("order_index").default(0),
  metadata: jsonb("metadata"), // For storing file paths, SCORM data, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Class enrollments table
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  studentId: varchar("student_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // Percentage 0-100
});

// User interactions table for tracking
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  contentPageId: integer("content_page_id").notNull(),
  classId: integer("class_id").notNull(),
  interactionType: varchar("interaction_type", { 
    enum: ["view", "complete", "download", "quiz_attempt", "quiz_complete"] 
  }).notNull(),
  timeSpent: integer("time_spent"), // in seconds
  score: integer("score"), // for assessments
  cpeCredits: decimal("cpe_credits", { precision: 5, scale: 2 }).default("0"), // CPE credits earned
  metadata: jsonb("metadata"), // Additional interaction data
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Chat conversations and history
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  classId: integer("class_id").references(() => classes.id),
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

// NASBA/CPE Compliance Tables

// CPE audit logs for 5+ year retention requirement
export const cpeAuditLogs = pgTable("cpe_audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  action: varchar("action", { enum: ["enrollment", "completion", "certificate_issued", "verification"] }).notNull(),
  cpeCreditsEarned: decimal("cpe_credits_earned", { precision: 5, scale: 2 }).notNull(),
  completionDate: timestamp("completion_date").notNull(),
  assessmentScore: integer("assessment_score"), // Required for NASBA compliance
  timeSpentMinutes: integer("time_spent_minutes").notNull(), // Track actual learning time
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  verificationStatus: varchar("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// CPE certificates for official documentation
export const cpeCertificates = pgTable("cpe_certificates", {
  id: serial("id").primaryKey(),
  certificateNumber: varchar("certificate_number").unique().notNull(), // Unique certificate ID
  userId: varchar("user_id").notNull().references(() => users.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  cpeCreditsAwarded: decimal("cpe_credits_awarded", { precision: 5, scale: 2 }).notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  expirationDate: timestamp("expiration_date"), // Some CPE credits expire
  certificateUrl: varchar("certificate_url"), // PDF storage location
  verificationHash: varchar("verification_hash"), // For certificate authenticity
  status: varchar("status", { enum: ["active", "revoked", "expired"] }).default("active"),
  metadata: jsonb("metadata"), // Additional certificate data
  createdAt: timestamp("created_at").defaultNow(),
});

// NASBA compliance settings and thresholds
export const complianceSettings = pgTable("compliance_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  instructedClasses: many(classes, { relationName: "instructor" }),
  enrollments: many(classEnrollments),
  interactions: many(userInteractions),
  authoredContent: many(contentPages, { relationName: "author" }),
  chatConversations: many(chatConversations),
  analytics: many(userAnalytics),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  instructor: one(users, {
    fields: [classes.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
  contentPages: many(contentPages),
  enrollments: many(classEnrollments),
  interactions: many(userInteractions),
}));

export const contentPagesRelations = relations(contentPages, ({ one, many }) => ({
  class: one(classes, {
    fields: [contentPages.classId],
    references: [classes.id],
  }),
  author: one(users, {
    fields: [contentPages.authorId],
    references: [users.id],
    relationName: "author",
  }),
  interactions: many(userInteractions),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classEnrollments.studentId],
    references: [users.id],
  }),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
  contentPage: one(contentPages, {
    fields: [userInteractions.contentPageId],
    references: [contentPages.id],
  }),
  class: one(classes, {
    fields: [userInteractions.classId],
    references: [classes.id],
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
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;
export type ContentPage = typeof contentPages.$inferSelect;
export type InsertClassEnrollment = z.infer<typeof insertClassEnrollmentSchema>;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;

export type InsertChatConversation = typeof chatConversations.$inferInsert;
export type ChatConversation = typeof chatConversations.$inferSelect;

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
