import OpenAI from "openai";
import { db } from "../db";
import { userInteractions, contentPages, classEnrollments, users } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Cache for AI responses to reduce API calls
const aiCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCacheKey(prompt: string, type: string): string {
  return `${type}:${prompt.substring(0, 100)}`;
}

function getFromCache(key: string): any {
  const cached = aiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  return null;
}

function setCache(key: string, response: any): void {
  aiCache.set(key, { response, timestamp: Date.now() });
}

export class AIService {
  // 1. Automated Content Assistance
  async improveContent(content: string): Promise<{
    improved: string;
    suggestions: string[];
    quizQuestions: Array<{
      question: string;
      options: string[];
      correct: number;
    }>;
  }> {
    const cacheKey = getCacheKey(content, "improve");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator. Improve the given content and generate quiz questions. Respond with JSON in this format: { 'improved': 'improved content', 'suggestions': ['suggestion1', 'suggestion2'], 'quizQuestions': [{'question': 'Q1', 'options': ['A', 'B', 'C', 'D'], 'correct': 0}] }"
          },
          {
            role: "user",
            content: `Please improve this educational content and generate 3-5 quiz questions:\n\n${content}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error improving content:", error);
      throw new Error("Failed to improve content with AI");
    }
  }

  // 2. Personalized Learning Paths
  async getPersonalizedRecommendations(userId: string, classId?: number): Promise<{
    recommendations: Array<{
      contentId: number;
      title: string;
      reason: string;
      confidence: number;
    }>;
    learningPath: string[];
    insights: string;
  }> {
    try {
      // Get user's interaction history
      const interactions = await db
        .select({
          contentPageId: userInteractions.contentPageId,
          timeSpent: userInteractions.timeSpent,
          interactionType: userInteractions.interactionType,
          contentTitle: contentPages.title,
          contentType: contentPages.type
        })
        .from(userInteractions)
        .leftJoin(contentPages, eq(userInteractions.contentPageId, contentPages.id))
        .where(classId ? 
          and(eq(userInteractions.userId, userId), eq(userInteractions.classId, classId)) :
          eq(userInteractions.userId, userId)
        )
        .orderBy(desc(userInteractions.createdAt))
        .limit(50);

      // Get similar users' patterns
      const similarPatterns = await db
        .select({
          contentPageId: userInteractions.contentPageId,
          title: contentPages.title,
          count: sql<number>`COUNT(*)`
        })
        .from(userInteractions)
        .leftJoin(contentPages, eq(userInteractions.contentPageId, contentPages.id))
        .where(classId ? eq(userInteractions.classId, classId) : sql`1=1`)
        .groupBy(userInteractions.contentPageId, contentPages.title)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      const cacheKey = getCacheKey(`${userId}-${classId}-${interactions.length}`, "recommendations");
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI learning analytics expert. Analyze user interactions and popular content to provide personalized recommendations. Respond with JSON in this format: { 'recommendations': [{'contentId': 1, 'title': 'title', 'reason': 'why recommended', 'confidence': 0.8}], 'learningPath': ['step1', 'step2'], 'insights': 'learning insights' }"
          },
          {
            role: "user",
            content: `User interactions: ${JSON.stringify(interactions)}\nPopular content: ${JSON.stringify(similarPatterns)}\nProvide personalized learning recommendations.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw new Error("Failed to generate personalized recommendations");
    }
  }

  // 3. AI Chat Tutor
  async chatWithTutor(question: string, classId: number, userId: string): Promise<{
    response: string;
    sources: string[];
    confidence: number;
  }> {
    try {
      // Get relevant content from the class
      const classContent = await db
        .select({
          title: contentPages.title,
          content: contentPages.content,
          type: contentPages.type
        })
        .from(contentPages)
        .where(and(
          eq(contentPages.classId, classId),
          eq(contentPages.isPublished, true)
        ))
        .limit(10);

      const context = classContent
        .map(c => `${c.title} (${c.type}): ${c.content?.replace(/<[^>]*>/g, '').substring(0, 500)}`)
        .join('\n\n');

      const cacheKey = getCacheKey(`${question}-${classId}`, "tutor");
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI tutor for this course. Answer questions based on the course content provided. Be encouraging and educational. If you can't answer from the course content, say so. Respond with JSON: { 'response': 'your answer', 'sources': ['source1', 'source2'], 'confidence': 0.9 }"
          },
          {
            role: "user",
            content: `Course content:\n${context}\n\nStudent question: ${question}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error with AI tutor:", error);
      throw new Error("Failed to get response from AI tutor");
    }
  }

  // 4. Assessment Automation
  async gradeEssay(essay: string, rubric: string, maxScore: number = 100): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    rubricAlignment: Record<string, number>;
  }> {
    const cacheKey = getCacheKey(`${essay.substring(0, 100)}-${rubric}`, "grade");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert essay grader. Grade the essay against the rubric and provide detailed feedback. Respond with JSON: { 'score': 85, 'feedback': 'overall feedback', 'strengths': ['strength1'], 'improvements': ['improvement1'], 'rubricAlignment': {'criteria1': 8, 'criteria2': 9} }`
          },
          {
            role: "user",
            content: `Rubric (max score ${maxScore}):\n${rubric}\n\nEssay to grade:\n${essay}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error grading essay:", error);
      throw new Error("Failed to grade essay with AI");
    }
  }

  // 5. Feedback Analysis
  async analyzeFeedback(feedbackTexts: string[]): Promise<{
    overallSentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    keyThemes: string[];
    summary: string;
    actionItems: string[];
    individualSentiments: Array<{
      text: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      score: number;
    }>;
  }> {
    const combinedText = feedbackTexts.join('\n---\n');
    const cacheKey = getCacheKey(combinedText.substring(0, 200), "feedback");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing educational feedback and sentiment. Analyze the feedback texts and provide insights. Respond with JSON: { 'overallSentiment': 'positive', 'sentimentScore': 0.7, 'keyThemes': ['theme1'], 'summary': 'summary', 'actionItems': ['action1'], 'individualSentiments': [{'text': 'text', 'sentiment': 'positive', 'score': 0.8}] }"
          },
          {
            role: "user",
            content: `Analyze these feedback texts from students/discussions:\n\n${combinedText}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      throw new Error("Failed to analyze feedback with AI");
    }
  }

  // Utility method to get learning insights for a class
  async getClassInsights(classId: number): Promise<{
    engagementLevel: 'high' | 'medium' | 'low';
    commonStruggles: string[];
    recommendations: string[];
    topPerformers: Array<{ userId: string; score: number }>;
  }> {
    try {
      // Get class interaction data
      const interactions = await db
        .select({
          userId: userInteractions.userId,
          timeSpent: userInteractions.timeSpent,
          interactionType: userInteractions.interactionType,
          firstName: users.firstName,
          lastName: users.lastName
        })
        .from(userInteractions)
        .leftJoin(users, eq(userInteractions.userId, users.id))
        .where(eq(userInteractions.classId, classId))
        .limit(100);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze class interaction data to provide insights. Respond with JSON: { 'engagementLevel': 'high', 'commonStruggles': ['struggle1'], 'recommendations': ['rec1'], 'topPerformers': [{'userId': 'id', 'score': 95}] }"
          },
          {
            role: "user",
            content: `Class interaction data: ${JSON.stringify(interactions)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error getting class insights:", error);
      throw new Error("Failed to generate class insights");
    }
  }
}

export const aiService = new AIService();