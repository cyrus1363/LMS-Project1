import {
  organizations as organizationsTable,
  users,
  courses,
  courseModules,
  contentItems,
  courseEnrollments,
  contentProgress,
  discussions,
  discussionPosts,
  chatConversations,
  chatMessages,
  type Organization,
  type User,
  type Course,
  type CourseModule, 
  type ContentItem,
  type CourseEnrollment,
  type ContentProgress,
  type Discussion,
  type DiscussionPost,
  type ChatConversation,
  type ChatMessage,
  type UpsertUser,
  type InsertOrganization,
  type InsertCourse,
  type InsertCourseModule,
  type InsertContentItem,
  type InsertCourseEnrollment,
  type InsertContentProgress,
  type InsertDiscussion,
  type InsertDiscussionPost,
  type InsertChatConversation,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

// Modern LMS Storage Interface
export interface ILMSStorage {
  // Organization Management (Multi-tenant)
  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined>;
  createOrganization(orgData: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, orgData: Partial<InsertOrganization>): Promise<Organization>;
  deleteOrganization(id: number): Promise<void>;
  
  // User Management with proper hierarchy
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  getUsersByOrganization(organizationId: number): Promise<User[]>;
  getUsersByType(userType: "system_owner" | "subscriber_admin" | "teacher" | "facilitator" | "student", organizationId?: number): Promise<User[]>;
  updateUserType(userId: string, userType: "system_owner" | "subscriber_admin" | "teacher" | "facilitator" | "student"): Promise<User>;
  
  // Course Management
  getCourses(organizationId?: number): Promise<(Course & { instructor: User; totalEnrollments: number })[]>;
  getCourse(id: number): Promise<(Course & { instructor: User; modules: CourseModule[] }) | undefined>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  createCourse(courseData: InsertCourse): Promise<Course>;
  updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  publishCourse(id: number, isPublished: boolean): Promise<Course>;
  
  // Course Structure - Modules
  getCourseModules(courseId: number): Promise<(CourseModule & { contentItems: ContentItem[] })[]>;
  getCourseModule(id: number): Promise<CourseModule | undefined>;
  createCourseModule(moduleData: InsertCourseModule): Promise<CourseModule>;
  updateCourseModule(id: number, moduleData: Partial<InsertCourseModule>): Promise<CourseModule>;
  deleteCourseModule(id: number): Promise<void>;
  reorderCourseModules(courseId: number, moduleIds: number[]): Promise<void>;
  
  // Content Management with Rich Media
  getContentItems(moduleId: number): Promise<ContentItem[]>;
  getContentItem(id: number): Promise<ContentItem | undefined>;
  createContentItem(contentData: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, contentData: Partial<InsertContentItem>): Promise<ContentItem>;
  deleteContentItem(id: number): Promise<void>;
  reorderContentItems(moduleId: number, contentIds: number[]): Promise<void>;
  publishContentItem(id: number, isPublished: boolean): Promise<ContentItem>;
  
  // Enrollment & Progress Management
  enrollStudent(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;
  getStudentEnrollments(studentId: string): Promise<(CourseEnrollment & { course: Course })[]>;
  getCourseEnrollments(courseId: number): Promise<(CourseEnrollment & { student: User })[]>;
  updateEnrollmentProgress(enrollmentId: number, progress: number, completed?: boolean): Promise<CourseEnrollment>;
  getStudentProgress(enrollmentId: number): Promise<ContentProgress[]>;
  updateContentProgress(progressData: InsertContentProgress): Promise<ContentProgress>;
  
  // Discussion Forums
  getCourseDiscussions(courseId: number): Promise<(Discussion & { totalPosts: number })[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  createDiscussion(discussionData: InsertDiscussion): Promise<Discussion>;
  getDiscussionPosts(discussionId: number): Promise<(DiscussionPost & { author: User; replies?: DiscussionPost[] })[]>;
  createDiscussionPost(postData: InsertDiscussionPost): Promise<DiscussionPost>;
  
  // AI Chat System
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversations(userId: string): Promise<ChatConversation[]>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateConversationTitle(conversationId: number, title: string): Promise<ChatConversation>;
  
  // Analytics & Dashboard
  getOrganizationStats(organizationId: number): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalEnrollments: number;
    completionRate: number;
  }>;
  getCourseAnalytics(courseId: number): Promise<{
    enrolledStudents: number;
    completionRate: number;
    averageProgress: number;
    averageTimeSpent: number;
  }>;
  getSystemStats(): Promise<{
    totalOrganizations: number;
    totalUsers: number;
    totalCourses: number;
    activeSubscriptions: number;
  }>;
}

export class LMSStorage implements ILMSStorage {
  // Organization Management
  async getOrganizations(): Promise<Organization[]> {
    const organizations = await db.select().from(organizationsTable);
    return organizations;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, id));
    return org;
  }

  async getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.subdomain, subdomain));
    return org;
  }

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizationsTable).values(orgData).returning();
    return org;
  }

  async updateOrganization(id: number, orgData: Partial<InsertOrganization>): Promise<Organization> {
    const [org] = await db
      .update(organizationsTable)
      .set({ ...orgData, updatedAt: new Date() })
      .where(eq(organizationsTable.id, id))
      .returning();
    return org;
  }

  async deleteOrganization(id: number): Promise<void> {
    await db.delete(organizationsTable).where(eq(organizationsTable.id, id));
  }

  // User Management
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

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.organizationId, organizationId));
  }

  async getUsersByType(
    userType: "system_owner" | "subscriber_admin" | "teacher" | "facilitator" | "student", 
    organizationId?: number
  ): Promise<User[]> {
    const conditions = [eq(users.userType, userType)];
    if (organizationId) {
      conditions.push(eq(users.organizationId, organizationId));
    }
    
    return await db
      .select()
      .from(users)
      .where(and(...conditions));
  }

  async updateUserType(
    userId: string, 
    userType: "system_owner" | "subscriber_admin" | "teacher" | "facilitator" | "student"
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Course Management
  async getCourses(organizationId?: number): Promise<(Course & { instructor: User; totalEnrollments: number })[]> {
    let query = db
      .select({
        ...courses,
        instructor: users,
        totalEnrollments: sql<number>`CAST(${courses.totalEnrollments} as INTEGER)`,
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id));

    if (organizationId) {
      query = query.where(eq(courses.organizationId, organizationId));
    }

    return (await query) as (Course & { instructor: User; totalEnrollments: number })[];
  }

  async getCourse(id: number): Promise<(Course & { instructor: User; modules: CourseModule[] }) | undefined> {
    const courseData = await db
      .select({
        ...courses,
        instructor: users,
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(eq(courses.id, id));

    if (!courseData[0]) return undefined;

    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, id))
      .orderBy(courseModules.orderIndex);

    return {
      ...courseData[0],
      modules,
    } as Course & { instructor: User; modules: CourseModule[] };
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.instructorId, instructorId));
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async publishCourse(id: number, isPublished: boolean): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set({ isPublished, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  // Course Modules
  async getCourseModules(courseId: number): Promise<(CourseModule & { contentItems: ContentItem[] })[]> {
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.orderIndex);

    const modulesWithContent = await Promise.all(
      modules.map(async (module) => {
        const contentItems = await db
          .select()
          .from(contentItems)
          .where(eq(contentItems.moduleId, module.id))
          .orderBy(contentItems.orderIndex);
        
        return { ...module, contentItems };
      })
    );

    return modulesWithContent;
  }

  async getCourseModule(id: number): Promise<CourseModule | undefined> {
    const [module] = await db.select().from(courseModules).where(eq(courseModules.id, id));
    return module;
  }

  async createCourseModule(moduleData: InsertCourseModule): Promise<CourseModule> {
    const [module] = await db.insert(courseModules).values(moduleData).returning();
    return module;
  }

  async updateCourseModule(id: number, moduleData: Partial<InsertCourseModule>): Promise<CourseModule> {
    const [module] = await db
      .update(courseModules)
      .set({ ...moduleData, updatedAt: new Date() })
      .where(eq(courseModules.id, id))
      .returning();
    return module;
  }

  async deleteCourseModule(id: number): Promise<void> {
    await db.delete(courseModules).where(eq(courseModules.id, id));
  }

  async reorderCourseModules(courseId: number, moduleIds: number[]): Promise<void> {
    for (let i = 0; i < moduleIds.length; i++) {
      await db
        .update(courseModules)
        .set({ orderIndex: i })
        .where(and(eq(courseModules.id, moduleIds[i]), eq(courseModules.courseId, courseId)));
    }
  }

  // Content Management
  async getContentItems(moduleId: number): Promise<ContentItem[]> {
    return await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.moduleId, moduleId))
      .orderBy(contentItems.orderIndex);
  }

  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return item;
  }

  async createContentItem(contentData: InsertContentItem): Promise<ContentItem> {
    const [item] = await db.insert(contentItems).values(contentData).returning();
    return item;
  }

  async updateContentItem(id: number, contentData: Partial<InsertContentItem>): Promise<ContentItem> {
    const [item] = await db
      .update(contentItems)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(contentItems.id, id))
      .returning();
    return item;
  }

  async deleteContentItem(id: number): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  async reorderContentItems(moduleId: number, contentIds: number[]): Promise<void> {
    for (let i = 0; i < contentIds.length; i++) {
      await db
        .update(contentItems)
        .set({ orderIndex: i })
        .where(and(eq(contentItems.id, contentIds[i]), eq(contentItems.moduleId, moduleId)));
    }
  }

  async publishContentItem(id: number, isPublished: boolean): Promise<ContentItem> {
    const [item] = await db
      .update(contentItems)
      .set({ isPublished, publishedAt: isPublished ? new Date() : null, updatedAt: new Date() })
      .where(eq(contentItems.id, id))
      .returning();
    return item;
  }

  // Enrollment & Progress
  async enrollStudent(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const [enroll] = await db.insert(courseEnrollments).values(enrollment).returning();
    return enroll;
  }

  async getStudentEnrollments(studentId: string): Promise<(CourseEnrollment & { course: Course })[]> {
    const results = await db
      .select({
        ...courseEnrollments,
        course: courses,
      })
      .from(courseEnrollments)
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courseEnrollments.studentId, studentId));

    return results as (CourseEnrollment & { course: Course })[];
  }

  async getCourseEnrollments(courseId: number): Promise<(CourseEnrollment & { student: User })[]> {
    const results = await db
      .select({
        ...courseEnrollments,
        student: users,
      })
      .from(courseEnrollments)
      .leftJoin(users, eq(courseEnrollments.studentId, users.id))
      .where(eq(courseEnrollments.courseId, courseId));

    return results as (CourseEnrollment & { student: User })[];
  }

  async updateEnrollmentProgress(enrollmentId: number, progress: number, completed?: boolean): Promise<CourseEnrollment> {
    const updateData: any = { progress, updatedAt: new Date() };
    if (completed !== undefined) {
      updateData.completedAt = completed ? new Date() : null;
      updateData.status = completed ? 'completed' : 'in_progress';
    }

    const [enrollment] = await db
      .update(courseEnrollments)
      .set(updateData)
      .where(eq(courseEnrollments.id, enrollmentId))
      .returning();
    return enrollment;
  }

  async getStudentProgress(enrollmentId: number): Promise<ContentProgress[]> {
    return await db
      .select()
      .from(contentProgress)
      .where(eq(contentProgress.enrollmentId, enrollmentId));
  }

  async updateContentProgress(progressData: InsertContentProgress): Promise<ContentProgress> {
    const [progress] = await db
      .insert(contentProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [contentProgress.enrollmentId, contentProgress.contentItemId],
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  // Discussion Forums
  async getCourseDiscussions(courseId: number): Promise<(Discussion & { totalPosts: number })[]> {
    const results = await db
      .select({
        ...discussions,
        totalPosts: sql<number>`CAST(${discussions.totalPosts} as INTEGER)`,
      })
      .from(discussions)
      .where(eq(discussions.courseId, courseId));

    return results as (Discussion & { totalPosts: number })[];
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  async createDiscussion(discussionData: InsertDiscussion): Promise<Discussion> {
    const [discussion] = await db.insert(discussions).values(discussionData).returning();
    return discussion;
  }

  async getDiscussionPosts(discussionId: number): Promise<(DiscussionPost & { author: User; replies?: DiscussionPost[] })[]> {
    const posts = await db
      .select({
        ...discussionPosts,
        author: users,
      })
      .from(discussionPosts)
      .leftJoin(users, eq(discussionPosts.authorId, users.id))
      .where(eq(discussionPosts.discussionId, discussionId))
      .orderBy(discussionPosts.createdAt);

    return posts as (DiscussionPost & { author: User })[];
  }

  async createDiscussionPost(postData: InsertDiscussionPost): Promise<DiscussionPost> {
    const [post] = await db.insert(discussionPosts).values(postData).returning();
    return post;
  }

  // AI Chat System
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [chat] = await db.insert(chatConversations).values(conversation).returning();
    return chat;
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
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update conversation timestamp
    await db
      .update(chatConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));
    
    return chatMessage;
  }

  async updateConversationTitle(conversationId: number, title: string): Promise<ChatConversation> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ title })
      .where(eq(chatConversations.id, conversationId))
      .returning();
    return conversation;
  }

  // Analytics & Dashboard
  async getOrganizationStats(organizationId: number): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalEnrollments: number;
    completionRate: number;
  }> {
    const [totalStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.organizationId, organizationId), eq(users.userType, 'student')));

    const [activeCourses] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(and(eq(courses.organizationId, organizationId), eq(courses.isPublished, true)));

    const [totalEnrollments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courses.organizationId, organizationId));

    const [completedEnrollments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(and(eq(courses.organizationId, organizationId), eq(courseEnrollments.status, 'completed')));

    const completionRate = totalEnrollments.count > 0 
      ? (completedEnrollments.count / totalEnrollments.count) * 100 
      : 0;

    return {
      totalStudents: totalStudents.count,
      activeCourses: activeCourses.count,
      totalEnrollments: totalEnrollments.count,
      completionRate: Math.round(completionRate),
    };
  }

  async getCourseAnalytics(courseId: number): Promise<{
    enrolledStudents: number;
    completionRate: number;
    averageProgress: number;
    averageTimeSpent: number;
  }> {
    const [enrolledStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId));

    const [completedStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.courseId, courseId), eq(courseEnrollments.status, 'completed')));

    const [progressData] = await db
      .select({ 
        avgProgress: sql<number>`avg(${courseEnrollments.progress})`,
        avgTimeSpent: sql<number>`avg(${courseEnrollments.timeSpent})`
      })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId));

    const completionRate = enrolledStudents.count > 0 
      ? (completedStudents.count / enrolledStudents.count) * 100 
      : 0;

    return {
      enrolledStudents: enrolledStudents.count,
      completionRate: Math.round(completionRate),
      averageProgress: Math.round(progressData.avgProgress || 0),
      averageTimeSpent: Math.round(progressData.avgTimeSpent || 0),
    };
  }

  async getSystemStats(): Promise<{
    totalOrganizations: number;
    totalUsers: number;
    totalCourses: number;
    activeSubscriptions: number;
  }> {
    const [totalOrganizations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizationsTable);

    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [totalCourses] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);

    const [activeSubscriptions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true));

    return {
      totalOrganizations: totalOrganizations.count,
      totalUsers: totalUsers.count,
      totalCourses: totalCourses.count,
      activeSubscriptions: activeSubscriptions.count,
    };
  }
}

export const lmsStorage = new LMSStorage();