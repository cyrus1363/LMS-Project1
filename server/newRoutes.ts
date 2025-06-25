import type { Express } from "express";
import { createServer, type Server } from "http";
import { lmsStorage } from "./newStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertCourseModuleSchema, insertContentItemSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check user type and organization access
function requireUserType(userTypes: string[]) {
  return async (req: any, res: any, next: any) => {
    if (!req.user?.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await lmsStorage.getUser(req.user.claims.sub);
    if (!user || !userTypes.includes(user.userType)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.currentUser = user;
    next();
  };
}

function requireOrganizationAccess() {
  return async (req: any, res: any, next: any) => {
    const user = req.currentUser;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // System owners can access any organization
    if (user.userType === "system_owner") {
      return next();
    }

    // Check if user belongs to the organization being accessed
    const orgId = parseInt(req.params.organizationId || req.body.organizationId);
    if (user.organizationId !== orgId) {
      return res.status(403).json({ message: "Access denied to this organization" });
    }

    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // HIPAA Compliance Middleware
  app.use('/api', hipaaAuditMiddleware);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await lmsStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // System Owner Routes (for you)
  app.get('/api/system/stats', 
    isAuthenticated,
    requireUserType(['system_owner']),
    async (req, res) => {
      try {
        const stats = await lmsStorage.getSystemStats();
        res.json(stats);
      } catch (error) {
        console.error("Error fetching system stats:", error);
        res.status(500).json({ message: "Failed to fetch system stats" });
      }
    }
  );

  // Organization Management Routes
  app.get('/api/organizations',
    isAuthenticated,
    requireUserType(['system_owner']),
    async (req, res) => {
      try {
        const organizations = await lmsStorage.getOrganizations();
        res.json(organizations || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        res.status(500).json({ message: "Failed to fetch organizations" });
      }
    }
  );

  // Get specific organization
  app.get('/api/organizations/:id', isAuthenticated, requireUserType(['system_owner']), async (req, res) => {
    try {
      const organizationId = parseInt(req.params.id);
      if (isNaN(organizationId)) {
        return res.status(400).json({ message: 'Invalid organization ID' });
      }
      const organization = await lmsStorage.getOrganization(organizationId);
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      res.status(500).json({ message: 'Failed to fetch organization' });
    }
  });

  // Get organization users
  app.get('/api/organizations/:id/users', isAuthenticated, requireUserType(['system_owner']), async (req, res) => {
    try {
      const organizationId = parseInt(req.params.id);
      if (isNaN(organizationId)) {
        return res.status(400).json({ message: 'Invalid organization ID' });
      }
      const users = await lmsStorage.getUsersByOrganization(organizationId);
      res.json(users || []);
    } catch (error) {
      console.error('Error fetching organization users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get organization courses
  app.get('/api/organizations/:id/courses', isAuthenticated, requireUserType(['system_owner']), async (req, res) => {
    try {
      const organizationId = parseInt(req.params.id);
      const courses = await lmsStorage.getCourses(organizationId);
      res.json(courses || []);
    } catch (error) {
      console.error('Error fetching organization courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.post('/api/organizations',
    isAuthenticated,
    requireUserType(['system_owner']),
    async (req, res) => {
      try {
        const orgData = {
          ...req.body,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const organization = await lmsStorage.createOrganization(orgData);
        res.status(201).json(organization);
      } catch (error) {
        console.error("Error creating organization:", error);
        res.status(500).json({ message: "Failed to create organization" });
      }
    }
  );

  // Course Management Routes
  app.get('/api/courses',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher', 'facilitator', 'student']),
    async (req: any, res) => {
      try {
        const user = req.currentUser;
        const organizationId = user.userType === 'system_owner' ? undefined : user.organizationId;
        const courses = await lmsStorage.getCourses(organizationId);
        res.json(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
      }
    }
  );

  app.get('/api/courses/:id',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher', 'facilitator', 'student']),
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);
        const course = await lmsStorage.getCourse(courseId);
        
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);
      } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ message: "Failed to fetch course" });
      }
    }
  );

  app.post('/api/courses',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const user = req.currentUser;
        const courseData = insertCourseSchema.parse({
          ...req.body,
          organizationId: user.organizationId,
          instructorId: user.id,
        });
        
        const course = await lmsStorage.createCourse(courseData);
        res.status(201).json(course);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid course data", errors: error.errors });
        }
        console.error("Error creating course:", error);
        res.status(500).json({ message: "Failed to create course" });
      }
    }
  );

  app.put('/api/courses/:id',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);
        const course = await lmsStorage.updateCourse(courseId, req.body);
        res.json(course);
      } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Failed to update course" });
      }
    }
  );

  app.delete('/api/courses/:id',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);
        await lmsStorage.deleteCourse(courseId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Failed to delete course" });
      }
    }
  );

  // Course Module Routes
  app.get('/api/courses/:courseId/modules',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        const modules = await lmsStorage.getCourseModules(courseId);
        res.json(modules);
      } catch (error) {
        console.error("Error fetching course modules:", error);
        res.status(500).json({ message: "Failed to fetch course modules" });
      }
    }
  );

  app.post('/api/courses/:courseId/modules',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        const moduleData = insertCourseModuleSchema.parse({
          ...req.body,
          courseId,
        });
        
        const module = await lmsStorage.createCourseModule(moduleData);
        res.status(201).json(module);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid module data", errors: error.errors });
        }
        console.error("Error creating course module:", error);
        res.status(500).json({ message: "Failed to create course module" });
      }
    }
  );

  // Content Management Routes
  app.get('/api/modules/:moduleId/content',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const moduleId = parseInt(req.params.moduleId);
        const contentItems = await lmsStorage.getContentItems(moduleId);
        res.json(contentItems);
      } catch (error) {
        console.error("Error fetching content items:", error);
        res.status(500).json({ message: "Failed to fetch content items" });
      }
    }
  );

  app.post('/api/content',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const user = req.currentUser;
        const contentData = insertContentItemSchema.parse({
          ...req.body,
          authorId: user.id,
        });
        
        const contentItem = await lmsStorage.createContentItem(contentData);
        res.status(201).json(contentItem);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid content data", errors: error.errors });
        }
        console.error("Error creating content item:", error);
        res.status(500).json({ message: "Failed to create content item" });
      }
    }
  );

  app.put('/api/content/:id',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher', 'facilitator']),
    async (req: any, res) => {
      try {
        const contentId = parseInt(req.params.id);
        const contentItem = await lmsStorage.updateContentItem(contentId, req.body);
        res.json(contentItem);
      } catch (error) {
        console.error("Error updating content item:", error);
        res.status(500).json({ message: "Failed to update content item" });
      }
    }
  );

  app.delete('/api/content/:id',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const contentId = parseInt(req.params.id);
        await lmsStorage.deleteContentItem(contentId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting content item:", error);
        res.status(500).json({ message: "Failed to delete content item" });
      }
    }
  );

  app.patch('/api/content/:id/publish',
    isAuthenticated,
    requireUserType(['system_owner', 'subscriber_admin', 'teacher']),
    async (req: any, res) => {
      try {
        const contentId = parseInt(req.params.id);
        const { isPublished } = req.body;
        const contentItem = await lmsStorage.publishContentItem(contentId, isPublished);
        res.json(contentItem);
      } catch (error) {
        console.error("Error updating publish status:", error);
        res.status(500).json({ message: "Failed to update publish status" });
      }
    }
  );

  // Enrollment Routes
  app.post('/api/courses/:courseId/enroll',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        const user = req.currentUser;
        
        const enrollment = await lmsStorage.enrollStudent({
          courseId,
          studentId: user.id,
          enrolledBy: user.id,
          enrollmentType: 'self',
        });
        
        res.status(201).json(enrollment);
      } catch (error) {
        console.error("Error enrolling student:", error);
        res.status(500).json({ message: "Failed to enroll student" });
      }
    }
  );

  app.get('/api/my-enrollments',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const user = req.currentUser;
        const enrollments = await lmsStorage.getStudentEnrollments(user.id);
        res.json(enrollments);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        res.status(500).json({ message: "Failed to fetch enrollments" });
      }
    }
  );

  // Dashboard/Analytics Routes
  app.get('/api/dashboard/stats',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const user = req.currentUser;
        
        if (user.userType === 'system_owner') {
          const stats = await lmsStorage.getSystemStats();
          res.json(stats);
        } else if (user.organizationId) {
          const stats = await lmsStorage.getOrganizationStats(user.organizationId);
          res.json(stats);
        } else {
          res.status(400).json({ message: "No organization associated" });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}