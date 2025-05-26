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
  // AI Roleplay Coach - Character-based conversations
  async roleplayConversation(
    message: string, 
    characterId: string, 
    conversationHistory: any[] = []
  ): Promise<{
    response: string;
    characterName: string;
    confidence: number;
    tone: string;
  }> {
    const cacheKey = getCacheKey(`roleplay-${characterId}-${message}`, 'roleplay');
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const characters = {
      alex: {
        name: "Alex",
        prompt: `You are Alex, a dominant project lead with these traits:
- Confident & results-driven personality
- Direct communicator who gets straight to the point
- Open to coaching but unaware of negative impact on team
- Focuses heavily on deadlines and deliverables
- Sometimes dismissive of team concerns
- Uses phrases like "Let's focus on what matters" and "We need results"
- Responds with slight resistance to feedback initially but shows willingness to learn`,
        tone: "direct"
      },
      mentor: {
        name: "Sarah",
        prompt: `You are Sarah, an experienced mentor coach with these traits:
- Supportive and encouraging approach
- Asks thoughtful questions to guide discovery
- Patient and understanding of learning challenges
- Uses active listening techniques
- Provides constructive feedback with specific examples
- Helps people reflect on their communication style`,
        tone: "supportive"
      },
      difficult_employee: {
        name: "Jordan",
        prompt: `You are Jordan, a challenging team member with these traits:
- Resistant to change and new processes
- Often provides pushback on decisions
- Has valuable expertise but poor attitude
- Makes passive-aggressive comments
- Needs clear boundaries and expectations
- Can be defensive when receiving feedback`,
        tone: "resistant"
      }
    };

    const character = characters[characterId as keyof typeof characters] || characters.alex;

    const messages = [
      { role: "system", content: character.prompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 300,
        temperature: 0.8
      });

      const result = {
        response: response.choices[0].message.content || "",
        characterName: character.name,
        confidence: 0.9,
        tone: character.tone
      };

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Roleplay conversation error:', error);
      throw new Error('Failed to generate roleplay response');
    }
  }

  // Real-Time Feedback & Scoring - Intrepid-style analysis
  async generateRoleplayFeedback(transcript: string): Promise<{
    overallScore: number;
    scores: {
      clarity: number;
      empathy: number;
      leadership: number;
      communication: number;
    };
    feedback: string;
    specificSuggestions: string[];
  }> {
    const cacheKey = getCacheKey(transcript, "feedback");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: `Analyze this roleplay conversation and provide Intrepid-style scores (0-10) and feedback.
Focus on:
- Clarity: How clear and direct was the communication?
- Empathy: Did they show understanding and emotional intelligence?
- Leadership: Did they demonstrate leadership qualities?
- Communication: Overall communication effectiveness

Provide specific examples and actionable suggestions for improvement.
Format as JSON with scores object and feedback text.`
        }, {
          role: "user",
          content: `Analyze this conversation transcript:\n\n${transcript}`
        }],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      const result = {
        overallScore: Math.round((analysis.scores?.clarity + analysis.scores?.empathy + analysis.scores?.leadership + analysis.scores?.communication) / 4),
        scores: {
          clarity: analysis.scores?.clarity || 5,
          empathy: analysis.scores?.empathy || 5,
          leadership: analysis.scores?.leadership || 5,
          communication: analysis.scores?.communication || 5
        },
        feedback: analysis.feedback || "Good conversation overall.",
        specificSuggestions: analysis.suggestions || []
      };

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Feedback generation error:', error);
      throw new Error('Failed to generate feedback');
    }
  }

  // Dynamic Content Generator - Generate activities from text
  async generateActivity(content: string, activityType: 'quiz' | 'roleplay' | 'discussion'): Promise<{
    title: string;
    description: string;
    activity: any;
    estimatedTime: number;
  }> {
    const cacheKey = getCacheKey(`${activityType}-${content}`, "generate");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const prompts = {
      quiz: `Create a comprehensive quiz based on this content. Include 5-7 multiple choice questions with varying difficulty levels.`,
      roleplay: `Create a roleplay scenario based on this content. Include character descriptions, setting, and specific objectives for the roleplay.`,
      discussion: `Create discussion prompts and activities based on this content. Include thought-provoking questions and group activities.`
    };

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: `${prompts[activityType]} Format response as JSON with title, description, activity object, and estimatedTime in minutes.`
        }, {
          role: "user",
          content: `Generate a ${activityType} activity from this content:\n\n${content}`
        }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Activity generation error:', error);
      throw new Error('Failed to generate activity');
    }
  }

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