import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertClassSchema, 
  insertContentPageSchema, 
  insertClassEnrollmentSchema,
  insertUserInteractionSchema,
  type User 
} from "@shared/schema";
import { aiService } from "./services/ai";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.resolve(import.meta.dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common educational file types
    const allowedTypes = /\.(mp4|mov|avi|pdf|doc|docx|ppt|pptx|zip|scorm)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Helper to check user permissions
function hasPermission(user: any, requiredRoles: string[]) {
  return requiredRoles.includes(user.claims?.role || 'student');
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!hasPermission(req.user, roles)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      const { role } = req.query;
      const users = role 
        ? await storage.getUsersByRole(role as any)
        : await storage.getUsersByRole('student'); // Default to students
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['admin', 'trainer', 'student'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Dashboard/Analytics routes
  app.get('/api/dashboard/stats', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims?.role || 'student';
      const userId = req.user.claims.sub;
      
      if (userRole === 'trainer') {
        const classes = await storage.getClassesByInstructor(userId);
        res.json(classes);
      } else if (userRole === 'student') {
        const enrollments = await storage.getStudentEnrollments(userId);
        res.json(enrollments.map(e => e.class));
      } else {
        const classes = await storage.getClasses();
        res.json(classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get('/api/classes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const classItem = await storage.getClass(parseInt(id));
      if (!classItem) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classItem);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  app.post('/api/classes', isAuthenticated, requireRole(['admin', 'trainer']), async (req: any, res) => {
    try {
      const validatedData = insertClassSchema.parse({
        ...req.body,
        instructorId: req.user.claims.sub,
      });
      
      const classItem = await storage.createClass(validatedData);
      res.json(classItem);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.patch('/api/classes/:id', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { id } = req.params;
      const classItem = await storage.updateClass(parseInt(id), req.body);
      res.json(classItem);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  app.delete('/api/classes/:id', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClass(parseInt(id));
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Class enrollment routes
  app.post('/api/classes/:id/enroll', isAuthenticated, requireRole(['student']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.claims.sub;
      
      const enrollment = await storage.enrollStudent({
        classId: parseInt(id),
        studentId,
      });
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Failed to enroll student" });
    }
  });

  app.get('/api/classes/:id/enrollments', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { id } = req.params;
      const enrollments = await storage.getClassEnrollments(parseInt(id));
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get('/api/classes/:id/analytics', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { id } = req.params;
      const analytics = await storage.getClassAnalytics(parseInt(id));
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching class analytics:", error);
      res.status(500).json({ message: "Failed to fetch class analytics" });
    }
  });

  // Content routes
  app.get('/api/classes/:id/content', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getContentByClass(parseInt(id));
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get('/api/content/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getContent(parseInt(id));
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post('/api/content', isAuthenticated, requireRole(['admin', 'trainer']), upload.array('files'), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const fileMetadata = files?.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      })) || [];

      const validatedData = insertContentPageSchema.parse({
        ...req.body,
        authorId: req.user.claims.sub,
        classId: parseInt(req.body.classId),
        metadata: {
          files: fileMetadata,
          ...req.body.metadata ? JSON.parse(req.body.metadata) : {},
        },
      });
      
      const content = await storage.createContent(validatedData);
      res.json(content);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  app.patch('/api/content/:id', isAuthenticated, requireRole(['admin', 'trainer']), upload.array('files'), async (req, res) => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      let updateData = { ...req.body };
      
      if (files && files.length > 0) {
        const fileMetadata = files.map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        }));
        
        updateData.metadata = {
          files: fileMetadata,
          ...updateData.metadata ? JSON.parse(updateData.metadata) : {},
        };
      }
      
      const content = await storage.updateContent(parseInt(id), updateData);
      res.json(content);
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  app.delete('/api/content/:id', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContent(parseInt(id));
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Interaction tracking routes
  app.post('/api/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertUserInteractionSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });
      
      const interaction = await storage.createInteraction(validatedData);
      res.json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(500).json({ message: "Failed to create interaction" });
    }
  });

  app.get('/api/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { classId } = req.query;
      
      const interactions = await storage.getUserInteractions(
        userId, 
        classId ? parseInt(classId as string) : undefined
      );
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // File download route
  app.get('/api/files/:filename', isAuthenticated, (req, res) => {
    try {
      const { filename } = req.params;
      const filepath = path.join(uploadDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.download(filepath);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // AI-Powered Features Routes
  
  // 1. Content Assistance - AI content improvement and quiz generation
  app.post('/api/ai/improve-content', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || content.trim().length < 50) {
        return res.status(400).json({ message: "Content must be at least 50 characters long" });
      }

      const result = await aiService.improveContent(content);
      res.json(result);
    } catch (error) {
      console.error("Error improving content:", error);
      res.status(500).json({ message: "Failed to improve content with AI" });
    }
  });

  // 2. Personalized Learning Recommendations
  app.get('/api/ai/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { classId } = req.query;
      
      const result = await aiService.getPersonalizedRecommendations(
        userId, 
        classId ? parseInt(classId as string) : undefined
      );
      res.json(result);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Failed to generate personalized recommendations" });
    }
  });

  // 3. AI Chat Tutor
  app.post('/api/ai/chat-tutor', isAuthenticated, async (req: any, res) => {
    try {
      const { question, classId } = req.body;
      const userId = req.user.claims.sub;
      
      if (!question || !classId) {
        return res.status(400).json({ message: "Question and class ID are required" });
      }

      const result = await aiService.chatWithTutor(question, parseInt(classId), userId);
      
      // Log the interaction for analytics
      await storage.createInteraction({
        userId,
        contentPageId: 0, // Special ID for AI tutor interactions
        classId: parseInt(classId),
        interactionType: "view",
        timeSpent: 0,
        metadata: { 
          type: "ai_tutor", 
          question: question.substring(0, 100),
          confidence: result.confidence 
        }
      });

      res.json(result);
    } catch (error) {
      console.error("Error with AI tutor:", error);
      res.status(500).json({ message: "Failed to get response from AI tutor" });
    }
  });

  // 4. Essay Grading
  app.post('/api/ai/grade-essay', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { essay, rubric, maxScore = 100 } = req.body;
      
      if (!essay || !rubric) {
        return res.status(400).json({ message: "Essay and rubric are required" });
      }

      const result = await aiService.gradeEssay(essay, rubric, maxScore);
      res.json(result);
    } catch (error) {
      console.error("Error grading essay:", error);
      res.status(500).json({ message: "Failed to grade essay with AI" });
    }
  });

  // 5. Feedback Analysis
  app.post('/api/ai/analyze-feedback', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { feedbackTexts } = req.body;
      
      if (!Array.isArray(feedbackTexts) || feedbackTexts.length === 0) {
        return res.status(400).json({ message: "Feedback texts array is required" });
      }

      const result = await aiService.analyzeFeedback(feedbackTexts);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      res.status(500).json({ message: "Failed to analyze feedback with AI" });
    }
  });

  // 6. Class Insights
  app.get('/api/ai/class-insights/:classId', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { classId } = req.params;
      const result = await aiService.getClassInsights(parseInt(classId));
      res.json(result);
    } catch (error) {
      console.error("Error getting class insights:", error);
      res.status(500).json({ message: "Failed to generate class insights" });
    }
  });

  // 7. AI Roleplay Coach - Character-based conversations
  app.post('/api/ai/roleplay', isAuthenticated, async (req: any, res) => {
    try {
      const { message, characterId, conversationHistory } = req.body;
      const userId = req.user.claims.sub;
      
      if (!message || !characterId) {
        return res.status(400).json({ message: "Message and character ID are required" });
      }
      
      const result = await aiService.roleplayConversation(message, characterId, conversationHistory || []);
      
      // Log the roleplay interaction
      await storage.createInteraction({
        userId,
        contentPageId: 0,
        classId: 1, // Default class for roleplay
        interactionType: "view",
        timeSpent: 0,
        metadata: { 
          type: "roleplay", 
          character: characterId,
          message: message.substring(0, 100)
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error("Roleplay conversation error:", error);
      res.status(500).json({ message: "Failed to generate roleplay response" });
    }
  });

  // 8. Roleplay Feedback & Scoring
  app.post('/api/ai/roleplay/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { transcript } = req.body;
      const userId = req.user.claims.sub;
      
      if (!transcript) {
        return res.status(400).json({ message: "Conversation transcript is required" });
      }
      
      const result = await aiService.generateRoleplayFeedback(transcript);
      
      // Store feedback in user interactions
      await storage.createInteraction({
        userId,
        contentPageId: 0,
        classId: 1,
        interactionType: "view",
        timeSpent: 0,
        metadata: { 
          type: "roleplay_feedback",
          scores: result.scores,
          overallScore: result.overallScore
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error("Roleplay feedback error:", error);
      res.status(500).json({ message: "Failed to generate feedback" });
    }
  });

  // 9. Dynamic Content Generator
  app.post('/api/ai/generate-activity', isAuthenticated, requireRole(['admin', 'trainer']), async (req, res) => {
    try {
      const { content, activityType } = req.body;
      
      if (!content || !activityType) {
        return res.status(400).json({ message: "Content and activity type are required" });
      }
      
      const result = await aiService.generateActivity(content, activityType);
      res.json(result);
    } catch (error) {
      console.error("Activity generation error:", error);
      res.status(500).json({ message: "Failed to generate activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
