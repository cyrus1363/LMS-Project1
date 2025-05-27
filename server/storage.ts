import {
  users,
  classes,
  contentPages,
  classEnrollments,
  userInteractions,
  type User,
  type UpsertUser,
  type InsertClass,
  type Class,
  type InsertContentPage,
  type ContentPage,
  type InsertClassEnrollment,
  type ClassEnrollment,
  type InsertUserInteraction,
  type UserInteraction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: "admin" | "trainer" | "student"): Promise<User[]>;
  updateUserRole(userId: string, role: "admin" | "trainer" | "student"): Promise<User>;

  // Class operations
  getClasses(): Promise<(Class & { instructor: User; enrollmentCount: number })[]>;
  getClassesByInstructor(instructorId: string): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;

  // Content operations
  getContentByClass(classId: number): Promise<(ContentPage & { author: User })[]>;
  getContent(id: number): Promise<ContentPage | undefined>;
  createContent(contentData: InsertContentPage): Promise<ContentPage>;
  updateContent(id: number, contentData: Partial<InsertContentPage>): Promise<ContentPage>;
  deleteContent(id: number): Promise<void>;

  // Enrollment operations
  enrollStudent(enrollment: InsertClassEnrollment): Promise<ClassEnrollment>;
  getStudentEnrollments(studentId: string): Promise<(ClassEnrollment & { class: Class })[]>;
  getClassEnrollments(classId: number): Promise<(ClassEnrollment & { student: User })[]>;
  updateEnrollmentProgress(enrollmentId: number, progress: number, completed?: boolean): Promise<ClassEnrollment>;

  // Interaction tracking
  createInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getUserInteractions(userId: string, classId?: number): Promise<UserInteraction[]>;
  getContentInteractions(contentId: number): Promise<UserInteraction[]>;

  // Analytics
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeClasses: number;
    totalContent: number;
    averageCompletion: number;
  }>;
  getClassAnalytics(classId: number): Promise<{
    enrolledStudents: number;
    completionRate: number;
    averageTimeSpent: number;
  }>;

  // Subscription management
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByStripeId(stripePriceId: string): Promise<SubscriptionPlan | undefined>;
  updateUserStripeCustomer(userId: string, stripeCustomerId: string): Promise<User>;
  updateUserSubscription(userId: string, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: "active" | "inactive" | "trialing" | "past_due" | "canceled";
    subscriptionPlan: string;
  }): Promise<User>;
  updateUserSubscriptionByStripeId(stripeSubscriptionId: string, subscriptionData: {
    subscriptionStatus: "active" | "inactive" | "trialing" | "past_due" | "canceled";
    subscriptionEndsAt?: Date | null;
  }): Promise<void>;

  // Chat management
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversations(userId: string): Promise<ChatConversation[]>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateConversationTitle(conversationId: number, title: string): Promise<ChatConversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsersByRole(role: "admin" | "trainer" | "student"): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async updateUserRole(userId: string, role: "admin" | "trainer" | "student"): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserLanguage(userId: string, language: "en" | "fa" | "ar" | "es" | "zh"): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ language, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Class operations
  async getClasses(): Promise<(Class & { instructor: User; enrollmentCount: number })[]> {
    const result = await db
      .select({
        id: classes.id,
        title: classes.title,
        description: classes.description,
        instructorId: classes.instructorId,
        isActive: classes.isActive,
        startDate: classes.startDate,
        endDate: classes.endDate,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        instructor: users,
        enrollmentCount: count(classEnrollments.id),
      })
      .from(classes)
      .leftJoin(users, eq(classes.instructorId, users.id))
      .leftJoin(classEnrollments, eq(classes.id, classEnrollments.classId))
      .groupBy(classes.id, users.id)
      .orderBy(desc(classes.createdAt));
    
    return result.map(row => ({
      ...row,
      instructor: row.instructor!,
      enrollmentCount: Number(row.enrollmentCount),
    }));
  }

  async getClassesByInstructor(instructorId: string): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.instructorId, instructorId));
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
    return classItem;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [classItem] = await db.insert(classes).values(classData).returning();
    return classItem;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class> {
    const [classItem] = await db
      .update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return classItem;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Content operations
  async getContentByClass(classId: number): Promise<(ContentPage & { author: User })[]> {
    const result = await db
      .select({
        id: contentPages.id,
        title: contentPages.title,
        content: contentPages.content,
        type: contentPages.type,
        classId: contentPages.classId,
        authorId: contentPages.authorId,
        isPublished: contentPages.isPublished,
        orderIndex: contentPages.orderIndex,
        metadata: contentPages.metadata,
        createdAt: contentPages.createdAt,
        updatedAt: contentPages.updatedAt,
        author: users,
      })
      .from(contentPages)
      .leftJoin(users, eq(contentPages.authorId, users.id))
      .where(eq(contentPages.classId, classId))
      .orderBy(contentPages.orderIndex);
    
    return result.map(row => ({
      ...row,
      author: row.author!,
    }));
  }

  async getContent(id: number): Promise<ContentPage | undefined> {
    const [content] = await db.select().from(contentPages).where(eq(contentPages.id, id));
    return content;
  }

  async createContent(contentData: InsertContentPage): Promise<ContentPage> {
    const [content] = await db.insert(contentPages).values(contentData).returning();
    return content;
  }

  async updateContent(id: number, contentData: Partial<InsertContentPage>): Promise<ContentPage> {
    const [content] = await db
      .update(contentPages)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(contentPages.id, id))
      .returning();
    return content;
  }

  async deleteContent(id: number): Promise<void> {
    await db.delete(contentPages).where(eq(contentPages.id, id));
  }

  // Enrollment operations
  async enrollStudent(enrollment: InsertClassEnrollment): Promise<ClassEnrollment> {
    const [result] = await db.insert(classEnrollments).values(enrollment).returning();
    return result;
  }

  async getStudentEnrollments(studentId: string): Promise<(ClassEnrollment & { class: Class })[]> {
    const result = await db
      .select({
        id: classEnrollments.id,
        classId: classEnrollments.classId,
        studentId: classEnrollments.studentId,
        enrolledAt: classEnrollments.enrolledAt,
        completedAt: classEnrollments.completedAt,
        progress: classEnrollments.progress,
        class: classes,
      })
      .from(classEnrollments)
      .leftJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(eq(classEnrollments.studentId, studentId));
    
    return result.map(row => ({
      ...row,
      class: row.class!,
    }));
  }

  async getClassEnrollments(classId: number): Promise<(ClassEnrollment & { student: User })[]> {
    const result = await db
      .select({
        id: classEnrollments.id,
        classId: classEnrollments.classId,
        studentId: classEnrollments.studentId,
        enrolledAt: classEnrollments.enrolledAt,
        completedAt: classEnrollments.completedAt,
        progress: classEnrollments.progress,
        student: users,
      })
      .from(classEnrollments)
      .leftJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId));
    
    return result.map(row => ({
      ...row,
      student: row.student!,
    }));
  }

  async updateEnrollmentProgress(enrollmentId: number, progress: number, completed?: boolean): Promise<ClassEnrollment> {
    const updateData: any = { progress };
    if (completed) {
      updateData.completedAt = new Date();
    }
    
    const [enrollment] = await db
      .update(classEnrollments)
      .set(updateData)
      .where(eq(classEnrollments.id, enrollmentId))
      .returning();
    return enrollment;
  }

  // Interaction tracking
  async createInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const [result] = await db.insert(userInteractions).values(interaction).returning();
    return result;
  }

  async getUserInteractions(userId: string, classId?: number): Promise<UserInteraction[]> {
    const conditions = [eq(userInteractions.userId, userId)];
    if (classId) {
      conditions.push(eq(userInteractions.classId, classId));
    }
    
    return await db
      .select()
      .from(userInteractions)
      .where(and(...conditions))
      .orderBy(desc(userInteractions.createdAt));
  }

  async getContentInteractions(contentId: number): Promise<UserInteraction[]> {
    return await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.contentPageId, contentId))
      .orderBy(desc(userInteractions.createdAt));
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalStudents: number;
    activeClasses: number;
    totalContent: number;
    averageCompletion: number;
  }> {
    const [studentCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "student"));
    
    const [activeClassCount] = await db
      .select({ count: count() })
      .from(classes)
      .where(eq(classes.isActive, true));
    
    const [contentCount] = await db
      .select({ count: count() })
      .from(contentPages)
      .where(eq(contentPages.isPublished, true));
    
    const [avgCompletion] = await db
      .select({ avg: sql<number>`AVG(${classEnrollments.progress})` })
      .from(classEnrollments);
    
    return {
      totalStudents: Number(studentCount.count),
      activeClasses: Number(activeClassCount.count),
      totalContent: Number(contentCount.count),
      averageCompletion: Math.round(Number(avgCompletion.avg) || 0),
    };
  }

  async getClassAnalytics(classId: number): Promise<{
    enrolledStudents: number;
    completionRate: number;
    averageTimeSpent: number;
  }> {
    const [enrollmentCount] = await db
      .select({ count: count() })
      .from(classEnrollments)
      .where(eq(classEnrollments.classId, classId));
    
    const [completedCount] = await db
      .select({ count: count() })
      .from(classEnrollments)
      .where(and(
        eq(classEnrollments.classId, classId),
        eq(classEnrollments.progress, 100)
      ));
    
    const [avgTimeSpent] = await db
      .select({ avg: sql<number>`AVG(${userInteractions.timeSpent})` })
      .from(userInteractions)
      .where(eq(userInteractions.classId, classId));
    
    const enrolledStudents = Number(enrollmentCount.count);
    const completionRate = enrolledStudents > 0 
      ? Math.round((Number(completedCount.count) / enrolledStudents) * 100)
      : 0;
    
    return {
      enrolledStudents,
      completionRate,
      averageTimeSpent: Math.round(Number(avgTimeSpent.avg) || 0),
    };
  }

  // Subscription management methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanByStripeId(stripePriceId: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.stripePriceId, stripePriceId));
    return plan;
  }

  async updateUserStripeCustomer(userId: string, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: "active" | "inactive" | "trialing" | "past_due" | "canceled";
    subscriptionPlan: string;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscriptionByStripeId(stripeSubscriptionId: string, subscriptionData: {
    subscriptionStatus: "active" | "inactive" | "trialing" | "past_due" | "canceled";
    subscriptionEndsAt?: Date | null;
  }): Promise<void> {
    await db
      .update(users)
      .set({ 
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(users.stripeSubscriptionId, stripeSubscriptionId));
  }

  // Chat management methods
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getChatConversations(userId: string): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.lastMessageAt));
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();

    // Update conversation last message timestamp
    await db
      .update(chatConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));

    return newMessage;
  }

  async updateConversationTitle(conversationId: number, title: string): Promise<ChatConversation> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ title })
      .where(eq(chatConversations.id, conversationId))
      .returning();
    return conversation;
  }
}

export const storage = new DatabaseStorage();
