import {
  users,
  classes,
  contentPages,
  classEnrollments,
  userInteractions,
  tutorialCategories,
  tutorials,
  tutorialProgress,
  tutorialFeedback,
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
  type TutorialCategory,
  type InsertTutorialCategory,
  type Tutorial,
  type InsertTutorial,
  type TutorialProgress,
  type InsertTutorialProgress,
  type TutorialFeedback,
  type InsertTutorialFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count, like, or, ilike } from "drizzle-orm";

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

  // NASBA/CPE Compliance
  createCpeAuditLog(auditLog: InsertCpeAuditLog): Promise<CpeAuditLog>;
  getCpeAuditLogs(userId: string): Promise<CpeAuditLog[]>;
  createCpeCertificate(certificate: InsertCpeCertificate): Promise<CpeCertificate>;
  getUserCertificates(userId: string): Promise<CpeCertificate[]>;
  getUserCpeCredits(userId: string): Promise<{ totalCredits: number; activeCredits: number }>;
  updateCertificateStatus(certificateId: number, status: "active" | "revoked" | "expired"): Promise<CpeCertificate>;
  getComplianceSettings(): Promise<ComplianceSetting[]>;
  updateComplianceSetting(key: string, value: string, updatedBy: string): Promise<ComplianceSetting>;

  // Tutorial System
  getTutorialCategories(): Promise<TutorialCategory[]>;
  createTutorialCategory(category: InsertTutorialCategory): Promise<TutorialCategory>;
  updateTutorialCategory(id: number, data: Partial<InsertTutorialCategory>): Promise<TutorialCategory>;
  deleteTutorialCategory(id: number): Promise<void>;

  getTutorials(filters?: { categoryId?: number; targetRole?: string; isActive?: boolean }): Promise<(Tutorial & { category: TutorialCategory; author: User })[]>;
  getTutorial(id: number): Promise<(Tutorial & { category: TutorialCategory; author: User }) | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  updateTutorial(id: number, data: Partial<InsertTutorial>): Promise<Tutorial>;
  deleteTutorial(id: number): Promise<void>;
  markTutorialAsOutdated(id: number): Promise<Tutorial>;

  getUserTutorialProgress(userId: string, tutorialId?: number): Promise<TutorialProgress[]>;
  updateTutorialProgress(userId: string, tutorialId: number, progress: Partial<InsertTutorialProgress>): Promise<TutorialProgress>;
  completeTutorial(userId: string, tutorialId: number): Promise<TutorialProgress>;

  addTutorialFeedback(feedback: InsertTutorialFeedback): Promise<TutorialFeedback>;
  getTutorialFeedback(tutorialId: number): Promise<(TutorialFeedback & { user: User })[]>;

  searchTutorials(query: string, userRole?: string): Promise<(Tutorial & { category: TutorialCategory })[]>;
  getRecommendedTutorials(userId: string): Promise<(Tutorial & { category: TutorialCategory })[]>;
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

  // NASBA/CPE Compliance Methods
  async createCpeAuditLog(auditLog: InsertCpeAuditLog): Promise<CpeAuditLog> {
    const [log] = await db
      .insert(cpeAuditLogs)
      .values(auditLog)
      .returning();
    return log;
  }

  async getCpeAuditLogs(userId: string): Promise<CpeAuditLog[]> {
    return await db
      .select()
      .from(cpeAuditLogs)
      .where(eq(cpeAuditLogs.userId, userId))
      .orderBy(desc(cpeAuditLogs.completionDate));
  }

  async createCpeCertificate(certificate: InsertCpeCertificate): Promise<CpeCertificate> {
    const [cert] = await db
      .insert(cpeCertificates)
      .values(certificate)
      .returning();
    return cert;
  }

  async getUserCertificates(userId: string): Promise<CpeCertificate[]> {
    return await db
      .select()
      .from(cpeCertificates)
      .where(eq(cpeCertificates.userId, userId))
      .orderBy(desc(cpeCertificates.issueDate));
  }

  async getUserCpeCredits(userId: string): Promise<{ totalCredits: number; activeCredits: number }> {
    const auditLogs = await db
      .select()
      .from(cpeAuditLogs)
      .where(eq(cpeAuditLogs.userId, userId));

    const totalCredits = auditLogs.reduce((sum, log) => 
      sum + parseFloat(log.cpeCreditsEarned || "0"), 0);

    const certificates = await this.getUserCertificates(userId);
    const activeCredits = certificates
      .filter(cert => cert.status === "active")
      .reduce((sum, cert) => sum + parseFloat(cert.cpeCreditsAwarded || "0"), 0);

    return { totalCredits, activeCredits };
  }

  async updateCertificateStatus(certificateId: number, status: "active" | "revoked" | "expired"): Promise<CpeCertificate> {
    const [certificate] = await db
      .update(cpeCertificates)
      .set({ status })
      .where(eq(cpeCertificates.id, certificateId))
      .returning();
    return certificate;
  }

  async getComplianceSettings(): Promise<ComplianceSetting[]> {
    return await db
      .select()
      .from(complianceSettings)
      .orderBy(complianceSettings.settingKey);
  }

  async updateComplianceSetting(key: string, value: string, updatedBy: string): Promise<ComplianceSetting> {
    const [setting] = await db
      .insert(complianceSettings)
      .values({ settingKey: key, settingValue: value, updatedBy })
      .onConflictDoUpdate({
        target: complianceSettings.settingKey,
        set: { settingValue: value, updatedBy, updatedAt: new Date() }
      })
      .returning();
    return setting;
  }

  // Tutorial System Implementation
  async getTutorialCategories(): Promise<TutorialCategory[]> {
    return await db
      .select()
      .from(tutorialCategories)
      .where(eq(tutorialCategories.isActive, true))
      .orderBy(tutorialCategories.orderIndex);
  }

  async createTutorialCategory(category: InsertTutorialCategory): Promise<TutorialCategory> {
    const [newCategory] = await db
      .insert(tutorialCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateTutorialCategory(id: number, data: Partial<InsertTutorialCategory>): Promise<TutorialCategory> {
    const [updated] = await db
      .update(tutorialCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tutorialCategories.id, id))
      .returning();
    return updated;
  }

  async deleteTutorialCategory(id: number): Promise<void> {
    await db.delete(tutorialCategories).where(eq(tutorialCategories.id, id));
  }

  async getTutorials(filters?: { categoryId?: number; targetRole?: string; isActive?: boolean }): Promise<(Tutorial & { category: TutorialCategory; author: User })[]> {
    let query = db
      .select()
      .from(tutorials)
      .leftJoin(tutorialCategories, eq(tutorials.categoryId, tutorialCategories.id))
      .leftJoin(users, eq(tutorials.authorId, users.id));

    const conditions = [];
    if (filters?.categoryId) {
      conditions.push(eq(tutorials.categoryId, filters.categoryId));
    }
    if (filters?.targetRole) {
      conditions.push(sql`${tutorials.targetRoles} @> ARRAY[${filters.targetRole}]`);
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(tutorials.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(tutorials.createdAt));
    
    return results.map(row => ({
      ...row.tutorials,
      category: row.tutorial_categories!,
      author: row.users!
    })) as (Tutorial & { category: TutorialCategory; author: User })[];
  }

  async getTutorial(id: number): Promise<(Tutorial & { category: TutorialCategory; author: User }) | undefined> {
    const result = await db
      .select()
      .from(tutorials)
      .leftJoin(tutorialCategories, eq(tutorials.categoryId, tutorialCategories.id))
      .leftJoin(users, eq(tutorials.authorId, users.id))
      .where(eq(tutorials.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.tutorials,
      category: row.tutorial_categories!,
      author: row.users!
    } as Tutorial & { category: TutorialCategory; author: User };
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const [newTutorial] = await db
      .insert(tutorials)
      .values(tutorial)
      .returning();
    return newTutorial;
  }

  async updateTutorial(id: number, data: Partial<InsertTutorial>): Promise<Tutorial> {
    const [updated] = await db
      .update(tutorials)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tutorials.id, id))
      .returning();
    return updated;
  }

  async deleteTutorial(id: number): Promise<void> {
    await db.delete(tutorials).where(eq(tutorials.id, id));
  }

  async markTutorialAsOutdated(id: number): Promise<Tutorial> {
    const [updated] = await db
      .update(tutorials)
      .set({ isOutdated: true, updatedAt: new Date() })
      .where(eq(tutorials.id, id))
      .returning();
    return updated;
  }

  async getUserTutorialProgress(userId: string, tutorialId?: number): Promise<TutorialProgress[]> {
    let query = db
      .select()
      .from(tutorialProgress)
      .where(eq(tutorialProgress.userId, userId));

    if (tutorialId) {
      query = query.where(eq(tutorialProgress.tutorialId, tutorialId));
    }

    return await query.orderBy(desc(tutorialProgress.updatedAt));
  }

  async updateTutorialProgress(userId: string, tutorialId: number, progress: Partial<InsertTutorialProgress>): Promise<TutorialProgress> {
    const existing = await db
      .select()
      .from(tutorialProgress)
      .where(and(
        eq(tutorialProgress.userId, userId),
        eq(tutorialProgress.tutorialId, tutorialId)
      ))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(tutorialProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(and(
          eq(tutorialProgress.userId, userId),
          eq(tutorialProgress.tutorialId, tutorialId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(tutorialProgress)
        .values({
          userId,
          tutorialId,
          ...progress
        })
        .returning();
      return created;
    }
  }

  async completeTutorial(userId: string, tutorialId: number): Promise<TutorialProgress> {
    return this.updateTutorialProgress(userId, tutorialId, {
      completed: true,
      completedAt: new Date()
    });
  }

  async addTutorialFeedback(feedback: InsertTutorialFeedback): Promise<TutorialFeedback> {
    const [newFeedback] = await db
      .insert(tutorialFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getTutorialFeedback(tutorialId: number): Promise<(TutorialFeedback & { user: User })[]> {
    const results = await db
      .select()
      .from(tutorialFeedback)
      .leftJoin(users, eq(tutorialFeedback.userId, users.id))
      .where(eq(tutorialFeedback.tutorialId, tutorialId))
      .orderBy(desc(tutorialFeedback.createdAt));

    return results.map(row => ({
      ...row.tutorial_feedback,
      user: row.users!
    })) as (TutorialFeedback & { user: User })[];
  }

  async searchTutorials(query: string, userRole?: string): Promise<(Tutorial & { category: TutorialCategory })[]> {
    let dbQuery = db
      .select()
      .from(tutorials)
      .leftJoin(tutorialCategories, eq(tutorials.categoryId, tutorialCategories.id))
      .where(and(
        eq(tutorials.isActive, true),
        or(
          ilike(tutorials.title, `%${query}%`),
          ilike(tutorials.description, `%${query}%`),
          ilike(tutorials.searchKeywords, `%${query}%`)
        )
      ));

    if (userRole) {
      dbQuery = dbQuery.where(sql`${tutorials.targetRoles} @> ARRAY[${userRole}]`);
    }

    const results = await dbQuery.orderBy(desc(tutorials.createdAt));
    
    return results.map(row => ({
      ...row.tutorials,
      category: row.tutorial_categories!
    })) as (Tutorial & { category: TutorialCategory })[];
  }

  async getRecommendedTutorials(userId: string): Promise<(Tutorial & { category: TutorialCategory })[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    // Get tutorials the user hasn't completed yet, prioritizing new features and their role
    const completedTutorials = await db
      .select({ tutorialId: tutorialProgress.tutorialId })
      .from(tutorialProgress)
      .where(and(
        eq(tutorialProgress.userId, userId),
        eq(tutorialProgress.completed, true)
      ));

    const completedIds = completedTutorials.map(t => t.tutorialId);

    let query = db
      .select()
      .from(tutorials)
      .leftJoin(tutorialCategories, eq(tutorials.categoryId, tutorialCategories.id))
      .where(and(
        eq(tutorials.isActive, true),
        sql`${tutorials.targetRoles} @> ARRAY[${user.role}]`
      ));

    if (completedIds.length > 0) {
      query = query.where(sql`${tutorials.id} NOT IN (${completedIds.join(',')})`);
    }

    const results = await query
      .orderBy(desc(tutorials.isNewFeature), tutorials.difficulty, tutorials.estimatedTime)
      .limit(10);
    
    return results.map(row => ({
      ...row.tutorials,
      category: row.tutorial_categories!
    })) as (Tutorial & { category: TutorialCategory })[];
  }
}

export const storage = new DatabaseStorage();
