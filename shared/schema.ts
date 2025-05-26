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
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "trainer", "student"] }).notNull().default("student"),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content pages table
export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
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
  metadata: jsonb("metadata"), // Additional interaction data
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  instructedClasses: many(classes, { relationName: "instructor" }),
  enrollments: many(classEnrollments),
  interactions: many(userInteractions),
  authoredContent: many(contentPages, { relationName: "author" }),
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
